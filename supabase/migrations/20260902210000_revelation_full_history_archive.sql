begin;

-- Lossless archive for the complete Revelation Pets migration. The raw source
-- rows remain available even when a legacy record cannot be mapped safely to
-- a current CatStays customer, cat, booking, or payment.

create table if not exists public.legacy_import_runs (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  source_system text not null,
  import_kind text not null default 'full_history',
  status text not null default 'staging'
    check (status in ('staging', 'dry_run', 'ready', 'importing', 'imported', 'failed', 'rolled_back')),
  source_manifest jsonb not null default '{}'::jsonb,
  reconciliation jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, cattery_id)
);

create table if not exists public.legacy_source_files (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid not null references public.legacy_import_runs(id) on delete cascade,
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  report_type text not null,
  source_file_name text not null,
  source_sha256 text not null check (source_sha256 ~ '^[0-9a-f]{64}$'),
  byte_size bigint not null check (byte_size >= 0),
  row_count integer not null default 0 check (row_count >= 0),
  headline_totals jsonb not null default '{}'::jsonb,
  archive_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint legacy_source_files_run_type_name_unique
    unique (import_run_id, report_type, source_file_name),
  unique (id, cattery_id),
  foreign key (import_run_id, cattery_id)
    references public.legacy_import_runs(id, cattery_id) on delete cascade
);

create table if not exists public.legacy_source_records (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid not null references public.legacy_import_runs(id) on delete cascade,
  source_file_id uuid not null references public.legacy_source_files(id) on delete cascade,
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  source_system text not null,
  report_type text not null,
  row_number integer not null check (row_number > 0),
  external_id text,
  record_checksum text not null check (record_checksum ~ '^[0-9a-f]{64}$'),
  raw_record jsonb not null,
  imported_at timestamptz not null default timezone('utc', now()),
  unique (source_file_id, row_number),
  unique (id, cattery_id),
  foreign key (import_run_id, cattery_id)
    references public.legacy_import_runs(id, cattery_id) on delete cascade,
  foreign key (source_file_id, cattery_id)
    references public.legacy_source_files(id, cattery_id) on delete cascade
);

create table if not exists public.legacy_import_links (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid not null references public.legacy_import_runs(id) on delete cascade,
  source_record_id uuid not null references public.legacy_source_records(id) on delete cascade,
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  target_table text not null
    check (target_table in ('customers', 'cats', 'bookings', 'payments', 'customer_credit_ledger')),
  target_id uuid not null,
  link_method text not null,
  confidence numeric(5,4) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (source_record_id, target_table, target_id),
  foreign key (import_run_id, cattery_id)
    references public.legacy_import_runs(id, cattery_id) on delete cascade,
  foreign key (source_record_id, cattery_id)
    references public.legacy_source_records(id, cattery_id) on delete cascade
);

create table if not exists public.legacy_reconciliation_issues (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid not null references public.legacy_import_runs(id) on delete cascade,
  source_record_id uuid references public.legacy_source_records(id) on delete cascade,
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  issue_type text not null,
  severity text not null default 'warning' check (severity in ('info', 'warning', 'error')),
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  resolution_status text not null default 'open'
    check (resolution_status in ('open', 'accepted', 'resolved', 'ignored')),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  foreign key (import_run_id, cattery_id)
    references public.legacy_import_runs(id, cattery_id) on delete cascade,
  foreign key (source_record_id, cattery_id)
    references public.legacy_source_records(id, cattery_id) on delete cascade
);

alter table public.bookings
  add column if not exists external_source text,
  add column if not exists external_id text,
  add column if not exists legacy_reference text,
  add column if not exists legacy_customer_name text,
  add column if not exists legacy_pet_names text,
  add column if not exists legacy_booking_type text,
  add column if not exists legacy_run_name text,
  add column if not exists legacy_source text,
  add column if not exists legacy_amount numeric(12,2),
  add column if not exists legacy_tax_amount numeric(12,2),
  add column if not exists legacy_monies_received numeric(12,2),
  add column if not exists legacy_outstanding numeric(12,2),
  add column if not exists legacy_import_run_id uuid references public.legacy_import_runs(id) on delete set null,
  add column if not exists legacy_metadata jsonb not null default '{}'::jsonb;

