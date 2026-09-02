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

do $safety$
declare
  run_id uuid;
  test_customer_id uuid;
  payload jsonb;
  item jsonb;
  prior_count integer;
  denied boolean;
  outcome jsonb;
begin
  run_id := public.catstays_create_legacy_import_run('7f6d029f-b727-4645-83be-db6ec56d1b46','revelation_pets','safety_validation','{}');
  perform public.catstays_set_legacy_import_status(run_id,'ready','{}');

  -- All malformed identity batches fail before any writes.
  foreach item in array array[null::jsonb,'null'::jsonb,'{}'::jsonb,'[null]'::jsonb,
    '[{}]'::jsonb,'[{"external_id":" "}]'::jsonb,
    '[{"external_id":"same"},{"external_id":" same "}]'::jsonb,
    '[{"external_id":"id","external_source":"another_system"}]'::jsonb] loop
    denied := false;
    begin perform public.catstays_assert_legacy_batch(item,1000,array['external_id']);
    exception when others then denied := true; end;
    if not denied then raise exception 'Invalid identity batch accepted'; end if;
  end loop;
  insert into migration_validation_results values ('null malformed missing duplicate and wrong-source IDs rejected',true,'{}');

  payload := '[{"customer_name":"SAFETY ONLY","email":"","external_id":"safety-customer","phone":"source-1","legacy_account_balance":50,"created_at":"2015-01-01T00:00:00Z"}]';
  outcome := public.catstays_import_legacy_customers(run_id,payload);
  select id into test_customer_id from public.customers where cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46' and external_source='revelation_pets' and external_id='safety-customer';
  if test_customer_id is null or outcome->>'customers'<>'1' then raise exception 'Customer without email lost'; end if;
  insert into migration_validation_results values ('customer without email retained without fake email',true,'{}');

  perform public.catstays_import_legacy_customers(run_id,jsonb_set(payload,'{0,phone}','"source-2"'));
  if (select phone from public.customers where id=test_customer_id)<>'source-2' then raise exception 'Source-only change failed'; end if;
  insert into migration_validation_results values ('source-only changes propagate',true,'{}');

  -- A regular CatStays edit occurs outside import context.
  update public.customers set phone='local-edit',notes='keep my note' where id=test_customer_id;
  payload := jsonb_set(payload,'{0,phone}','"source-3"');
  perform public.catstays_import_legacy_customers(run_id,payload);
  if (select phone from public.customers where id=test_customer_id)<>'local-edit'
    or (select notes from public.customers where id=test_customer_id)<>'keep my note'
    or not exists(select 1 from public.legacy_reconciliation_issues where import_run_id=run_id and issue_type='sync_field_conflict' and details->>'field'='phone') then
    raise exception 'Local edit overwritten or conflict unreported';
  end if;
  insert into migration_validation_results values ('local edit preserved and source conflict recorded',true,'{}');

  select count(*) into prior_count from public.legacy_reconciliation_issues where import_run_id=run_id and issue_type='sync_field_conflict';
  perform public.catstays_import_legacy_customers(run_id,payload);
  if (select count(*) from public.legacy_reconciliation_issues where import_run_id=run_id and issue_type='sync_field_conflict')<>prior_count then
    raise exception 'Retry duplicated conflict';
  end if;
  insert into migration_validation_results values ('conflict retry does not duplicate issues',true,'{}');

  payload := jsonb_set(payload,'{0,legacy_account_balance}','0');
  perform public.catstays_import_legacy_customers(run_id,payload);
  if (select sum(amount) from public.customer_credit_ledger where customer_credit_ledger.customer_id=test_customer_id)<>0 then
    raise exception 'Imported balance did not clear to zero';
  end if;
  insert into migration_validation_results values ('source balance clears to zero',true,'{}');

  denied := false;
  begin
    insert into public.customer_credit_ledger(cattery_id,customer_id,entry_type,amount)
    values('7f6d029f-b727-4645-83be-db6ec56d1b46',test_customer_id,'issued',0);
  exception when check_violation then denied := true;
  end;
  if not denied then raise exception 'Native zero credit unexpectedly allowed'; end if;
  insert into migration_validation_results values ('native nonzero credit constraint preserved',true,'{}');

  denied := false;
  begin perform public.catstays_import_legacy_cats(run_id,'[{"cat_name":"bad identity","owner_external_id":"safety-customer"}]');
  exception when others then denied := true; end;
  if not denied then raise exception 'Cat without source ID accepted'; end if;
  insert into migration_validation_results values ('cat import rejects missing source ID',true,'{}');

  denied := false;
  begin perform public.catstays_import_legacy_payments(run_id,'[{"external_id":"bad-amount","paid_on":"2015-01-01"}]');
  exception when others then denied := true; end;
  if not denied then raise exception 'Missing payment amount replaced by zero'; end if;
  insert into migration_validation_results values ('missing payment amount rejected',true,'{}');

  perform public.catstays_import_legacy_payments(run_id,'[{"external_id":"deleted-payment-safety","paid_on":"2015-01-01","amount":50,"legacy_deleted":true}]');
  if not exists(select 1 from public.payments where legacy_import_run_id=run_id and external_id='deleted-payment-safety' and status='deleted' and legacy_deleted) then
    raise exception 'Deleted payment marked active';
  end if;
  insert into migration_validation_results values ('deleted payment retained as deleted not completed',true,'{}');

  if coalesce(current_setting('catstays.legacy_import_run',true),'')<>'' then raise exception 'Import context leaked'; end if;
  insert into migration_validation_results values ('import context cleared for normal edits',true,'{}');
exception when others then
  insert into migration_validation_results values ('safety suite',false,jsonb_build_object('state',sqlstate,'error',sqlerrm));
end;
$safety$;

reset role;
insert into migration_validation_results select 'anonymous import execution is denied',not has_function_privilege('anon','public.catstays_import_legacy_customers(uuid,jsonb)','EXECUTE'),'{}';
select jsonb_agg(to_jsonb(t)) as validation_results from migration_validation_results t;
rollback;
