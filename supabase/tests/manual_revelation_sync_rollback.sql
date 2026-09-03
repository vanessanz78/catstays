begin;
set local lock_timeout='1s';
set local statement_timeout='10s';
select set_config('request.jwt.claim.role','service_role',true);
create temporary table manual_sync_checks(name text,passed boolean);
grant all on manual_sync_checks to service_role;
set local role service_role;
do $$
declare first_job jsonb; second_job jsonb; leased jsonb; denied boolean;
begin
  if exists(select 1 from public.legacy_sync_jobs where status='running' and cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46') then raise exception 'Active job: defer rollback test'; end if;
  first_job:=public.catstays_request_legacy_sync('7f6d029f-b727-4645-83be-db6ec56d1b46');
  if (first_job->>'alreadyRunning')::boolean then raise exception 'Did not create job'; end if;
  insert into manual_sync_checks values('new manual job allowed after completed daily job',true);
  second_job:=public.catstays_request_legacy_sync('7f6d029f-b727-4645-83be-db6ec56d1b46');
  if first_job->>'jobId'<>second_job->>'jobId' or not (second_job->>'alreadyRunning')::boolean then raise exception 'Duplicate job'; end if;
  insert into manual_sync_checks values('repeat click reuses running job',true);
  leased:=public.catstays_claim_legacy_sync(false);
  if leased->>'id'<>first_job->>'jobId' then raise exception 'Worker did not claim manual job'; end if;
  if public.catstays_claim_legacy_sync(false) is not null then raise exception 'Concurrent lease'; end if;
  insert into manual_sync_checks values('existing worker claims manual job exclusively',true);
  perform public.catstays_checkpoint_legacy_sync((leased->>'id')::uuid,(leased->>'lease_token')::uuid,'complete','[]','{}');
  denied:=false;
  begin perform public.catstays_request_legacy_sync('7f6d029f-b727-4645-83be-db6ec56d1b46'); exception when others then denied:=sqlerrm like 'Please wait%'; end;
  if not denied then raise exception 'Cooldown missing'; end if;
  insert into manual_sync_checks values('completed manual job retains ten-minute cooldown',true);
  denied:=false;
  begin perform public.catstays_request_legacy_sync(gen_random_uuid()); exception when others then denied:=sqlerrm='This cattery has no configured Revelation worker'; end;
  if not denied then raise exception 'Wrong tenant accepted'; end if;
  insert into manual_sync_checks values('unconfigured tenant refused',true);
end;
$$;
reset role;
do $$ begin
  if has_function_privilege('anon','public.catstays_request_legacy_sync(uuid)','execute') or has_function_privilege('authenticated','public.catstays_request_legacy_sync(uuid)','execute') then raise exception 'Untrusted execute'; end if;
  insert into manual_sync_checks values('public clients cannot bypass server authorization',true);
end $$;
select * from manual_sync_checks;
rollback;
