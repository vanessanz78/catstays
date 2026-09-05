-- Restore the Deloraine-only nightly operational sync after the manual-only release.
-- The scheduled worker advances the current/incremental window and never restarts
-- the historical detail backlog.
create or replace function public.catstays_claim_legacy_sync(force_start boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 tenant constant uuid:='7f6d029f-b727-4645-83be-db6ec56d1b46';
 j public.legacy_sync_jobs%rowtype;
 connection public.legacy_sync_connections%rowtype;
 local_now timestamp;
 run_id uuid;
 customer_from date;
 booking_from date;
begin
 if current_user<>'service_role' then raise exception 'Service execution required'; end if;
 select * into connection from public.legacy_sync_connections where cattery_id=tenant for update;
 if not found or not connection.enabled then return null; end if;
 local_now:=now() at time zone connection.schedule_timezone;

 select * into j
 from public.legacy_sync_jobs
 where cattery_id=tenant and status='running'
 order by created_at limit 1 for update;

 if j.id is not null then
   if j.request_kind='manual' then
     -- Button-triggered jobs can only be resumed by the button endpoint.
     if not force_start or j.manual_until is null or j.manual_until<=now() then
       if j.lease_until is null or j.lease_until<=now() then
         update public.legacy_sync_jobs set status='paused',updated_at=now() where id=j.id;
       end if;
       return null;
     end if;
   elsif j.lease_until>now() then
     return null;
   end if;
 else
   -- Cron checks every minute, but only the first ten minutes after 00:01
   -- local time may create the day's scheduled job. This also prevents a
   -- daytime activation from starting an extra run immediately.
   if force_start or local_now::time < '00:01'::time or local_now::time >= '00:11'::time then return null; end if;
   if exists(
     select 1 from public.legacy_sync_jobs
     where cattery_id=tenant and request_kind='scheduled' and local_day=local_now::date
   ) then return null; end if;

   select coalesce(
     max((created_at at time zone connection.schedule_timezone)::date)-1,
     local_now::date-7
   )
   into customer_from
   from public.legacy_sync_jobs
   where cattery_id=tenant
     and request_kind='scheduled'
     and status='completed'
     and checkpoint->>'scope'='operational';

   select least(local_now::date-30,coalesce(min(check_in),local_now::date-30))
   into booking_from
   from public.bookings
   where cattery_id=tenant
     and external_source='revelation_pets'
     and (check_out>=local_now::date or status='pending');

   run_id:=public.catstays_create_legacy_import_run(
     tenant,'revelation_pets','nightly_operational_sync',
     jsonb_build_object(
       'requested_at',now(),
       'scope','Recent, current and future API bookings; historical backlog retained separately.',
       'schedule_timezone',connection.schedule_timezone
     )
   );
   perform public.catstays_set_legacy_import_status(run_id,'importing','{}');
   insert into public.legacy_sync_jobs(
     cattery_id,import_run_id,local_day,request_kind,queue,checkpoint
   )
   values(
     tenant,run_id,local_now::date,'scheduled',
     jsonb_build_array(jsonb_build_object('from',customer_from::text,'to',(local_now::date+1)::text)),
     jsonb_build_object(
       'scope','operational',
       'bookings_from',booking_from::text,
       'detail_queue','[]'::jsonb,
       'processed',0,
       'warnings',0,
       'source_pages',0
     )
   ) returning * into j;
 end if;

 if j.lease_until>now() then return null; end if;
 update public.legacy_sync_jobs
 set lease_token=gen_random_uuid(),lease_until=now()+interval '3 minutes',updated_at=now()
 where id=j.id
 returning * into j;
 return to_jsonb(j);
end;
$$;

revoke all on function public.catstays_claim_legacy_sync(boolean) from public,anon,authenticated;
grant execute on function public.catstays_claim_legacy_sync(boolean) to service_role;

do $schedule$
declare job_id bigint;
begin
 if not exists(select 1 from vault.secrets where name='catstays_revelation_sync_trigger') then
   raise exception 'Sync trigger secret is missing';
 end if;
 if not exists(
   select 1 from public.legacy_sync_connections
   where cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46' and enabled
 ) then
   raise exception 'Source connection is not enabled';
 end if;
 select jobid into job_id from cron.job where jobname='catstays-revelation-nightly';
 if job_id is null then
   perform cron.schedule('catstays-revelation-nightly','* * * * *',$job$
     select net.http_post(
       url:='https://iwyoezwqorddkmqnjbif.supabase.co/functions/v1/revelation-sync',
       headers:=jsonb_build_object(
         'Content-Type','application/json',
         'x-sync-token',(select decrypted_secret from vault.decrypted_secrets where name='catstays_revelation_sync_trigger')
       ),
       body:='{}'::jsonb,timeout_milliseconds:=110000
     ) where exists(
       select 1 from public.legacy_sync_connections c
       where c.cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46' and c.enabled
     );
   $job$);
 else
   perform cron.alter_job(job_id,active:=true);
 end if;
end
$schedule$;