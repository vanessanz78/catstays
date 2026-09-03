-- CLI-created; ordered after existing future-dated prerequisites.
-- No automatic starts, idle scheduler, or unbounded manual requests.
alter table public.legacy_sync_jobs drop constraint legacy_sync_jobs_status_check;
alter table public.legacy_sync_jobs add constraint legacy_sync_jobs_status_check check(status in ('running','paused','completed','failed'));
alter table public.legacy_sync_jobs add column manual_until timestamptz;
alter table public.legacy_sync_jobs add column manual_after_change bigint not null default 0;
update public.legacy_sync_jobs set status='paused',lease_token=null,lease_until=null,updated_at=now()
where cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46' and status='running';
select cron.alter_job(jobid,active:=false) from cron.job where jobname='catstays-revelation-nightly';

create or replace function public.catstays_request_legacy_sync(target_cattery_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare connection public.legacy_sync_connections%rowtype; j public.legacy_sync_jobs%rowtype; run_id uuid; local_now timestamp; after_change bigint;
begin
 if current_user<>'service_role' then raise exception 'Service execution required'; end if;
 if target_cattery_id is distinct from '7f6d029f-b727-4645-83be-db6ec56d1b46'::uuid then raise exception 'Unsupported cattery'; end if;
 select * into connection from public.legacy_sync_connections where cattery_id=target_cattery_id for update;
 if not found or not connection.enabled then raise exception 'Connection is unavailable'; end if;
 select * into j from public.legacy_sync_jobs where cattery_id=target_cattery_id and status='running' order by created_at limit 1 for update;
 if j.id is not null and j.manual_until>now() then
   return jsonb_build_object('jobId',j.id,'alreadyRunning',true,'until',j.manual_until);
 end if;
 -- Let an in-flight batch finish before another manual window can begin.
 if j.lease_until>now() then raise exception 'Previous batch is still finishing'; end if;
 update public.legacy_sync_jobs set status='paused' where cattery_id=target_cattery_id and status='running';
 select * into j from public.legacy_sync_jobs where cattery_id=target_cattery_id and status='paused' order by created_at desc limit 1 for update;
 if j.id is null then
   if exists(select 1 from public.legacy_sync_jobs where cattery_id=target_cattery_id and created_at>now()-interval '10 minutes') then raise exception 'Please wait before starting another sync'; end if;
   local_now:=now() at time zone connection.schedule_timezone;
   run_id:=public.catstays_create_legacy_import_run(target_cattery_id,'revelation_pets','manual_api_sync',jsonb_build_object('requested_at',now()));
   perform public.catstays_set_legacy_import_status(run_id,'importing','{}');
   insert into public.legacy_sync_jobs(cattery_id,import_run_id,local_day,request_kind,queue,checkpoint)
   values(target_cattery_id,run_id,local_now::date,'manual',jsonb_build_array(jsonb_build_object('from','2000-01-01','to',(local_now::date+1)::text)),jsonb_build_object('detail_queue','[]'::jsonb,'processed',0,'warnings',0,'source_pages',0)) returning * into j;
 end if;
 select coalesce(max(id),0) into after_change from public.legacy_import_changes where cattery_id=target_cattery_id and import_run_id=j.import_run_id;
 update public.legacy_sync_jobs set status='running',request_kind='manual',manual_until=now()+interval '5 minutes',manual_after_change=after_change,lease_token=null,lease_until=null,updated_at=now() where id=j.id returning * into j;
 return jsonb_build_object('jobId',j.id,'alreadyRunning',false,'until',j.manual_until);
end;
$$;

create or replace function public.catstays_claim_legacy_sync(force_start boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare tenant constant uuid:='7f6d029f-b727-4645-83be-db6ec56d1b46'; j public.legacy_sync_jobs%rowtype; connection public.legacy_sync_connections%rowtype;
begin
 if current_user<>'service_role' then raise exception 'Service execution required'; end if;
 -- The old Edge scheduler calls with false and can never start/resume work now.
 if not force_start then return null; end if;
 select * into connection from public.legacy_sync_connections where cattery_id=tenant for update;
 if not found or not connection.enabled then return null; end if;
 select * into j from public.legacy_sync_jobs where cattery_id=tenant and status='running' and request_kind='manual' order by created_at limit 1 for update;
 if j.id is null or j.lease_until>now() then return null; end if;
 if j.manual_until is null or j.manual_until<=now() then
   update public.legacy_sync_jobs set status='paused',updated_at=now() where id=j.id;
   return null;
 end if;
 update public.legacy_sync_jobs set lease_token=gen_random_uuid(),lease_until=now()+interval '3 minutes',updated_at=now() where id=j.id returning * into j;
 return to_jsonb(j);
end;
$$;

-- Count only changes made during this button press, including resumed imports.
create function public.catstays_manual_sync_summary(target_cattery_id uuid,target_run_id uuid,after_change bigint)
returns jsonb language sql stable security invoker set search_path='' as $$
 with changes as (
  select *,row_number() over(partition by target_table,target_id order by id) first_change,
   row_number() over(partition by target_table,target_id order by id desc) last_change
  from public.legacy_import_changes where cattery_id=target_cattery_id and import_run_id=target_run_id and id>after_change
   and target_table in ('bookings','customers','cats','payments')
 ), net as (
  select a.target_table,a.before_record,b.after_record from changes a join changes b using(target_table,target_id) where a.first_change=1 and b.last_change=1
 ), counts as (
  select target_table,count(*) filter(where before_record is null and after_record is not null) added,
   count(*) filter(where before_record is not null and after_record is not null and (before_record-array['updated_at','legacy_metadata','legacy_import_run_id']) is distinct from (after_record-array['updated_at','legacy_metadata','legacy_import_run_id'])) updated
  from net group by target_table
 ) select coalesce(jsonb_object_agg(target_table,jsonb_build_object('added',added,'updated',updated)),'{}'::jsonb) from counts;
$$;
revoke all on function public.catstays_manual_sync_summary(uuid,uuid,bigint) from public,anon,authenticated;
grant execute on function public.catstays_manual_sync_summary(uuid,uuid,bigint) to service_role;
