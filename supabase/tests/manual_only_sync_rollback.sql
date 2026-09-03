begin;
set local role service_role;
set local request.jwt.claim.role='service_role';
do $$
declare tenant constant uuid:='7f6d029f-b727-4645-83be-db6ec56d1b46'; a jsonb; b jsonb; j public.legacy_sync_jobs%rowtype;
begin
 if public.catstays_claim_legacy_sync(false) is not null then raise exception 'Automatic claim started work'; end if;
 if public.catstays_claim_legacy_sync(true) is not null then raise exception 'Claim without click started work'; end if;
 a:=public.catstays_request_legacy_sync(tenant);
 b:=public.catstays_request_legacy_sync(tenant);
 if a->>'jobId'<>b->>'jobId' or not (b->>'alreadyRunning')::boolean or a->>'until'<>b->>'until' then raise exception 'Repeated click extended window or duplicated job'; end if;
 select * into j from public.legacy_sync_jobs where id=(a->>'jobId')::uuid;
 if j.manual_until>now()+interval '5 minutes' or j.manual_until<=now() then raise exception 'Invalid usage window'; end if;
 if public.catstays_claim_legacy_sync(false) is not null then raise exception 'Scheduler resumed manual work'; end if;
 b:=public.catstays_claim_legacy_sync(true);
 if b->>'id'<>a->>'jobId' then raise exception 'Explicit batch did not claim requested job'; end if;
 if public.catstays_claim_legacy_sync(true) is not null then raise exception 'Concurrent batch claimed held lease'; end if;
 update public.legacy_sync_jobs set lease_until=null,lease_token=null,manual_until=now()-interval '1 second' where id=j.id;
 if public.catstays_claim_legacy_sync(true) is not null then raise exception 'Expired manual window claimed work'; end if;
 if (select status from public.legacy_sync_jobs where id=j.id)<>'paused' then raise exception 'Expired work not paused'; end if;
 b:=public.catstays_request_legacy_sync(tenant);
 if b->>'jobId'<>a->>'jobId' then raise exception 'Resume discarded saved progress'; end if;
 if public.catstays_manual_sync_summary(tenant,j.import_run_id,(select coalesce(max(id),0) from public.legacy_import_changes))<>'{}'::jsonb then raise exception 'Summary included previous changes'; end if;
end;
$$;
reset role;
do $$ begin
 if exists(select 1 from cron.job where jobname='catstays-revelation-nightly' and active) then raise exception 'Automatic schedule active'; end if;
 if has_function_privilege('anon','public.catstays_manual_sync_summary(uuid,uuid,bigint)','execute') or has_function_privilege('authenticated','public.catstays_manual_sync_summary(uuid,uuid,bigint)','execute') then raise exception 'Summary exposed'; end if;
end; $$;
select 'manual-only checks passed; all test changes rolled back' as result;
rollback;
