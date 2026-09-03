-- Created with Supabase CLI, then ordered after the existing future-dated prerequisites.
-- Everyday button refreshes never resume the historical detail backlog.
create or replace function public.catstays_request_operational_sync(target_cattery_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare connection public.legacy_sync_connections%rowtype; j public.legacy_sync_jobs%rowtype;
 run_id uuid; local_now timestamp; customer_from date; booking_from date;
begin
 if current_user<>'service_role' then raise exception 'Service execution required'; end if;
 if target_cattery_id is distinct from '7f6d029f-b727-4645-83be-db6ec56d1b46'::uuid then raise exception 'Unsupported cattery'; end if;
 select * into connection from public.legacy_sync_connections where cattery_id=target_cattery_id for update;
 if not found or not connection.enabled then raise exception 'Connection is unavailable'; end if;
 select * into j from public.legacy_sync_jobs where cattery_id=target_cattery_id and status='running' order by created_at limit 1 for update;
 if j.id is not null and j.manual_until>now() then
   return jsonb_build_object('jobId',j.id,'alreadyRunning',true,'until',j.manual_until);
 end if;
 if j.lease_until>now() then raise exception 'Previous batch is still finishing'; end if;
 -- Retain the old queue and audit trail. Do not mark unfinished history completed.
 update public.legacy_sync_jobs set status='paused',updated_at=now() where cattery_id=target_cattery_id and status='running';
 local_now:=now() at time zone connection.schedule_timezone;
 select coalesce(max((created_at at time zone connection.schedule_timezone)::date)-1,local_now::date-7)
 into customer_from from public.legacy_sync_jobs
 where cattery_id=target_cattery_id and status='completed' and checkpoint->>'scope'='operational';
 -- Include long current stays and previously pending bookings, not just recent arrivals.
 select least(local_now::date-30,coalesce(min(check_in),local_now::date-30)) into booking_from
 from public.bookings where cattery_id=target_cattery_id and external_source='revelation_pets'
 and (check_out>=local_now::date or status='pending');
 run_id:=public.catstays_create_legacy_import_run(target_cattery_id,'revelation_pets','manual_operational_sync',
   jsonb_build_object('requested_at',now(),'scope','Recent, current and future API bookings; historical backlog retained separately.'));
 perform public.catstays_set_legacy_import_status(run_id,'importing','{}');
 insert into public.legacy_sync_jobs(cattery_id,import_run_id,local_day,request_kind,queue,checkpoint,manual_until,manual_after_change)
 values(target_cattery_id,run_id,local_now::date,'manual',
  jsonb_build_array(jsonb_build_object('from',customer_from::text,'to',(local_now::date+1)::text)),
  jsonb_build_object('scope','operational','bookings_from',booking_from::text,'detail_queue','[]'::jsonb,'processed',0,'warnings',0,'source_pages',0),
  now()+interval '5 minutes',0) returning * into j;
 return jsonb_build_object('jobId',j.id,'alreadyRunning',false,'until',j.manual_until);
end;
$$;
revoke all on function public.catstays_request_operational_sync(uuid) from public,anon,authenticated;
grant execute on function public.catstays_request_operational_sync(uuid) to service_role;
