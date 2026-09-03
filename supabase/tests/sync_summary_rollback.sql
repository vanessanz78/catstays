begin;
set local statement_timeout='15s';
select set_config('request.jwt.claim.role','service_role',true);
set local role service_role;
do $$
declare tenant uuid:='7f6d029f-b727-4645-83be-db6ec56d1b46'; run_id uuid; added_id uuid:=gen_random_uuid(); result jsonb;
begin
  run_id:=public.catstays_create_legacy_import_run(tenant,'revelation_pets','summary_test','{}');
  insert into public.legacy_import_changes(import_run_id,cattery_id,target_table,target_id,operation,before_record,after_record) values
    (run_id,tenant,'bookings',added_id,'INSERT',null,'{"total_amount":69}'),
    (run_id,tenant,'bookings',added_id,'UPDATE','{"total_amount":69}','{"total_amount":70}'),
    (run_id,tenant,'bookings',gen_random_uuid(),'UPDATE','{"total_amount":100}','{"total_amount":120}'),
    (run_id,tenant,'customers',gen_random_uuid(),'UPDATE','{"name":"Test","legacy_import_run_id":"old","legacy_metadata":{},"updated_at":"old"}','{"name":"Test","legacy_import_run_id":"new","legacy_metadata":{"new":true},"updated_at":"new"}');
  result:=public.catstays_sync_change_summary(tenant,run_id);
  if result->'bookings' is distinct from '{"added":1,"updated":1}'::jsonb then raise exception 'Incorrect deduplicated booking counts: %',result; end if;
  if result->'customers' is distinct from '{"added":0,"updated":0}'::jsonb then raise exception 'Metadata incorrectly counted as a change'; end if;
  if public.catstays_sync_change_summary(gen_random_uuid(),run_id) is distinct from '{}'::jsonb then raise exception 'Cross-tenant data leak'; end if;
end $$;
reset role;
do $$ begin
  if has_function_privilege('anon','public.catstays_sync_change_summary(uuid,uuid)','execute') or has_function_privilege('authenticated','public.catstays_sync_change_summary(uuid,uuid)','execute') then raise exception 'Untrusted summary access'; end if;
end $$;
select '4 summary checks passed; synthetic rows rolled back' as result;
rollback;
