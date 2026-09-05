begin;

-- The application is staff-only through RLS. Remove the unnecessary anonymous
-- table privileges while retaining the authenticated staff dashboard workflow.
revoke all on table public.petcover_applications from anon;
revoke all on table public.petcover_applications from authenticated;
grant select, insert, update, delete on table public.petcover_applications to authenticated;
grant all on table public.petcover_applications to service_role;

-- An observed snapshot is enough to prove that an untouched source booking has
-- already been considered. Unlike the historical reconciliation helper, this
-- deliberately includes previously warned records so they are only revisited
-- when their complete Revelation response actually changes.
create or replace function public.catstays_observed_source_bookings(
  target_cattery_id uuid,
  booking_references text[]
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare result jsonb;
begin
  if current_user <> 'service_role' then
    raise exception 'Service execution required';
  end if;
  if target_cattery_id is distinct from '7f6d029f-b727-4645-83be-db6ec56d1b46'::uuid
     or cardinality(coalesce(booking_references, '{}'::text[])) > 1000 then
    raise exception 'Invalid snapshot scope';
  end if;

  select coalesce(jsonb_object_agg(external_id, record_checksum), '{}'::jsonb)
  into result
  from (
    select distinct on (s.external_id) s.external_id, s.record_checksum
    from public.legacy_source_records s
    join public.legacy_sync_jobs j
      on j.import_run_id = s.import_run_id
     and j.cattery_id = s.cattery_id
    where s.cattery_id = target_cattery_id
      and s.external_id = any(coalesce(booking_references, '{}'::text[]))
      and s.raw_record->>'booking_id' = s.external_id
      and s.raw_record ? 'overnights'
      and (
        (j.phase = 'complete' and j.status = 'completed')
        or (
          j.phase = 'details'
          and j.status in ('running', 'paused')
          and not j.queue @> jsonb_build_array(jsonb_build_object('reference', s.external_id))
        )
      )
    order by s.external_id, s.imported_at desc
  ) observed;

  return result;
end;
$$;

revoke all on function public.catstays_observed_source_bookings(uuid, text[]) from public, anon, authenticated;
grant execute on function public.catstays_observed_source_bookings(uuid, text[]) to service_role;

-- Freeze every pre-cutover queue. Neither the nightly worker nor the button may
-- resume historical or earlier operational reconciliation after this release.
update public.legacy_sync_jobs
set status = 'paused',
    lease_token = null,
    lease_until = null,
    manual_until = null,
    updated_at = now()
where cattery_id = '7f6d029f-b727-4645-83be-db6ec56d1b46'
  and status = 'running'
  and coalesce(checkpoint->>'scope', '') <> 'changes_only';

create or replace function public.catstays_request_operational_sync(target_cattery_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  connection public.legacy_sync_connections%rowtype;
  j public.legacy_sync_jobs%rowtype;
  run_id uuid;
  local_now timestamp;
  customer_from date;
  booking_from date;
begin
  if current_user <> 'service_role' then raise exception 'Service execution required'; end if;
  if target_cattery_id is distinct from '7f6d029f-b727-4645-83be-db6ec56d1b46'::uuid then raise exception 'Unsupported cattery'; end if;

  select * into connection
  from public.legacy_sync_connections
  where cattery_id = target_cattery_id
  for update;
  if not found or not connection.enabled then raise exception 'Connection is unavailable'; end if;

  select * into j
  from public.legacy_sync_jobs
  where cattery_id = target_cattery_id
    and status = 'running'
    and checkpoint->>'scope' = 'changes_only'
  order by created_at
  limit 1
  for update;

  if j.id is not null and j.request_kind = 'manual' and j.manual_until > now() then
    return jsonb_build_object('jobId', j.id, 'alreadyRunning', true, 'until', j.manual_until);
  end if;
  if j.id is not null and j.lease_until > now() then
    raise exception 'Previous batch is still finishing';
  end if;
  if j.id is not null then
    update public.legacy_sync_jobs
    set status = 'paused', manual_until = null, updated_at = now()
    where id = j.id;
  end if;

  local_now := now() at time zone connection.schedule_timezone;
  select coalesce(max(local_day), local_now::date - 1)
  into customer_from
  from public.legacy_sync_jobs
  where cattery_id = target_cattery_id
    and status = 'completed'
    and checkpoint->>'scope' = 'changes_only';
  booking_from := local_now::date;

  run_id := public.catstays_create_legacy_import_run(
    target_cattery_id,
    'revelation_pets',
    'manual_changes_only_sync',
    jsonb_build_object(
      'requested_at', now(),
      'scope', 'Customers updated since the last successful day and bookings arriving today or later; only changed full booking responses are applied.'
    )
  );
  perform public.catstays_set_legacy_import_status(run_id, 'importing', '{}');

  insert into public.legacy_sync_jobs(
    cattery_id, import_run_id, local_day, request_kind, queue, checkpoint,
    manual_until, manual_after_change
  )
  values(
    target_cattery_id,
    run_id,
    local_now::date,
    'manual',
    jsonb_build_array(jsonb_build_object('from', customer_from::text, 'to', (local_now::date + 1)::text)),
    jsonb_build_object(
      'scope', 'changes_only',
      'bookings_from', booking_from::text,
      'detail_queue', '[]'::jsonb,
      'processed', 0,
      'warnings', 0,
      'source_pages', 0
    ),
    now() + interval '5 minutes',
    0
  )
  returning * into j;

  return jsonb_build_object('jobId', j.id, 'alreadyRunning', false, 'until', j.manual_until);
end;
$$;

revoke all on function public.catstays_request_operational_sync(uuid) from public, anon, authenticated;
grant execute on function public.catstays_request_operational_sync(uuid) to service_role;

create or replace function public.catstays_claim_legacy_sync(force_start boolean default false)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  tenant constant uuid := '7f6d029f-b727-4645-83be-db6ec56d1b46';
  j public.legacy_sync_jobs%rowtype;
  connection public.legacy_sync_connections%rowtype;
  local_now timestamp;
  run_id uuid;
  customer_from date;
  booking_from date;
begin
  if current_user <> 'service_role' then raise exception 'Service execution required'; end if;
  select * into connection from public.legacy_sync_connections where cattery_id = tenant for update;
  if not found or not connection.enabled then return null; end if;
  local_now := now() at time zone connection.schedule_timezone;

  select * into j
  from public.legacy_sync_jobs
  where cattery_id = tenant
    and status = 'running'
    and checkpoint->>'scope' = 'changes_only'
  order by created_at
  limit 1
  for update;

  if j.id is not null then
    if j.request_kind = 'manual' then
      -- Only another explicit button step can advance a manual window.
      if not force_start or j.manual_until is null or j.manual_until <= now() then
        if j.lease_until is null or j.lease_until <= now() then
          update public.legacy_sync_jobs set status = 'paused', updated_at = now() where id = j.id;
        end if;
        return null;
      end if;
    elsif j.lease_until > now() then
      return null;
    end if;
  else
    -- Create one scheduled changes-only job just after midnight in the cattery timezone.
    if force_start or local_now::time < '00:01'::time or local_now::time >= '00:11'::time then return null; end if;
    if exists(
      select 1 from public.legacy_sync_jobs
      where cattery_id = tenant
        and request_kind = 'scheduled'
        and local_day = local_now::date
    ) then return null; end if;

    select coalesce(max(local_day), local_now::date - 1)
    into customer_from
    from public.legacy_sync_jobs
    where cattery_id = tenant
      and request_kind = 'scheduled'
      and status = 'completed'
      and checkpoint->>'scope' = 'changes_only';
    booking_from := local_now::date;

    run_id := public.catstays_create_legacy_import_run(
      tenant,
      'revelation_pets',
      'nightly_changes_only_sync',
      jsonb_build_object(
        'requested_at', now(),
        'scope', 'Customers updated since the last successful day and bookings arriving today or later; only changed full booking responses are applied.',
        'schedule_timezone', connection.schedule_timezone
      )
    );
    perform public.catstays_set_legacy_import_status(run_id, 'importing', '{}');

    insert into public.legacy_sync_jobs(
      cattery_id, import_run_id, local_day, request_kind, queue, checkpoint
    )
    values(
      tenant,
      run_id,
      local_now::date,
      'scheduled',
      jsonb_build_array(jsonb_build_object('from', customer_from::text, 'to', (local_now::date + 1)::text)),
      jsonb_build_object(
        'scope', 'changes_only',
        'bookings_from', booking_from::text,
        'detail_queue', '[]'::jsonb,
        'processed', 0,
        'warnings', 0,
        'source_pages', 0
      )
    )
    returning * into j;
  end if;

  if j.lease_until > now() then return null; end if;
  update public.legacy_sync_jobs
  set lease_token = gen_random_uuid(),
      lease_until = now() + interval '3 minutes',
      updated_at = now()
  where id = j.id
  returning * into j;
  return to_jsonb(j);
end;
$$;

revoke all on function public.catstays_claim_legacy_sync(boolean) from public, anon, authenticated;
grant execute on function public.catstays_claim_legacy_sync(boolean) to service_role;

comment on function public.catstays_request_operational_sync(uuid) is
  'Starts a fresh Deloraine changes-only snapshot. Historical and earlier operational queues remain paused.';
comment on function public.catstays_claim_legacy_sync(boolean) is
  'Claims only Deloraine changes-only jobs for manual steps or the nightly schedule.';

commit;
