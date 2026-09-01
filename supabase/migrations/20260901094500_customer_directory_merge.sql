-- Modern customer directory support and an auditable, all-or-nothing customer merge.

create table if not exists public.customer_merge_events (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  kept_customer_id uuid not null,
  removed_customer_id uuid not null,
  primary_snapshot jsonb not null,
  secondary_snapshot jsonb not null,
  merged_profile jsonb not null,
  kept_portal_from text not null check (kept_portal_from in ('primary', 'secondary')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  check (kept_customer_id <> removed_customer_id)
);

create index if not exists customer_merge_events_cattery_created_idx
  on public.customer_merge_events(cattery_id, created_at desc);
create index if not exists customer_merge_events_kept_customer_idx
  on public.customer_merge_events(kept_customer_id);

alter table public.customer_merge_events enable row level security;
revoke all on table public.customer_merge_events from anon, authenticated;
grant select on table public.customer_merge_events to authenticated;
grant all on table public.customer_merge_events to service_role;

drop policy if exists "Staff read customer merge history" on public.customer_merge_events;
create policy "Staff read customer merge history"
  on public.customer_merge_events for select to authenticated
  using (public.open_home_can_manage_cattery(cattery_id));

create or replace function public.catstays_merge_customers(
  primary_customer_id uuid,
  secondary_customer_id uuid,
  merged_profile jsonb,
  keep_portal_from text default 'primary'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  primary_customer public.customers%rowtype;
  secondary_customer public.customers%rowtype;
  selected_user_id uuid;
  merged_name text;
  merged_email text;
begin
  if primary_customer_id = secondary_customer_id then
    raise exception 'Choose two different customers';
  end if;

  if keep_portal_from not in ('primary', 'secondary') then
    raise exception 'Choose which customer portal login to keep';
  end if;

  -- Always lock in UUID order so two staff cannot deadlock by selecting the
  -- same pair in the opposite order.
  perform id
  from public.customers
  where id in (primary_customer_id, secondary_customer_id)
  order by id
  for update;

  select * into primary_customer
  from public.customers
  where id = primary_customer_id;

  select * into secondary_customer
  from public.customers
  where id = secondary_customer_id;

  if primary_customer.id is null or secondary_customer.id is null then
    raise exception 'One of those customers no longer exists';
  end if;

  if primary_customer.cattery_id <> secondary_customer.cattery_id
    or not public.open_home_can_manage_cattery(primary_customer.cattery_id) then
    raise exception 'Customers not found or access denied';
  end if;

  merged_name := trim(coalesce(merged_profile ->> 'name', ''));
  merged_email := trim(coalesce(merged_profile ->> 'email', ''));
  if merged_name = '' then raise exception 'The merged customer needs a name'; end if;
  if merged_email = '' then raise exception 'The merged customer needs an email address'; end if;

  selected_user_id := case keep_portal_from
    when 'secondary' then coalesce(secondary_customer.user_id, primary_customer.user_id)
    else coalesce(primary_customer.user_id, secondary_customer.user_id)
  end;

  update public.customers
  set name = merged_name,
      email = merged_email,
      phone = nullif(trim(coalesce(merged_profile ->> 'phone', '')), ''),
      address = nullif(trim(coalesce(merged_profile ->> 'address', '')), ''),
      notes = nullif(trim(coalesce(merged_profile ->> 'notes', '')), ''),
      user_id = selected_user_id,
      created_at = least(primary_customer.created_at, secondary_customer.created_at),
      updated_at = timezone('utc', now())
  where id = primary_customer_id;

  update public.cats set customer_id = primary_customer_id
    where customer_id = secondary_customer_id;
  update public.bookings set customer_id = primary_customer_id
    where customer_id = secondary_customer_id;
  update public.payments set customer_id = primary_customer_id
    where customer_id = secondary_customer_id;
  update public.customer_credit_ledger set customer_id = primary_customer_id
    where customer_id = secondary_customer_id;
  update public.payment_requests set customer_id = primary_customer_id
    where customer_id = secondary_customer_id;
  update public.customer_messages set customer_id = primary_customer_id
    where customer_id = secondary_customer_id;
  update public.documents set customer_id = primary_customer_id
    where customer_id = secondary_customer_id;
  update public.cat_updates set customer_id = primary_customer_id
    where customer_id = secondary_customer_id;

  insert into public.customer_merge_events (
    cattery_id,
    kept_customer_id,
    removed_customer_id,
    primary_snapshot,
    secondary_snapshot,
    merged_profile,
    kept_portal_from,
    created_by
  ) values (
    primary_customer.cattery_id,
    primary_customer_id,
    secondary_customer_id,
    to_jsonb(primary_customer),
    to_jsonb(secondary_customer),
    merged_profile,
    keep_portal_from,
    (select auth.uid())
  );

  delete from public.customers where id = secondary_customer_id;
  return primary_customer_id;
end;
$$;

revoke all on function public.catstays_merge_customers(uuid, uuid, jsonb, text) from public;
revoke execute on function public.catstays_merge_customers(uuid, uuid, jsonb, text) from anon;
grant execute on function public.catstays_merge_customers(uuid, uuid, jsonb, text) to authenticated;
grant execute on function public.catstays_merge_customers(uuid, uuid, jsonb, text) to service_role;

comment on table public.customer_merge_events is
  'Immutable staff audit history for customer merges, including both source profiles and the chosen merged profile.';
comment on function public.catstays_merge_customers(uuid, uuid, jsonb, text) is
  'Atomically combines two customer accounts and all tenant-owned related records while retaining an audit snapshot.';