alter table public.payments
  add column if not exists external_source text,
  add column if not exists external_id text,
  add column if not exists legacy_invoice_id text,
  add column if not exists legacy_description text,
  add column if not exists legacy_payment_type text,
  add column if not exists legacy_tax_amount numeric(12,2),
  add column if not exists legacy_deleted boolean not null default false,
  add column if not exists legacy_import_run_id uuid references public.legacy_import_runs(id) on delete set null,
  add column if not exists legacy_metadata jsonb not null default '{}'::jsonb;

alter table public.customers
  add column if not exists legacy_import_run_id uuid references public.legacy_import_runs(id) on delete set null;

alter table public.cats
  add column if not exists legacy_import_run_id uuid references public.legacy_import_runs(id) on delete set null;

alter table public.customer_credit_ledger
  add column if not exists external_source text,
  add column if not exists external_id text,
  add column if not exists legacy_import_run_id uuid references public.legacy_import_runs(id) on delete set null,
  add column if not exists legacy_metadata jsonb not null default '{}'::jsonb;

create unique index if not exists bookings_external_record_unique
  on public.bookings(cattery_id, external_source, external_id)
  where external_source is not null and external_id is not null;

create unique index if not exists payments_external_record_unique
  on public.payments(cattery_id, external_source, external_id)
  where external_source is not null and external_id is not null;

create unique index if not exists customer_credit_external_record_unique
  on public.customer_credit_ledger(cattery_id, external_source, external_id)
  where external_source is not null and external_id is not null;

create index if not exists legacy_import_runs_cattery_created_idx
  on public.legacy_import_runs(cattery_id, created_at desc);
create index if not exists legacy_source_files_run_idx
  on public.legacy_source_files(import_run_id, report_type);
create index if not exists legacy_source_records_run_report_idx
  on public.legacy_source_records(import_run_id, report_type, row_number);
create index if not exists legacy_source_records_external_idx
  on public.legacy_source_records(cattery_id, source_system, report_type, external_id)
  where external_id is not null;
create index if not exists legacy_source_records_checksum_idx
  on public.legacy_source_records(source_file_id, record_checksum);
create index if not exists legacy_import_links_target_idx
  on public.legacy_import_links(cattery_id, target_table, target_id);
create index if not exists legacy_reconciliation_issues_run_status_idx
  on public.legacy_reconciliation_issues(import_run_id, resolution_status, severity);
create unique index if not exists legacy_reconciliation_issue_source_unique
  on public.legacy_reconciliation_issues(import_run_id, source_record_id, issue_type)
  where source_record_id is not null;

drop trigger if exists legacy_import_runs_touch_updated_at on public.legacy_import_runs;
create trigger legacy_import_runs_touch_updated_at
before update on public.legacy_import_runs
for each row execute function public.catstays_touch_updated_at();

alter table public.legacy_import_runs enable row level security;
alter table public.legacy_source_files enable row level security;
alter table public.legacy_source_records enable row level security;
alter table public.legacy_import_links enable row level security;
alter table public.legacy_reconciliation_issues enable row level security;

revoke all on table public.legacy_import_runs from anon, authenticated;
revoke all on table public.legacy_source_files from anon, authenticated;
revoke all on table public.legacy_source_records from anon, authenticated;
revoke all on table public.legacy_import_links from anon, authenticated;
revoke all on table public.legacy_reconciliation_issues from anon, authenticated;

grant select, insert, update, delete on table public.legacy_import_runs to authenticated;
grant select, insert, update, delete on table public.legacy_source_files to authenticated;
grant select, insert, update, delete on table public.legacy_source_records to authenticated;
grant select, insert, update, delete on table public.legacy_import_links to authenticated;
grant select, insert, update, delete on table public.legacy_reconciliation_issues to authenticated;

