-- Booking cancellation and safe erroneous-entry deletion.
-- Cancellation preserves the operational and financial record. Hard deletion is
-- limited to unpaid mistakes and retains an immutable private audit snapshot.

alter table public.bookings
  add column if not exists cancellation_reason text,
  add column if not exists cancellation_note text,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by uuid references auth.users(id) on delete set null,
  add column if not exists cancellation_credit_amount numeric(10,2) not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_cancellation_credit_amount_check'
  ) then
    alter table public.bookings
      add constraint bookings_cancellation_credit_amount_check
      check (cancellation_credit_amount >= 0);
  end if;
end $$;

create index if not exists bookings_cattery_cancelled_at_idx
  on public.bookings(cattery_id, cancelled_at desc)
  where status = 'cancelled';

create table if not exists public.booking_deletion_audit (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  booking_id uuid not null,
  deletion_reason text not null,
  booking_snapshot jsonb not null,
  deleted_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz not null default timezone('utc', now())
);

create index if not exists booking_deletion_audit_cattery_deleted_at_idx
  on public.booking_deletion_audit(cattery_id, deleted_at desc);

alter table public.booking_deletion_audit enable row level security;

drop policy if exists "Staff view booking deletion audit" on public.booking_deletion_audit;
create policy "Staff view booking deletion audit"
  on public.booking_deletion_audit for select to authenticated
  using (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "Staff create booking deletion audit" on public.booking_deletion_audit;
create policy "Staff create booking deletion audit"
  on public.booking_deletion_audit for insert to authenticated
  with check (public.open_home_can_manage_cattery(cattery_id));

grant select, insert on public.booking_deletion_audit to authenticated;
grant all on public.booking_deletion_audit to service_role;

create or replace function public.catstays_cancel_booking(
  target_booking_id uuid,
  cancellation_reason text,
  cancellation_note text default null,
  customer_credit_amount numeric default 0
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_booking public.bookings%rowtype;
  paid_amount numeric(10,2);
  prior_issued_credit numeric(10,2);
  safe_credit numeric(10,2);
  safe_reason text;
begin
  safe_reason := nullif(btrim(cancellation_reason), '');
  safe_credit := round(greatest(coalesce(customer_credit_amount, 0), 0), 2);

  select * into target_booking
  from public.bookings
  where id = target_booking_id
  for update;

  if target_booking.id is null
    or not public.open_home_can_manage_cattery(target_booking.cattery_id) then
    raise exception 'Booking not found or access denied';
  end if;
  if target_booking.status = 'cancelled' then
    raise exception 'This booking is already cancelled';
  end if;
  if safe_reason is null then
    raise exception 'Choose a cancellation reason';
  end if;
  if safe_credit > 0 and target_booking.customer_id is null then
    raise exception 'A customer must be linked before issuing customer credit';
  end if;

  select coalesce(sum(amount), 0)
  into paid_amount
  from public.payments
  where booking_id = target_booking_id
    and status = 'completed';

  select coalesce(sum(case when amount > 0 then amount else 0 end), 0)
  into prior_issued_credit
  from public.customer_credit_ledger
  where booking_id = target_booking_id
    and entry_type = 'issued';

  if safe_credit + prior_issued_credit > paid_amount then
    raise exception 'Customer credit cannot exceed the uncredited payment value of %',
      to_char(greatest(paid_amount - prior_issued_credit, 0), 'FM999999990.00');
  end if;

  update public.bookings
  set
    status = 'cancelled',
    cancellation_reason = safe_reason,
    cancellation_note = nullif(btrim(cancellation_note), ''),
    cancelled_at = timezone('utc', now()),
    cancelled_by = auth.uid(),
    cancellation_credit_amount = safe_credit
  where id = target_booking_id;

  if safe_credit > 0 then
    insert into public.customer_credit_ledger (
      cattery_id,
      customer_id,
      booking_id,
      entry_type,
      amount,
      note,
      created_by
    ) values (
      target_booking.cattery_id,
      target_booking.customer_id,
      target_booking_id,
      'issued',
      safe_credit,
      'Credit retained when booking was cancelled',
      auth.uid()
    );
  end if;

  insert into public.booking_events (
    cattery_id,
    booking_id,
    event_type,
    summary,
    metadata,
    created_by
  ) values (
    target_booking.cattery_id,
    target_booking_id,
    'booking_cancelled',
    'Booking cancelled: ' || safe_reason,
    jsonb_build_object(
      'reason', safe_reason,
      'note', nullif(btrim(cancellation_note), ''),
      'paid_amount', paid_amount,
      'customer_credit_amount', safe_credit,
      'retained_amount', greatest(paid_amount - safe_credit, 0)
    ),
    auth.uid()
  );

  return jsonb_build_object(
    'booking_id', target_booking_id,
    'status', 'cancelled',
    'paid_amount', paid_amount,
    'customer_credit_amount', safe_credit,
    'retained_amount', greatest(paid_amount - safe_credit, 0)
  );
end;
$$;

create or replace function public.catstays_delete_erroneous_booking(
  target_booking_id uuid,
  deletion_reason text
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_booking public.bookings%rowtype;
  safe_reason text;
begin
  safe_reason := nullif(btrim(deletion_reason), '');

  select * into target_booking
  from public.bookings
  where id = target_booking_id
  for update;

  if target_booking.id is null
    or not public.open_home_can_manage_cattery(target_booking.cattery_id) then
    raise exception 'Booking not found or access denied';
  end if;
  if target_booking.status = 'cancelled' then
    raise exception 'Cancelled bookings must remain in history';
  end if;
  if safe_reason is null then
    raise exception 'Explain why this booking was created by mistake';
  end if;
  if exists (select 1 from public.payments where booking_id = target_booking_id) then
    raise exception 'This booking has a payment record. Cancel it instead';
  end if;
  if exists (select 1 from public.customer_credit_ledger where booking_id = target_booking_id) then
    raise exception 'This booking has customer credit history. Cancel it instead';
  end if;

  insert into public.booking_deletion_audit (
    cattery_id,
    booking_id,
    deletion_reason,
    booking_snapshot,
    deleted_by
  ) values (
    target_booking.cattery_id,
    target_booking_id,
    safe_reason,
    to_jsonb(target_booking),
    auth.uid()
  );

  delete from public.bookings where id = target_booking_id;

  return jsonb_build_object(
    'booking_id', target_booking_id,
    'deleted', true
  );
end;
$$;

revoke all on function public.catstays_cancel_booking(uuid, text, text, numeric) from public, anon;
revoke all on function public.catstays_delete_erroneous_booking(uuid, text) from public, anon;
grant execute on function public.catstays_cancel_booking(uuid, text, text, numeric) to authenticated, service_role;
grant execute on function public.catstays_delete_erroneous_booking(uuid, text) to authenticated, service_role;
