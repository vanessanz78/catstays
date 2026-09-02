-- Durable, tenant-scoped work checkpoints. Activation is a separate release gate.
create table public.legacy_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id),
  import_run_id uuid not null references public.legacy_import_runs(id),
  local_day date not null,
  status text not null default 'running' check(status in ('running','completed','failed')),
  phase text not null default 'customers' check(phase in ('customers','bookings','details','complete')),
  queue jsonb not null default '[]',
  checkpoint jsonb not null default '{}',
  lease_token uuid,
  lease_until timestamptz,
  failures integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cattery_id,local_day)
);
alter table public.legacy_sync_jobs enable row level security;
revoke all on public.legacy_sync_jobs from public,anon,authenticated;
grant select on public.legacy_sync_jobs to authenticated;
grant all on public.legacy_sync_jobs to service_role;
create policy "Staff read sync progress" on public.legacy_sync_jobs for select to authenticated
using(public.open_home_can_manage_cattery(cattery_id));
create index legacy_sync_jobs_status_idx on public.legacy_sync_jobs(cattery_id,status,local_day);

-- A bounded scheduler may append original response batches during an active run.
do $stage$
declare oid regprocedure; definition text;
begin
 foreach oid in array array['public.catstays_stage_legacy_source_file(uuid,text,text,text,bigint,integer,jsonb,text)'::regprocedure,
   'public.catstays_stage_legacy_source_records(uuid,jsonb)'::regprocedure] loop
   definition:=pg_get_functiondef(oid);
   definition:=replace(definition, $$target_run.status not in ('staging', 'dry_run')$$,
     $$target_run.status not in ('staging', 'dry_run', 'importing')$$);
   execute definition;
 end loop;
end;
$stage$;

create function public.catstays_claim_legacy_sync(force_start boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare tenant constant uuid:='7f6d029f-b727-4645-83be-db6ec56d1b46'; j public.legacy_sync_jobs%rowtype;
  connection public.legacy_sync_connections%rowtype; local_now timestamp; run_id uuid;
begin
 if current_user <> 'service_role' then raise exception 'Service execution required'; end if;
 select * into connection from public.legacy_sync_connections where cattery_id=tenant for update;
 if not found or not connection.enabled then return null; end if;
 local_now:=now() at time zone connection.schedule_timezone;
 select * into j from public.legacy_sync_jobs where cattery_id=tenant and status='running'
 order by created_at limit 1 for update;
 if j.id is null then
   if not force_start and local_now::time < '00:01'::time then return null; end if;
   if exists(select 1 from public.legacy_sync_jobs where cattery_id=tenant and local_day=local_now::date) then return null; end if;
   run_id:=public.catstays_create_legacy_import_run(tenant,'revelation_pets','nightly_api_sync',
      jsonb_build_object('coverage','Documented API fields only; export-only fields retain their last imported snapshot.','local_day',local_now::date));
   perform public.catstays_set_legacy_import_status(run_id,'importing','{}');
   insert into public.legacy_sync_jobs(cattery_id,import_run_id,local_day,queue,checkpoint)
   values(tenant,run_id,local_now::date,jsonb_build_array(jsonb_build_object('from','2000-01-01','to',(local_now::date+1)::text)),
     jsonb_build_object('detail_queue','[]'::jsonb,'processed',0,'warnings',0,'source_pages',0)) returning * into j;
 end if;
 if j.lease_until > now() then return null; end if;
 update public.legacy_sync_jobs set lease_token=gen_random_uuid(),lease_until=now()+interval '3 minutes',updated_at=now()
 where id=j.id returning * into j;
 return to_jsonb(j);
end;
$$;
revoke all on function public.catstays_claim_legacy_sync(boolean) from public,anon,authenticated;
grant execute on function public.catstays_claim_legacy_sync(boolean) to service_role;

create function public.catstays_checkpoint_legacy_sync(job_id uuid,token uuid,next_phase text,next_queue jsonb,next_checkpoint jsonb,failure text default null)
returns void language plpgsql security invoker set search_path='' as $$
declare j public.legacy_sync_jobs%rowtype;
begin
 if current_user <> 'service_role' then raise exception 'Service execution required'; end if;
 select * into j from public.legacy_sync_jobs where id=job_id and lease_token=token
   and cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46' and status='running' for update;
 if j.id is null then raise exception 'Stale sync lease'; end if;
 if failure is not null then
   update public.legacy_sync_jobs set failures=failures+1,last_error=left(failure,500),lease_until=null,lease_token=null,
     status=case when failures+1>=3 then 'failed' else 'running' end,updated_at=now() where id=j.id;
   if j.failures+1>=3 then perform public.catstays_set_legacy_import_status(j.import_run_id,'failed',jsonb_build_object('error',left(failure,500))); end if;
   return;
 end if;
 if next_phase not in ('customers','bookings','details','complete') or jsonb_typeof(next_queue) <> 'array' then raise exception 'Invalid checkpoint'; end if;
 update public.legacy_sync_jobs set phase=next_phase,queue=next_queue,checkpoint=next_checkpoint,failures=0,last_error=null,
   lease_until=null,lease_token=null,status=case when next_phase='complete' then 'completed' else 'running' end,updated_at=now() where id=j.id;
 if next_phase='complete' then
   perform public.catstays_set_legacy_import_status(j.import_run_id,'imported',next_checkpoint);
   update public.legacy_sync_connections set last_success_at=now(),updated_at=now() where cattery_id=j.cattery_id;
 end if;
end;
$$;
revoke all on function public.catstays_checkpoint_legacy_sync(uuid,uuid,text,jsonb,jsonb,text) from public,anon,authenticated;
grant execute on function public.catstays_checkpoint_legacy_sync(uuid,uuid,text,jsonb,jsonb,text) to service_role;
