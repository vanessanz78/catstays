begin;

alter table public.customers
  add column if not exists external_source text,
  add column if not exists external_id text,
  add column if not exists legacy_last_booking date,
  add column if not exists legacy_account_balance numeric(10,2),
  add column if not exists legacy_total_spent numeric(12,2),
  add column if not exists legacy_metadata jsonb not null default '{}'::jsonb;

alter table public.cats
  add column if not exists external_source text,
  add column if not exists external_id text,
  add column if not exists legacy_metadata jsonb not null default '{}'::jsonb;

alter table public.customers
  drop constraint if exists customers_cattery_id_email_key;

create unique index if not exists customers_external_record_unique
  on public.customers(cattery_id, external_source, external_id)
  where external_source is not null and external_id is not null;

create unique index if not exists cats_external_record_unique
  on public.cats(cattery_id, external_source, external_id)
  where external_source is not null and external_id is not null;

create or replace function public.catstays_import_customers(
  target_cattery_id uuid,
  records jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  imported_customers integer := 0;
  imported_credits integer := 0;
begin
  if target_cattery_id is null
    or not public.open_home_can_manage_cattery(target_cattery_id) then
    raise exception 'Not authorised to import customers for this cattery.';
  end if;

  if jsonb_typeof(records) <> 'array' then
    raise exception 'Customer import records must be a JSON array.';
  end if;

  if jsonb_array_length(records) > 5000 then
    raise exception 'Customer imports are limited to 5000 records at a time.';
  end if;

  with source_rows as (
    select *
    from jsonb_to_recordset(records) as source(
      name text,
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
  ), inserted as (
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
      legacy_metadata
    )
    select
      target_cattery_id,
      left(trim(source.name), 250),
      lower(trim(source.email)),
      nullif(left(trim(source.phone), 80), ''),
      nullif(trim(source.address), ''),
      nullif(trim(source.notes), ''),
      coalesce(source.created_at, timezone('utc', now())),
      nullif(left(trim(source.external_source), 80), ''),
      nullif(left(trim(source.external_id), 160), ''),
      source.legacy_last_booking,
      source.legacy_account_balance,
      source.legacy_total_spent,
      coalesce(source.legacy_metadata, '{}'::jsonb)
    from source_rows source
    where nullif(trim(source.name), '') is not null
      and nullif(trim(source.email), '') is not null
    returning id, legacy_account_balance
  ), credits as (
    insert into public.customer_credit_ledger (
      cattery_id,
      customer_id,
      entry_type,
      amount,
      note
    )
    select
      target_cattery_id,
      inserted.id,
      'issued',
      inserted.legacy_account_balance,
      'Opening balance imported from Revelation Pets'
    from inserted
    where inserted.legacy_account_balance > 0
    returning id
  )
  select
    (select count(*) from inserted),
    (select count(*) from credits)
  into imported_customers, imported_credits;

  return jsonb_build_object(
    'customers', imported_customers,
    'credit_balances', imported_credits
  );
end;
$$;

revoke execute on function public.catstays_import_customers(uuid, jsonb) from public;
revoke execute on function public.catstays_import_customers(uuid, jsonb) from anon;
grant execute on function public.catstays_import_customers(uuid, jsonb) to authenticated;

commit;
