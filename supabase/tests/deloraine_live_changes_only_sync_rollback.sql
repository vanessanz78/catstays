begin;

set local role service_role;
set local request.jwt.claim.role = 'service_role';

do $$
declare
  tenant constant uuid := '7f6d029f-b727-4645-83be-db6ec56d1b46';
  requested jsonb;
  j public.legacy_sync_jobs%rowtype;
  local_today date;
begin
  if exists (
    select 1 from public.legacy_sync_jobs
    where cattery_id = tenant
      and status = 'running'
      and checkpoint->>'scope' = 'changes_only'
      and (manual_until > now() or lease_until > now())
  ) then
    raise exception 'Wait for the real changes-only job before rehearsal';
  end if;

  if (select website_settings->>'bookingMode' from public.catteries where id = tenant) <> 'live' then
    raise exception 'Public booking mode is not live';
  end if;
  if exists (
    select 1 from public.legacy_sync_jobs
    where cattery_id = tenant and status = 'running' and coalesce(checkpoint->>'scope', '') <> 'changes_only'
  ) then
    raise exception 'An older queue can still run';
  end if;

  requested := public.catstays_request_operational_sync(tenant);
  select * into j
  from public.legacy_sync_jobs
  where id = (requested->>'jobId')::uuid;
  select (now() at time zone 'Pacific/Auckland')::date into local_today;

  if j.checkpoint->>'scope' <> 'changes_only' then raise exception 'Wrong sync scope'; end if;
  if (j.checkpoint->>'bookings_from')::date <> local_today then raise exception 'Past bookings selected'; end if;
  if (j.queue->0->>'from')::date < local_today - 1 then raise exception 'Historical customer range selected'; end if;
  if j.request_kind <> 'manual' or j.manual_until > now() + interval '5 minutes' then raise exception 'Manual window is not bounded'; end if;
  if public.catstays_claim_legacy_sync(false) is not null then raise exception 'Nightly worker claimed manual work'; end if;
  if (public.catstays_claim_legacy_sync(true)->>'id') <> j.id::text then raise exception 'Button worker claimed the wrong job'; end if;
  if public.catstays_claim_legacy_sync(true) is not null then raise exception 'Concurrent lease was granted'; end if;
  if public.catstays_observed_source_bookings(tenant, '{}'::text[]) <> '{}'::jsonb then raise exception 'Empty observed snapshot is not empty'; end if;
end
$$;

reset role;

do $$
begin
  if has_function_privilege('anon', 'public.catstays_observed_source_bookings(uuid,text[])', 'execute')
     or has_function_privilege('authenticated', 'public.catstays_observed_source_bookings(uuid,text[])', 'execute') then
    raise exception 'Observed snapshot helper is exposed';
  end if;
  if has_table_privilege('anon', 'public.petcover_applications', 'select') then
    raise exception 'Petcover table is exposed to anonymous users';
  end if;
end
$$;

select 'live booking and changes-only sync checks passed; test changes rolled back' as result;
rollback;
