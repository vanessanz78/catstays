begin;
set local role service_role;
set local request.jwt.claim.role='service_role';
do $$
declare tenant constant uuid:='7f6d029f-b727-4645-83be-db6ec56d1b46'; a jsonb; b jsonb; saved_queue jsonb; old_id uuid; j public.legacy_sync_jobs%rowtype;
begin
 if exists(select 1 from public.legacy_sync_jobs where cattery_id=tenant and (manual_until>now() or lease_until>now()) and status='running') then raise exception 'Wait for the real manual window to finish before rehearsal'; end if;
 if public.catstays_claim_legacy_sync(false) is not null then raise exception 'Automatic worker started'; end if;
 select id,queue into old_id,saved_queue from public.legacy_sync_jobs where cattery_id=tenant order by created_at desc limit 1;
 a:=public.catstays_request_operational_sync(tenant);
 b:=public.catstays_request_operational_sync(tenant);
 if a->>'jobId'=old_id::text then raise exception 'Resumed old snapshot'; end if;
 if a->>'jobId'<>b->>'jobId' or not (b->>'alreadyRunning')::boolean or a->>'until'<>b->>'until' then raise exception 'Duplicate click or extended deadline'; end if;
 select * into j from public.legacy_sync_jobs where id=(a->>'jobId')::uuid;
 if j.checkpoint->>'scope'<>'operational' or j.queue->0->>'from'='2000-01-01' then raise exception 'Historical scan selected'; end if;
 if j.manual_until>now()+interval '5 minutes' then raise exception 'Unbounded window'; end if;
 if public.catstays_claim_legacy_sync(false) is not null then raise exception 'Automatic claim resumed work'; end if;
 b:=public.catstays_claim_legacy_sync(true);
 if b->>'id'<>j.id::text then raise exception 'Wrong job claimed'; end if;
 if public.catstays_claim_legacy_sync(true) is not null then raise exception 'Concurrent lease'; end if;
 update public.legacy_sync_jobs set lease_until=null,lease_token=null,manual_until=now()-interval '1 second' where id=j.id;
 if public.catstays_claim_legacy_sync(true) is not null then raise exception 'Expired window ran'; end if;
 b:=public.catstays_request_operational_sync(tenant);
 if b->>'jobId'=a->>'jobId' then raise exception 'Next click did not discover a fresh snapshot'; end if;
 if (select queue from public.legacy_sync_jobs where id=old_id) is distinct from saved_queue then raise exception 'Historical queue altered'; end if;
end; $$;
reset role;
do $$ begin
 if exists(select 1 from cron.job where jobname='catstays-revelation-nightly' and active) then raise exception 'Automatic schedule enabled'; end if;
 if has_function_privilege('anon','public.catstays_request_operational_sync(uuid)','execute') or has_function_privilege('authenticated','public.catstays_request_operational_sync(uuid)','execute') then raise exception 'Privileged RPC exposed'; end if;
end; $$;
select 'operational sync checks passed; test changes rolled back' as result;
rollback;
