-- Allow staff to remove an accidentally-created, history-free customer while
-- preserving an immutable audit record. Customers with any operational,
-- financial, communication, portal, or cat-stay history must be merged or kept.

create table if not exists public.customer_deletion_events (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  customer_id uuid not null,
  deletion_reason text not null,
  customer_snapshot jsonb not null,
  cats_snapshot jsonb not null default '[]'::jsonb,
  deleted_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz not null default timezone('utc', now())
);

create index if not exists customer_deletion_events_cattery_deleted_idx
  on public.customer_deletion_events(cattery_id, deleted_at desc);

alter table public.customer_deletion_events enable row level security;
revoke all on table public.customer_deletion_events from anon, authenticated;
grant select, insert on table public.customer_deletion_events to authenticated;
grant all on table public.customer_deletion_events to service_role;

drop policy if exists "Staff read customer deletion history" on public.customer_deletion_events;
create policy "Staff read customer deletion history"
  on public.customer_deletion_events for select to authenticated
  using (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "Staff create customer deletion history" on public.customer_deletion_events;
create policy "Staff create customer deletion history"
  on public.customer_deletion_events for insert to authenticated
  with check (public.open_home_can_manage_cattery(cattery_id));

create or replace function public.catstays_delete_empty_customer(
  target_customer_id uuid,
  deletion_reason text
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_customer public.customers%rowtype;
  safe_reason text;
  customer_cats jsonb;
begin
  safe_reason := nullif(btrim(deletion_reason), '');

  select * into target_customer
  from public.customers
  where id = target_customer_id
  for update;

  if target_customer.id is null
    or not public.open_home_can_manage_cattery(target_customer.cattery_id) then
    raise exception 'Customer not found or access denied';
  end if;
  if safe_reason is null then
    raise exception 'Explain why this customer was created by mistake';
  end if;
  if target_customer.user_id is not null then
    raise exception 'This customer has a portal login. Merge or keep the customer instead';
  end if;
  if exists (select 1 from public.bookings where customer_id = target_customer_id) then
    raise exception 'This customer has booking history. Merge or keep the customer instead';
  end if;
  if exists (select 1 from public.payments where customer_id = target_customer_id) then
    raise exception 'This customer has payment history. Merge or keep the customer instead';
  end if;
  if exists (select 1 from public.customer_credit_ledger where customer_id = target_customer_id) then
    raise exception 'This customer has credit history. Merge or keep the customer instead';
  end if;
  if exists (select 1 from public.payment_requests where customer_id = target_customer_id) then
    raise exception 'This customer has payment-request history. Merge or keep the customer instead';
  end if;
  if exists (select 1 from public.customer_messages where customer_id = target_customer_id) then
    raise exception 'This customer has message history. Merge or keep the customer instead';
  end if;
  if exists (select 1 from public.documents where customer_id = target_customer_id) then
    raise exception 'This customer has document history. Merge or keep the customer instead';
  end if;
  if exists (select 1 from public.cat_updates where customer_id = target_customer_id) then
    raise exception 'This customer has cat-update history. Merge or keep the customer instead';
  end if;
  if exists (
    select 1
    from public.booking_cats booking_cat
    join public.cats cat on cat.id = booking_cat.cat_id
    where cat.customer_id = target_customer_id
  ) or exists (
    select 1
    from public.booking_room_segments segment
    join public.cats cat on cat.id = segment.cat_id
    where cat.customer_id = target_customer_id
  ) then
    raise exception 'One of this customer''s cats has stay history. Merge or keep the customer instead';
  end if;

  select coalesce(jsonb_agg(to_jsonb(cat_record) order by cat_record.created_at), '[]'::jsonb)
  into customer_cats
  from public.cats cat_record
  where cat_record.customer_id = target_customer_id;

  insert into public.customer_deletion_events (
    cattery_id,
    customer_id,
    deletion_reason,
    customer_snapshot,
    cats_snapshot,
    deleted_by
  ) values (
    target_customer.cattery_id,
    target_customer.id,
    safe_reason,
    to_jsonb(target_customer),
    customer_cats,
    auth.uid()
  );

  delete from public.cats where customer_id = target_customer_id;
  delete from public.customers where id = target_customer_id;

  return jsonb_build_object(
    'customer_id', target_customer_id,
    'deleted', true
  );
end;
$$;

revoke all on function public.catstays_delete_empty_customer(uuid, text) from public, anon;
grant execute on function public.catstays_delete_empty_customer(uuid, text) to authenticated, service_role;

comment on table public.customer_deletion_events is
  'Immutable staff audit history for deletion of mistaken, history-free customer records.';
comment on function public.catstays_delete_empty_customer(uuid, text) is
  'Deletes only a portal-free customer with no operational, financial, communication, document, or cat-stay history.';
