-- Synthetic rollback-only regression checks for the legacy import functions.
-- Run only after the migration functions exist. No private source files are used.
-- Every synthetic row and role/claim setting below is transaction-local.
begin;
set local lock_timeout = '1s';
set local statement_timeout = '8s';
create temporary table migration_validation_results (test_name text, passed boolean, details jsonb);
grant select, insert on migration_validation_results to authenticated;
select set_config('request.jwt.claim.sub', owner_id::text, true) from public.catteries where id='7f6d029f-b727-4645-83be-db6ec56d1b46';
set local role authenticated;
do $test$
declare
  run_id uuid;
  file_id uuid;
  outcome jsonb;
begin
  begin
    run_id := public.catstays_create_legacy_import_run('7f6d029f-b727-4645-83be-db6ec56d1b46','revelation_pets','validation_only','{}');
    file_id := public.catstays_stage_legacy_source_file(run_id,'validation','synthetic.json',repeat('a',64),2::bigint,1,'{}',null);
    perform public.catstays_stage_legacy_source_file(run_id,'validation','synthetic.json',repeat('a',64),2::bigint,1,'{}',null);
    perform public.catstays_stage_legacy_source_records(file_id,jsonb_build_array(jsonb_build_object('row_number',1,'external_id','validation-only','record_checksum',repeat('b',64),'raw_record',jsonb_build_object('synthetic',true))));
    perform public.catstays_stage_legacy_source_records(file_id,jsonb_build_array(jsonb_build_object('row_number',1,'external_id','validation-only','record_checksum',repeat('b',64),'raw_record',jsonb_build_object('synthetic',true))));
    if (select count(*) from public.legacy_source_files where import_run_id=run_id)<>1 or (select count(*) from public.legacy_source_records where import_run_id=run_id)<>1 then raise exception 'Duplicate source staging'; end if;
    insert into migration_validation_results values ('source staging is repeat-safe',true,'{}');
  exception when others then
    insert into migration_validation_results values ('source staging is repeat-safe',false,jsonb_build_object('state',sqlstate,'error',sqlerrm));
  end;
  begin
    run_id := public.catstays_create_legacy_import_run('7f6d029f-b727-4645-83be-db6ec56d1b46','revelation_pets','validation_only','{}');
    perform public.catstays_set_legacy_import_status(run_id,'ready','{}');
    for counter in 1..2 loop
      outcome := public.catstays_import_legacy_customers(run_id,'[{"customer_name":"MIGRATION VALIDATION ONLY","email":"migration-validation@example.invalid","external_source":"revelation_pets","external_id":"validation-customer-only","legacy_account_balance":-12.34}]');
      if outcome->>'customers'<>'1' then raise exception 'Customer import not counted'; end if;
      outcome := public.catstays_import_legacy_cats(run_id,'[{"cat_name":"VALIDATION CAT","owner_external_id":"validation-customer-only","external_source":"revelation_pets","external_id":"validation-cat-only"}]');
      if outcome->>'cats'<>'1' then raise exception 'Cat import not counted'; end if;
      outcome := public.catstays_import_legacy_bookings(run_id,'[{"external_id":"validation-booking-only","customer_external_id":"validation-customer-only","check_in":"2015-01-01","check_out":"2015-01-02","legacy_amount":100,"legacy_monies_received":75,"legacy_outstanding":25,"status":"checked_out"}]');
      if outcome->>'bookings'<>'1' then raise exception 'Booking import not counted'; end if;
      outcome := public.catstays_import_legacy_payments(run_id,'[{"external_id":"validation-payment-only","booking_external_id":"validation-booking-only","paid_on":"2015-01-01","amount":75,"legacy_deleted":true,"legacy_payment_type":"Cash"}]');
      if outcome->>'payments'<>'1' then raise exception 'Payment import not counted'; end if;
    end loop;
    if (select count(*) from public.customers where legacy_import_run_id=run_id)<>1 or (select count(*) from public.cats where legacy_import_run_id=run_id)<>1 or (select count(*) from public.bookings where legacy_import_run_id=run_id)<>1 or (select count(*) from public.payments where legacy_import_run_id=run_id)<>1 or (select sum(amount) from public.customer_credit_ledger where legacy_import_run_id=run_id)<>-12.34 then raise exception 'Duplicate import or signed balance lost'; end if;
    insert into migration_validation_results values ('customer cat booking payment and signed balance retry',true,'{}');
  exception when others then
    insert into migration_validation_results values ('customer cat booking payment and signed balance retry',false,jsonb_build_object('state',sqlstate,'error',sqlerrm));
  end;
  begin
    perform public.catstays_create_legacy_import_run('00000000-0000-4000-8000-000000000099','revelation_pets');
    insert into migration_validation_results values ('cross-tenant import is denied',false,'{}');
  exception when others then
    insert into migration_validation_results values ('cross-tenant import is denied',sqlerrm='Not authorised to create a legacy import for this cattery.',jsonb_build_object('error',sqlerrm));
  end;
end;
$test$;
reset role;
insert into migration_validation_results select 'anonymous import execution is denied',not has_function_privilege('anon','public.catstays_import_legacy_customers(uuid,jsonb)','EXECUTE'),'{}';
select jsonb_agg(to_jsonb(t)) as validation_results from migration_validation_results t;
rollback;
