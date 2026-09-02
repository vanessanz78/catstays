-- Retain source booking notes and stable original dates during one-way synchronization.
create or replace function public.catstays_import_legacy_bookings(
  target_import_run_id uuid,
  records jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_run public.legacy_import_runs%rowtype;
  imported_count integer := 0;
  invalid_date_count integer := 0;
  unmatched_customer_count integer := 0;
begin
  select * into target_run
  from public.legacy_import_runs
  where id = target_import_run_id;
  if target_run.id is null
    or not public.catstays_can_run_legacy_import(target_run.cattery_id) then
    raise exception 'Not authorised to import bookings for this migration.';
  end if;
  if target_run.status not in ('ready', 'importing') then
    raise exception 'The legacy import must be ready before bookings are imported.';
  end if;
  if jsonb_typeof(records) is distinct from 'array' then
    raise exception 'Legacy booking records must be a JSON array.';
  end if;
  if jsonb_array_length(records) > 1000 then
    raise exception 'Legacy booking batches are limited to 1000 records.';
  end if;

  perform public.catstays_assert_legacy_batch(records, 1000, array['external_id']);
  perform set_config('catstays.legacy_import_run', target_run.id::text, true);

  with source_rows as (
    select * from jsonb_to_recordset(records) as source(
      external_source text,
      external_id text,
      legacy_reference text,
      customer_external_id text,
      customer_match_method text,
      customer_match_confidence numeric,
      possible_customer_external_ids jsonb,
      legacy_customer_name text,
      legacy_pet_names text,
      number_of_cats integer,
      legacy_booking_type text,
      check_in date,
      check_out date,
      check_in_time time,
      check_out_time time,
      legacy_run_name text,
      room_arrangement text,
      status text,
      payment_status text,
      notes text,
      legacy_amount numeric,
      legacy_tax_amount numeric,
      legacy_monies_received numeric,
      legacy_outstanding numeric,
      created_at timestamptz,
      legacy_source text,
      cancellation_reason text,
      cancellation_note text,
      legacy_belongs text,
      legacy_pet_breed text,
      legacy_xero text,
      source_record_checksum text
    )
  ), resolved as (
    select source.*, customer.id as resolved_customer_id
    from source_rows source
    left join public.customers customer
      on customer.cattery_id = target_run.cattery_id
      and customer.external_source = 'revelation_pets'
      and customer.external_id = source.customer_external_id
  ), imported as (
    insert into public.bookings (
      cattery_id,
      customer_id,
      check_in,
      check_out,
      check_in_time,
      check_out_time,
      status,
      payment_status,
      notes,
      total_amount,
      guest_name,
      cat_names,
      number_of_cats,
      room_arrangement,
      cancellation_reason,
      cancellation_note,
      created_at,
      external_source,
      external_id,
      legacy_reference,
      legacy_customer_name,
      legacy_pet_names,
      legacy_booking_type,
      legacy_run_name,
      legacy_source,
      legacy_amount,
      legacy_tax_amount,
      legacy_monies_received,
      legacy_outstanding,
      legacy_import_run_id,
      legacy_metadata
    )
    select
      target_run.cattery_id,
      resolved.resolved_customer_id,
      resolved.check_in,
      resolved.check_out,
      resolved.check_in_time,
      resolved.check_out_time,
      coalesce(nullif(resolved.status, ''), 'confirmed'),
      coalesce(nullif(resolved.payment_status, ''), 'unpaid'),
      nullif(resolved.notes, ''),
      round(coalesce(
        resolved.legacy_amount,
        coalesce(resolved.legacy_monies_received, 0) + coalesce(resolved.legacy_outstanding, 0)
      ), 2),
      case when resolved.resolved_customer_id is null then nullif(resolved.legacy_customer_name, '') end,
      nullif(resolved.legacy_pet_names, ''),
      greatest(coalesce(resolved.number_of_cats, 1), 1),
      case when resolved.room_arrangement = 'separate' then 'separate' else 'shared' end,
      nullif(resolved.cancellation_reason, ''),
      nullif(resolved.cancellation_note, ''),
      coalesce(resolved.created_at, timezone('utc', now())),
      'revelation_pets',
      btrim(resolved.external_id),
      resolved.legacy_reference,
      nullif(resolved.legacy_customer_name, ''),
      nullif(resolved.legacy_pet_names, ''),
      nullif(resolved.legacy_booking_type, ''),
      nullif(resolved.legacy_run_name, ''),
      nullif(resolved.legacy_source, ''),
      resolved.legacy_amount,
      resolved.legacy_tax_amount,
      coalesce(resolved.legacy_monies_received, 0),
      coalesce(resolved.legacy_outstanding, 0),
      target_run.id,
      jsonb_build_object(
        'customer_match_method', resolved.customer_match_method,
        'customer_match_confidence', resolved.customer_match_confidence,
        'possible_customer_external_ids', coalesce(resolved.possible_customer_external_ids, '[]'::jsonb),
        'belongs', resolved.legacy_belongs,
        'pet_breed', resolved.legacy_pet_breed,
        'xero', resolved.legacy_xero,
        'source_record_checksum', resolved.source_record_checksum
      )
    from resolved
    where nullif(resolved.external_id, '') is not null
      and resolved.check_in is not null
      and resolved.check_out is not null
      and resolved.check_out >= resolved.check_in
    on conflict (cattery_id, external_source, external_id)
      where external_source is not null and external_id is not null
    do update set
      customer_id = excluded.customer_id,
      check_in = excluded.check_in,
      check_out = excluded.check_out,
      check_in_time = excluded.check_in_time,
      check_out_time = excluded.check_out_time,
      status = excluded.status,
      payment_status = excluded.payment_status,
      notes = excluded.notes,
      total_amount = excluded.total_amount,
      guest_name = excluded.guest_name,
      cat_names = excluded.cat_names,
      number_of_cats = excluded.number_of_cats,
      room_arrangement = excluded.room_arrangement,
      cancellation_reason = excluded.cancellation_reason,
      cancellation_note = excluded.cancellation_note,
      created_at = excluded.created_at,
      legacy_reference = excluded.legacy_reference,
      legacy_customer_name = excluded.legacy_customer_name,
      legacy_pet_names = excluded.legacy_pet_names,
      legacy_booking_type = excluded.legacy_booking_type,
      legacy_run_name = excluded.legacy_run_name,
      legacy_source = excluded.legacy_source,
      legacy_amount = excluded.legacy_amount,
      legacy_tax_amount = excluded.legacy_tax_amount,
      legacy_monies_received = excluded.legacy_monies_received,
      legacy_outstanding = excluded.legacy_outstanding,
      legacy_import_run_id = excluded.legacy_import_run_id,
      legacy_metadata = excluded.legacy_metadata
    returning 1
  )
  select
    (select count(*) from imported),
    (select count(*) from resolved where check_in is null or check_out is null or check_out < check_in),
    (select count(*) from resolved where resolved_customer_id is null)
  into imported_count, invalid_date_count, unmatched_customer_count;

  with source_rows as (
    select * from jsonb_to_recordset(records) as source(
      external_id text,
      customer_external_id text,
      legacy_customer_name text,
      legacy_pet_names text,
      source_record_checksum text
    )
  )
  insert into public.legacy_reconciliation_issues (
    import_run_id,
    source_record_id,
    cattery_id,
    issue_type,
    severity,
    summary,
    details
  )
  select
    target_run.id,
    source_record.id,
    target_run.cattery_id,
    'unmatched_booking_customer',
    'warning',
    'Historical booking was retained without a confirmed current customer link.',
    jsonb_build_object(
      'booking_reference', source.external_id,
      'customer_name', source.legacy_customer_name,
      'pet_names', source.legacy_pet_names
    )
  from source_rows source
  join public.legacy_source_records source_record
    on source_record.import_run_id = target_run.id
    and source_record.report_type = 'bookings'
    and source_record.record_checksum = source.source_record_checksum
  where nullif(source.customer_external_id, '') is null
  on conflict (import_run_id, source_record_id, issue_type)
    where source_record_id is not null
  do nothing;

  perform set_config('catstays.legacy_import_run', '', true);
  return jsonb_build_object(
    'bookings', imported_count,
    'invalid_dates', invalid_date_count,
    'unmatched_customers', unmatched_customer_count
  );
end;
$$;
create or replace function public.catstays_preserve_legacy_local_edits()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  incoming jsonb := to_jsonb(new);
  prior jsonb;
  baseline jsonb;
  source_snapshot jsonb := '{}'::jsonb;
  overrides jsonb := '{}'::jsonb;
  field_name text;
  fields text[];
  current_run text := current_setting('catstays.legacy_import_run', true);
begin
  if new.external_source is distinct from 'revelation_pets'
    or current_run is null or current_run = ''
    or new.legacy_import_run_id::text is distinct from current_run then
    return new;
  end if;
  fields := case tg_table_name
    when 'customers' then array['name','email','phone','address','notes','legacy_last_booking','legacy_account_balance','legacy_total_spent']
    when 'cats' then array['customer_id','name','breed','age','medical_notes','dietary_requirements']
    when 'bookings' then array['customer_id','check_in','check_out','check_in_time','check_out_time','status','payment_status','total_amount','guest_name','cat_names','number_of_cats','room_arrangement','cancellation_reason','cancellation_note','notes']
    when 'payments' then array['booking_id','customer_id','amount','type','status','payment_method','paid_on','reference']
    when 'customer_credit_ledger' then array['customer_id','amount']
    else array[]::text[]
  end;
  if tg_op = 'UPDATE' then
    -- Preserve the original join/booking date when a later snapshot omits it.
    if tg_table_name in ('customers', 'bookings') then
      new.created_at := old.created_at;
    end if;
    prior := to_jsonb(old);
    baseline := old.legacy_metadata->'_revelation_source';
  end if;
  foreach field_name in array fields loop
    source_snapshot := source_snapshot || jsonb_build_object(field_name, incoming->field_name);
    if tg_op = 'UPDATE' and (
      baseline is null or not baseline ? field_name
      or prior->field_name is distinct from baseline->field_name
    ) then
      overrides := overrides || jsonb_build_object(field_name, prior->field_name);
      if incoming->field_name is distinct from prior->field_name
        and (baseline is null or incoming->field_name is distinct from baseline->field_name) then
        insert into public.legacy_reconciliation_issues(import_run_id,cattery_id,issue_type,severity,summary,details)
        values (new.legacy_import_run_id,new.cattery_id,'sync_field_conflict','warning',
          'A CatStays edit was kept instead of overwriting it with a source change.',
          jsonb_build_object('target_table',tg_table_name,'target_id',new.id,'external_id',new.external_id,
            'field',field_name,'previous_source',baseline->field_name,'catstays_value',prior->field_name,'incoming_source',incoming->field_name))
        on conflict do nothing;
      end if;
    end if;
  end loop;
  new := jsonb_populate_record(new, overrides);
  new.legacy_metadata := coalesce(case when tg_op='UPDATE' then old.legacy_metadata end, '{}'::jsonb)
    || coalesce(new.legacy_metadata, '{}'::jsonb)
    || jsonb_build_object('_revelation_source', source_snapshot);
  return new;
end;
$$;
revoke all on function public.catstays_preserve_legacy_local_edits() from public, anon;
grant execute on function public.catstays_preserve_legacy_local_edits() to authenticated;

