-- Run only before scheduler activation. All synthetic jobs are rolled back.
begin;
set local lock_timeout='1s';
set local statement_timeout='8s';
create temporary table sync_validation_results(test_name text,passed boolean);
grant all on sync_validation_results to service_role;
set local role service_role;
do $$
declare j jsonb; second jsonb; denied boolean; file_id uuid;
begin
 if exists(select 1 from public.legacy_sync_jobs where cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46') then raise exception 'Run this test before activation only'; end if;
 j:=public.catstays_claim_legacy_sync(true);
 if j is null or j->>'phase'<>'customers' then raise exception 'No initial job'; end if;
 insert into sync_validation_results values('enabled connection creates tenant-specific job',true);
 second:=public.catstays_claim_legacy_sync(true);
 if second is not null then raise exception 'Concurrent lease accepted'; end if;
 insert into sync_validation_results values('active lease prevents overlapping work',true);
 denied:=false;
 begin perform public.catstays_checkpoint_legacy_sync((j->>'id')::uuid,gen_random_uuid(),'complete','[]','{}');
 exception when others then denied:=sqlerrm='Stale sync lease'; end;
 if not denied then raise exception 'Wrong lease accepted'; end if;
 insert into sync_validation_results values('wrong lease token cannot checkpoint',true);
 file_id:=public.catstays_stage_legacy_source_file((j->>'import_run_id')::uuid,'validation','synthetic.json',repeat('d',64),2::bigint,0,'{}',null);
 perform public.catstays_stage_legacy_source_records(file_id,'[]');
 insert into sync_validation_results values('active run can preserve incremental source batches',true);
 perform public.catstays_checkpoint_legacy_sync((j->>'id')::uuid,(j->>'lease_token')::uuid,'bookings','[{"from":"2000-01-01","to":"2000-01-02"}]','{"processed":0}');
 second:=public.catstays_claim_legacy_sync(true);
 if second->>'phase'<>'bookings' or second->>'id'<>j->>'id' or second->>'lease_token'=j->>'lease_token' then raise exception 'Checkpoint not resumed with new lease'; end if;
 insert into sync_validation_results values('resumes exact persisted phase with fresh lease',true);
 perform public.catstays_checkpoint_legacy_sync((second->>'id')::uuid,(second->>'lease_token')::uuid,'complete','[]','{"processed":1}');
 if (select status from public.legacy_import_runs where id=(j->>'import_run_id')::uuid)<>'imported' then raise exception 'Completion missing'; end if;
 if public.catstays_claim_legacy_sync(true) is not null then raise exception 'Duplicate daily run'; end if;
 insert into sync_validation_results values('completion reconciles run and prevents duplicate day',true);
end;
$$;
reset role;
do $$
begin
 if has_function_privilege('anon','public.catstays_claim_legacy_sync(boolean)','execute')
   or has_function_privilege('authenticated','public.catstays_claim_legacy_sync(boolean)','execute')
   or has_table_privilege('anon','public.legacy_sync_jobs','select') then raise exception 'Untrusted sync permission'; end if;
 insert into sync_validation_results values('untrusted callers cannot start jobs or read private state',true);
end;
$$;
select * from sync_validation_results;
rollback;
