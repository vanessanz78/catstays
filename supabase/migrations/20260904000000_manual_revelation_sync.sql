-- CLI-created; ordered after the existing future-dated durable-job migration.
begin;
alter table public.legacy_sync_jobs add column request_kind text not null default 'scheduled'
  check (request_kind in ('scheduled','manual'));
alter table public.legacy_sync_jobs drop constraint legacy_sync_jobs_cattery_id_local_day_key;
create unique index legacy_sync_jobs_daily_scheduled_idx on public.legacy_sync_jobs(cattery_id,local_day)
  where request_kind='scheduled';
create function public.catstays_request_legacy_sync(target_cattery_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare connection public.legacy_sync_connections%rowtype; j public.legacy_sync_jobs%rowtype;
  local_now timestamp; run_id uuid;
begin
  if current_user <> 'service_role' then raise exception 'Service execution required'; end if;
  if target_cattery_id is distinct from '7f6d029f-b727-4645-83be-db6ec56d1b46'::uuid then
    raise exception 'This cattery has no configured Revelation worker';
  end if;
  -- Same lock as the nightly claimant: manual requests cannot race the scheduler.
  select * into connection from public.legacy_sync_connections where cattery_id=target_cattery_id for update;
  if not found or not connection.enabled then raise exception 'Revelation connection is paused or unavailable'; end if;
  select * into j from public.legacy_sync_jobs where cattery_id=target_cattery_id and status='running' order by created_at limit 1;
  if j.id is not null then return jsonb_build_object('jobId',j.id,'alreadyRunning',true); end if;
  if exists(select 1 from public.legacy_sync_jobs where cattery_id=target_cattery_id and request_kind='manual' and created_at>now()-interval '10 minutes') then
    raise exception 'Please wait ten minutes before requesting another sync';
  end if;
  local_now:=now() at time zone connection.schedule_timezone;
  run_id:=public.catstays_create_legacy_import_run(target_cattery_id,'revelation_pets','manual_api_sync',
    jsonb_build_object('coverage','API fields only; preserve local edits and export-only fields','requested_at',now()));
  perform public.catstays_set_legacy_import_status(run_id,'importing','{}');
  insert into public.legacy_sync_jobs(cattery_id,import_run_id,local_day,request_kind,queue,checkpoint)
  values(target_cattery_id,run_id,local_now::date,'manual',
    jsonb_build_array(jsonb_build_object('from','2000-01-01','to',(local_now::date+1)::text)),
    jsonb_build_object('detail_queue','[]'::jsonb,'processed',0,'warnings',0,'source_pages',0)) returning * into j;
  return jsonb_build_object('jobId',j.id,'alreadyRunning',false);
end;
$$;
revoke all on function public.catstays_request_legacy_sync(uuid) from public,anon,authenticated;
grant execute on function public.catstays_request_legacy_sync(uuid) to service_role;
commit;