grant all on table public.legacy_import_runs to service_role;
grant all on table public.legacy_source_files to service_role;
grant all on table public.legacy_source_records to service_role;
grant all on table public.legacy_import_links to service_role;
grant all on table public.legacy_reconciliation_issues to service_role;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'legacy_import_runs',
    'legacy_source_files',
    'legacy_source_records',
    'legacy_import_links',
    'legacy_reconciliation_issues'
  ] loop
    execute format('drop policy if exists %I on public.%I', 'Staff read ' || table_name, table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.open_home_can_manage_cattery(cattery_id))',
      'Staff read ' || table_name,
      table_name
    );
    execute format('drop policy if exists %I on public.%I', 'Staff create ' || table_name, table_name);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.open_home_can_manage_cattery(cattery_id))',
      'Staff create ' || table_name,
      table_name
    );
    execute format('drop policy if exists %I on public.%I', 'Staff update ' || table_name, table_name);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.open_home_can_manage_cattery(cattery_id)) with check (public.open_home_can_manage_cattery(cattery_id))',
      'Staff update ' || table_name,
      table_name
    );
    execute format('drop policy if exists %I on public.%I', 'Staff delete ' || table_name, table_name);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.open_home_can_manage_cattery(cattery_id))',
      'Staff delete ' || table_name,
      table_name
    );
  end loop;
end
$$;

create or replace function public.catstays_create_legacy_import_run(
  target_cattery_id uuid,
  source_system text,
  import_kind text default 'full_history',
  source_manifest jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_run_id uuid;
begin
  if target_cattery_id is null
    or not public.open_home_can_manage_cattery(target_cattery_id) then
    raise exception 'Not authorised to create a legacy import for this cattery.';
  end if;

  if nullif(btrim(source_system), '') is null then
    raise exception 'A source system is required.';
  end if;

  insert into public.legacy_import_runs (
    cattery_id,
    source_system,
    import_kind,
    source_manifest,
    created_by
  ) values (
    target_cattery_id,
    left(btrim(source_system), 100),
    left(coalesce(nullif(btrim(import_kind), ''), 'full_history'), 100),
    coalesce(source_manifest, '{}'::jsonb),
    (select auth.uid())
  )
  returning id into new_run_id;

  return new_run_id;
end;
$$;

create or replace function public.catstays_stage_legacy_source_file(
  target_import_run_id uuid,
  report_type text,
  source_file_name text,
  source_sha256 text,
  byte_size bigint,
  row_count integer,
  headline_totals jsonb default '{}'::jsonb,
  archive_notes text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_run public.legacy_import_runs%rowtype;
  source_file_id uuid;
begin
  select * into target_run
  from public.legacy_import_runs
  where id = target_import_run_id;

  if target_run.id is null
    or not public.open_home_can_manage_cattery(target_run.cattery_id) then
    raise exception 'Not authorised to stage a source file for this import.';
  end if;

  if target_run.status not in ('staging', 'dry_run') then
    raise exception 'Source files can only be staged during staging or dry-run.';
  end if;

  insert into public.legacy_source_files (
    import_run_id,
    cattery_id,
    report_type,
    source_file_name,
    source_sha256,
    byte_size,
    row_count,
    headline_totals,
    archive_notes
  ) values (
    target_run.id,
    target_run.cattery_id,
    left(btrim(report_type), 120),
    left(btrim(source_file_name), 500),
    lower(btrim(source_sha256)),
    byte_size,
    row_count,
    coalesce(headline_totals, '{}'::jsonb),
    archive_notes
  )
  on conflict on constraint legacy_source_files_run_type_name_unique
  do update set
    source_sha256 = excluded.source_sha256,
    byte_size = excluded.byte_size,
    row_count = excluded.row_count,
    headline_totals = excluded.headline_totals,
    archive_notes = excluded.archive_notes
  returning id into source_file_id;

  return source_file_id;
end;
$$;

create or replace function public.catstays_stage_legacy_source_records(
  target_source_file_id uuid,
  records jsonb
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_file public.legacy_source_files%rowtype;
  target_run public.legacy_import_runs%rowtype;
  staged_count integer := 0;
begin
  select * into target_file
  from public.legacy_source_files
  where id = target_source_file_id;

  select * into target_run
  from public.legacy_import_runs
  where id = target_file.import_run_id;

  if target_file.id is null
    or target_run.id is null
    or not public.open_home_can_manage_cattery(target_file.cattery_id) then
    raise exception 'Not authorised to stage source rows for this import.';
  end if;

  if target_run.status not in ('staging', 'dry_run') then
    raise exception 'Source rows can only be staged during staging or dry-run.';
  end if;

  if jsonb_typeof(records) <> 'array' then
    raise exception 'Legacy source records must be a JSON array.';
  end if;

  if jsonb_array_length(records) > 1000 then
    raise exception 'Legacy source record batches are limited to 1000 rows.';
  end if;

  with source_rows as (
    select *
    from jsonb_to_recordset(records) as source(
      row_number integer,
      external_id text,
      record_checksum text,
      raw_record jsonb
    )
  ), staged as (
    insert into public.legacy_source_records (
      import_run_id,
      source_file_id,
      cattery_id,
      source_system,
      report_type,
      row_number,
      external_id,
      record_checksum,
      raw_record
    )
    select
      target_run.id,
      target_file.id,
      target_file.cattery_id,
      target_run.source_system,
      target_file.report_type,
      source.row_number,
      nullif(left(btrim(source.external_id), 300), ''),
      lower(btrim(source.record_checksum)),
      source.raw_record
    from source_rows source
    where source.row_number > 0
      and source.raw_record is not null
    on conflict (source_file_id, row_number)
    do update set
      external_id = excluded.external_id,
      record_checksum = excluded.record_checksum,
      raw_record = excluded.raw_record,
      imported_at = timezone('utc', now())
    returning 1
  )
  select count(*) into staged_count from staged;

  return staged_count;
end;
$$;

create or replace function public.catstays_set_legacy_import_status(
  target_import_run_id uuid,
  new_status text,
  reconciliation jsonb default '{}'::jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_run public.legacy_import_runs%rowtype;
begin
  select * into target_run
  from public.legacy_import_runs
  where id = target_import_run_id
  for update;

  if target_run.id is null
    or not public.open_home_can_manage_cattery(target_run.cattery_id) then
    raise exception 'Not authorised to update this legacy import.';
  end if;

  if new_status not in ('staging', 'dry_run', 'ready', 'importing', 'imported', 'failed', 'rolled_back') then
    raise exception 'Invalid legacy import status.';
  end if;

  update public.legacy_import_runs
  set status = new_status,
      reconciliation = coalesce(catstays_set_legacy_import_status.reconciliation, '{}'::jsonb),
      completed_at = case
        when new_status in ('imported', 'failed', 'rolled_back')
          then timezone('utc', now())
        else null
      end
  where id = target_run.id;
end;
$$;

create or replace function public.catstays_import_legacy_customers(
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
  balance_count integer := 0;
begin
  select * into target_run
  from public.legacy_import_runs
  where id = target_import_run_id;
  if target_run.id is null
    or not public.open_home_can_manage_cattery(target_run.cattery_id) then
    raise exception 'Not authorised to import customers for this migration.';
  end if;
  if target_run.status not in ('ready', 'importing') then
    raise exception 'The legacy import must be ready before customers are imported.';
  end if;
  if jsonb_typeof(records) <> 'array' then
    raise exception 'Legacy customer records must be a JSON array.';
  end if;
  if jsonb_array_length(records) > 1000 then
    raise exception 'Legacy customer batches are limited to 1000 records.';
  end if;

  with source_rows as (
    select * from jsonb_to_recordset(records) as source(
      customer_name text,
      email text,
      phone text,
      address text,
      notes text,
      created_at timestamptz,
      external_source text,
      external_id text,
      legacy_last_booking date,
      legacy_account_balance numeric,
      legacy_total_spent numeric,
      legacy_metadata jsonb
    )
  ), imported as (
    insert into public.customers (
      cattery_id,
      name,
      email,
      phone,
      address,
      notes,
      created_at,
      external_source,
      external_id,
      legacy_last_booking,
      legacy_account_balance,
      legacy_total_spent,
      legacy_import_run_id,
      legacy_metadata
    )
    select
      target_run.cattery_id,
      left(btrim(source.customer_name), 250),
      lower(btrim(source.email)),
      nullif(left(btrim(source.phone), 80), ''),
      nullif(btrim(source.address), ''),
      nullif(btrim(source.notes), ''),
      coalesce(source.created_at, timezone('utc', now())),
      coalesce(nullif(left(btrim(source.external_source), 80), ''), 'revelation_pets'),
      nullif(left(btrim(source.external_id), 160), ''),
      source.legacy_last_booking,
      source.legacy_account_balance,
      source.legacy_total_spent,
      target_run.id,
      coalesce(source.legacy_metadata, '{}'::jsonb)
    from source_rows source
    where nullif(btrim(source.customer_name), '') is not null
      and nullif(btrim(source.email), '') is not null
      and nullif(btrim(source.external_id), '') is not null
    on conflict (cattery_id, external_source, external_id)
      where external_source is not null and external_id is not null
    do update set
      name = excluded.name,
      email = excluded.email,
      phone = excluded.phone,
      address = excluded.address,
      notes = excluded.notes,
      created_at = excluded.created_at,
      legacy_last_booking = excluded.legacy_last_booking,
      legacy_account_balance = excluded.legacy_account_balance,
      legacy_total_spent = excluded.legacy_total_spent,
      legacy_import_run_id = excluded.legacy_import_run_id,
      legacy_metadata = excluded.legacy_metadata
    returning id, external_id, legacy_account_balance
  ), balances as (
    insert into public.customer_credit_ledger (
      cattery_id,
      customer_id,
      entry_type,
      amount,
      note,
      external_source,
      external_id,
      legacy_import_run_id,
      legacy_metadata
    )
    select
      target_run.cattery_id,
      imported.id,
      'issued',
      imported.legacy_account_balance,
      'Opening account balance imported from Revelation Pets',
      'revelation_pets',
      'customer:' || imported.external_id || ':opening-balance',
      target_run.id,
      jsonb_build_object('source', 'customer_export')
    from imported
    where coalesce(imported.legacy_account_balance, 0) <> 0
    on conflict (cattery_id, external_source, external_id)
      where external_source is not null and external_id is not null
    do update set
      customer_id = excluded.customer_id,
      amount = excluded.amount,
      legacy_import_run_id = excluded.legacy_import_run_id,
      legacy_metadata = excluded.legacy_metadata
    returning 1
  )
  select
    (select count(*) from imported),
    (select count(*) from balances)
  into imported_count, balance_count;

  return jsonb_build_object(
    'customers', imported_count,
    'account_balances', balance_count
  );
end;
$$;

create or replace function public.catstays_import_legacy_cats(
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
  unmatched_owner_count integer := 0;
begin
  select * into target_run
  from public.legacy_import_runs
  where id = target_import_run_id;
  if target_run.id is null
    or not public.open_home_can_manage_cattery(target_run.cattery_id) then
    raise exception 'Not authorised to import cats for this migration.';
  end if;
  if target_run.status not in ('ready', 'importing') then
    raise exception 'The legacy import must be ready before cats are imported.';
  end if;
  if jsonb_typeof(records) <> 'array' then
    raise exception 'Cat import records must be a JSON array.';
  end if;
  if jsonb_array_length(records) > 5000 then
    raise exception 'Cat imports are limited to 5000 records at a time.';
  end if;

  with source_rows as (
    select * from jsonb_to_recordset(records) as source(
      cat_name text,
      owner_external_id text,
      breed text,
      age text,
      medical_notes text,
      dietary_requirements text,
      external_source text,
      external_id text,
      legacy_metadata jsonb
    )
  ), resolved as (
    select source.*, customer.id as customer_id
    from source_rows source
    left join public.customers customer
      on customer.cattery_id = target_run.cattery_id
      and customer.external_source = source.external_source
      and customer.external_id = source.owner_external_id
  ), imported as (
    insert into public.cats (
      cattery_id,
      customer_id,
      name,
      breed,
      age,
      medical_notes,
      dietary_requirements,
      external_source,
      external_id,
      legacy_import_run_id,
      legacy_metadata
    )
    select
      target_run.cattery_id,
      resolved.customer_id,
      left(btrim(resolved.cat_name), 250),
      nullif(btrim(resolved.breed), ''),
      nullif(btrim(resolved.age), ''),
      nullif(btrim(resolved.medical_notes), ''),
      nullif(btrim(resolved.dietary_requirements), ''),
      nullif(left(btrim(resolved.external_source), 80), ''),
      nullif(left(btrim(resolved.external_id), 160), ''),
      target_run.id,
      coalesce(resolved.legacy_metadata, '{}'::jsonb)
    from resolved
    where resolved.customer_id is not null
      and nullif(btrim(resolved.cat_name), '') is not null
    on conflict (cattery_id, external_source, external_id)
      where external_source is not null and external_id is not null
    do update set
      customer_id = excluded.customer_id,
      name = excluded.name,
      breed = excluded.breed,
      age = excluded.age,
      medical_notes = excluded.medical_notes,
      dietary_requirements = excluded.dietary_requirements,
      legacy_import_run_id = excluded.legacy_import_run_id,
      legacy_metadata = excluded.legacy_metadata
    returning 1
  )
  select
    (select count(*) from imported),
    (select count(*) from resolved where customer_id is null)
  into imported_count, unmatched_owner_count;

  return jsonb_build_object(
    'cats', imported_count,
    'unmatched_owners', unmatched_owner_count
  );
end;
$$;

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
    or not public.open_home_can_manage_cattery(target_run.cattery_id) then
    raise exception 'Not authorised to import bookings for this migration.';
  end if;
  if target_run.status not in ('ready', 'importing') then
    raise exception 'The legacy import must be ready before bookings are imported.';
  end if;
  if jsonb_typeof(records) <> 'array' then
    raise exception 'Legacy booking records must be a JSON array.';
  end if;
  if jsonb_array_length(records) > 1000 then
    raise exception 'Legacy booking batches are limited to 1000 records.';
  end if;

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
      resolved.external_id,
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

  return jsonb_build_object(
    'bookings', imported_count,
    'invalid_dates', invalid_date_count,
    'unmatched_customers', unmatched_customer_count
  );
end;
$$;

create or replace function public.catstays_import_legacy_payments(
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
  unmatched_booking_count integer := 0;
begin
  select * into target_run
  from public.legacy_import_runs
  where id = target_import_run_id;
  if target_run.id is null
    or not public.open_home_can_manage_cattery(target_run.cattery_id) then
    raise exception 'Not authorised to import payments for this migration.';
  end if;
  if target_run.status not in ('ready', 'importing') then
    raise exception 'The legacy import must be ready before payments are imported.';
  end if;
  if jsonb_typeof(records) <> 'array' then
    raise exception 'Legacy payment records must be a JSON array.';
  end if;
  if jsonb_array_length(records) > 1000 then
    raise exception 'Legacy payment batches are limited to 1000 records.';
  end if;

  with source_rows as (
    select * from jsonb_to_recordset(records) as source(
      external_id text,
      booking_external_id text,
      legacy_invoice_id text,
      customer_external_id text,
      legacy_description text,
      paid_on date,
      legacy_payment_type text,
      amount numeric,
      legacy_tax_amount numeric,
      legacy_deleted boolean,
      source_record_checksum text
    )
  ), resolved as (
    select
      source.*,
      booking.id as resolved_booking_id,
      coalesce(customer.id, booking.customer_id) as resolved_customer_id
    from source_rows source
    left join public.bookings booking
      on booking.cattery_id = target_run.cattery_id
      and booking.external_source = 'revelation_pets'
      and booking.external_id = source.booking_external_id
    left join public.customers customer
      on customer.cattery_id = target_run.cattery_id
      and customer.external_source = 'revelation_pets'
      and customer.external_id = source.customer_external_id
  ), imported as (
    insert into public.payments (
      cattery_id,
      booking_id,
      customer_id,
      amount,
      type,
      status,
      payment_method,
      paid_on,
      reference,
      created_at,
      external_source,
      external_id,
      legacy_invoice_id,
      legacy_description,
      legacy_payment_type,
      legacy_tax_amount,
      legacy_deleted,
      legacy_import_run_id,
      legacy_metadata
    )
    select
      target_run.cattery_id,
      resolved.resolved_booking_id,
      resolved.resolved_customer_id,
      round(coalesce(resolved.amount, 0), 2),
      case when lower(btrim(coalesce(resolved.legacy_description, ''))) = 'deposit' then 'deposit' else 'booking' end,
      'completed',
      case lower(btrim(coalesce(resolved.legacy_payment_type, '')))
        when 'bacs / bank transfer' then 'bank_transfer'
        when 'cash' then 'cash'
        when 'stripe' then 'stripe'
        when 'stripe payment' then 'stripe'
        when 'balance' then 'customer_credit'
        else null
      end,
      resolved.paid_on,
      nullif(resolved.legacy_invoice_id, ''),
      coalesce(resolved.paid_on::timestamptz, timezone('utc', now())),
      'revelation_pets',
      resolved.external_id,
      nullif(resolved.legacy_invoice_id, ''),
      nullif(resolved.legacy_description, ''),
      nullif(resolved.legacy_payment_type, ''),
      coalesce(resolved.legacy_tax_amount, 0),
      coalesce(resolved.legacy_deleted, false),
      target_run.id,
      jsonb_build_object('source_record_checksum', resolved.source_record_checksum)
    from resolved
    where nullif(resolved.external_id, '') is not null
      and resolved.paid_on is not null
    on conflict (cattery_id, external_source, external_id)
      where external_source is not null and external_id is not null
    do update set
      booking_id = excluded.booking_id,
      customer_id = excluded.customer_id,
      amount = excluded.amount,
      type = excluded.type,
      status = excluded.status,
      payment_method = excluded.payment_method,
      paid_on = excluded.paid_on,
      reference = excluded.reference,
      created_at = excluded.created_at,
      legacy_invoice_id = excluded.legacy_invoice_id,
      legacy_description = excluded.legacy_description,
      legacy_payment_type = excluded.legacy_payment_type,
      legacy_tax_amount = excluded.legacy_tax_amount,
      legacy_deleted = excluded.legacy_deleted,
      legacy_import_run_id = excluded.legacy_import_run_id,
      legacy_metadata = excluded.legacy_metadata
    returning 1
  )
  select
    (select count(*) from imported),
    (select count(*) from resolved where resolved_booking_id is null)
  into imported_count, unmatched_booking_count;

  return jsonb_build_object(
    'payments', imported_count,
    'unmatched_bookings', unmatched_booking_count
  );
end;
$$;

revoke execute on function public.catstays_create_legacy_import_run(uuid, text, text, jsonb) from public, anon;
revoke execute on function public.catstays_stage_legacy_source_file(uuid, text, text, text, bigint, integer, jsonb, text) from public, anon;
revoke execute on function public.catstays_stage_legacy_source_records(uuid, jsonb) from public, anon;
revoke execute on function public.catstays_set_legacy_import_status(uuid, text, jsonb) from public, anon;
revoke execute on function public.catstays_import_legacy_customers(uuid, jsonb) from public, anon;
revoke execute on function public.catstays_import_legacy_cats(uuid, jsonb) from public, anon;
revoke execute on function public.catstays_import_legacy_bookings(uuid, jsonb) from public, anon;
revoke execute on function public.catstays_import_legacy_payments(uuid, jsonb) from public, anon;

grant execute on function public.catstays_create_legacy_import_run(uuid, text, text, jsonb) to authenticated;
grant execute on function public.catstays_stage_legacy_source_file(uuid, text, text, text, bigint, integer, jsonb, text) to authenticated;
grant execute on function public.catstays_stage_legacy_source_records(uuid, jsonb) to authenticated;
grant execute on function public.catstays_set_legacy_import_status(uuid, text, jsonb) to authenticated;
grant execute on function public.catstays_import_legacy_customers(uuid, jsonb) to authenticated;
grant execute on function public.catstays_import_legacy_cats(uuid, jsonb) to authenticated;
grant execute on function public.catstays_import_legacy_bookings(uuid, jsonb) to authenticated;
grant execute on function public.catstays_import_legacy_payments(uuid, jsonb) to authenticated;

comment on table public.legacy_source_records is
  'Immutable-shape lossless source rows retained for migration audit, reconciliation, and future report recovery.';
comment on column public.legacy_source_records.raw_record is
  'The complete source row exactly as represented in the prepared migration archive.';

commit;
