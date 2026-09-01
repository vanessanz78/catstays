-- Staff booking operations: auditable notes, adjustments, manual payments,
-- customer credit, and room segments for split stays.

alter table public.bookings
  add column if not exists customer_note_visible boolean not null default false;

alter table public.payments
  add column if not exists payment_method text,
  add column if not exists paid_on date,
  add column if not exists reference text,
  add column if not exists created_by uuid references auth.users(id) on delete set null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payments_payment_method_check'
  ) then
    alter table public.payments
      add constraint payments_payment_method_check
      check (payment_method is null or payment_method in ('bank_transfer', 'cash', 'stripe', 'customer_credit'));
  end if;
end $$;

create table if not exists public.booking_adjustments (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  kind text not null check (kind in ('charge', 'discount')),
  label text not null,
  calculation text not null default 'fixed' check (calculation in ('fixed', 'percentage')),
  value numeric(10,2) not null check (value >= 0),
  amount numeric(10,2) not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.customer_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  entry_type text not null check (entry_type in ('issued', 'applied', 'reversed')),
  amount numeric(10,2) not null check (amount <> 0),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.booking_events (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  event_type text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.booking_room_segments (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  cat_id uuid references public.cats(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  room_unit_number integer not null check (room_unit_number > 0),
  starts_on date not null,
  ends_on date not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint booking_room_segments_dates_check check (ends_on >= starts_on)
);

create index if not exists booking_adjustments_booking_id_idx on public.booking_adjustments(booking_id);
create index if not exists customer_credit_ledger_customer_id_idx on public.customer_credit_ledger(customer_id);
create index if not exists booking_events_booking_id_created_at_idx on public.booking_events(booking_id, created_at desc);
create index if not exists booking_room_segments_booking_id_idx on public.booking_room_segments(booking_id);
create index if not exists booking_room_segments_room_dates_idx on public.booking_room_segments(room_id, room_unit_number, starts_on, ends_on);

alter table public.booking_adjustments enable row level security;
alter table public.customer_credit_ledger enable row level security;
alter table public.booking_events enable row level security;
alter table public.booking_room_segments enable row level security;

drop policy if exists "Staff manage booking adjustments" on public.booking_adjustments;
create policy "Staff manage booking adjustments"
  on public.booking_adjustments for all to authenticated
  using (public.open_home_can_manage_cattery(cattery_id))
  with check (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "Staff manage customer credit" on public.customer_credit_ledger;
create policy "Staff manage customer credit"
  on public.customer_credit_ledger for all to authenticated
  using (public.open_home_can_manage_cattery(cattery_id))
  with check (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "Staff manage booking events" on public.booking_events;
create policy "Staff manage booking events"
  on public.booking_events for all to authenticated
  using (public.open_home_can_manage_cattery(cattery_id))
  with check (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "Staff manage booking room segments" on public.booking_room_segments;
create policy "Staff manage booking room segments"
  on public.booking_room_segments for all to authenticated
  using (public.open_home_can_manage_cattery(cattery_id))
  with check (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "Staff manage cattery payments" on public.payments;
create policy "Staff manage cattery payments"
  on public.payments for all to authenticated
  using (public.open_home_can_manage_cattery(cattery_id))
  with check (public.open_home_can_manage_cattery(cattery_id));

grant select, insert, update, delete on public.booking_adjustments to authenticated;
grant select, insert, update, delete on public.customer_credit_ledger to authenticated;
grant select, insert, update, delete on public.booking_events to authenticated;
grant select, insert, update, delete on public.booking_room_segments to authenticated;
grant select, insert, update, delete on public.payments to authenticated;

grant all on public.booking_adjustments to service_role;
grant all on public.customer_credit_ledger to service_role;
grant all on public.booking_events to service_role;
grant all on public.booking_room_segments to service_role;

create or replace function public.catstays_replace_booking_room_segments(
  target_booking_id uuid,
  new_segments jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_booking public.bookings%rowtype;
  segment jsonb;
  target_room public.rooms%rowtype;
  segment_start date;
  segment_end date;
  segment_unit integer;
  target_cat_count integer;
  coverage_is_valid boolean;
begin
  select * into target_booking from public.bookings where id = target_booking_id;
  if target_booking.id is null or not public.open_home_can_manage_cattery(target_booking.cattery_id) then
    raise exception 'Booking not found or access denied';
  end if;
  if jsonb_typeof(new_segments) <> 'array' or jsonb_array_length(new_segments) < 2 then
    raise exception 'A split stay needs at least two room segments';
  end if;
  select greatest(count(*)::integer, coalesce(target_booking.number_of_cats, 0), 1)
  into target_cat_count
  from public.booking_cats
  where booking_id = target_booking_id;

  for segment in select value from jsonb_array_elements(new_segments)
  loop
    segment_start := (segment ->> 'starts_on')::date;
    segment_end := (segment ->> 'ends_on')::date;
    segment_unit := (segment ->> 'room_unit_number')::integer;
    select * into target_room
      from public.rooms
      where id = (segment ->> 'room_id')::uuid
        and cattery_id = target_booking.cattery_id
        and is_active = true;
    if target_room.id is null then raise exception 'A selected room is unavailable'; end if;
    if segment_start < target_booking.check_in or segment_end > target_booking.check_out or segment_end < segment_start then
      raise exception 'Room segments must stay inside the booking dates';
    end if;
    if segment_unit < 1 or segment_unit > greatest(1, coalesce(target_room.room_count, 1)) then
      raise exception 'A selected physical room does not exist';
    end if;
    if coalesce(target_room.capacity, 1) < target_cat_count then
      raise exception 'A selected room cannot hold every cat in this booking';
    end if;
    if nullif(segment ->> 'cat_id', '') is not null and not exists (
      select 1 from public.booking_cats
      where booking_id = target_booking_id
        and cat_id = (segment ->> 'cat_id')::uuid
    ) then
      raise exception 'A room segment contains a cat outside this booking';
    end if;
    if exists (
      select 1
      from public.booking_room_segments existing
      join public.bookings existing_booking on existing_booking.id = existing.booking_id
      where existing.booking_id <> target_booking_id
        and existing_booking.status <> 'cancelled'
        and existing.room_id = target_room.id
        and existing.room_unit_number = segment_unit
        and existing.starts_on <= segment_end
        and existing.ends_on >= segment_start
    ) then
      raise exception 'A selected room already has a split stay during those dates';
    end if;
    if exists (
      select 1
      from public.bookings existing
      where existing.id <> target_booking_id
        and existing.cattery_id = target_booking.cattery_id
        and existing.status <> 'cancelled'
        and existing.check_in <= segment_end
        and existing.check_out >= segment_start
        and not exists (select 1 from public.booking_room_segments split where split.booking_id = existing.id)
        and (
          (existing.room_id = target_room.id and existing.room_unit_number = segment_unit)
          or exists (
            select 1 from public.booking_cat_rooms assignment
            where assignment.booking_id = existing.id
              and assignment.room_id = target_room.id
              and assignment.room_unit_number = segment_unit
          )
        )
    ) then
      raise exception 'A selected room is already booked during those dates';
    end if;
  end loop;

  select
    min(day_key::date) = target_booking.check_in
    and max(day_key::date) = target_booking.check_out
    and count(*) = (target_booking.check_out - target_booking.check_in) + 1
    and count(distinct day_key::date) = (target_booking.check_out - target_booking.check_in) + 1
  into coverage_is_valid
  from jsonb_array_elements(new_segments) segment_value
  cross join lateral generate_series(
    (segment_value ->> 'starts_on')::date,
    (segment_value ->> 'ends_on')::date,
    interval '1 day'
  ) day_key;

  if not coalesce(coverage_is_valid, false) then
    raise exception 'Room segments must cover every booking day exactly once';
  end if;

  delete from public.booking_room_segments where booking_id = target_booking_id;
  insert into public.booking_room_segments (
    cattery_id, booking_id, cat_id, room_id, room_unit_number, starts_on, ends_on, created_by
  )
  select
    target_booking.cattery_id,
    target_booking_id,
    nullif(value ->> 'cat_id', '')::uuid,
    (value ->> 'room_id')::uuid,
    (value ->> 'room_unit_number')::integer,
    (value ->> 'starts_on')::date,
    (value ->> 'ends_on')::date,
    auth.uid()
  from jsonb_array_elements(new_segments);

  insert into public.booking_events (cattery_id, booking_id, event_type, summary, metadata, created_by)
  values (
    target_booking.cattery_id,
    target_booking_id,
    'room_split',
    'Split stay room plan updated',
    jsonb_build_object('segments', new_segments),
    auth.uid()
  );
end;
$$;

revoke all on function public.catstays_replace_booking_room_segments(uuid, jsonb) from public;
grant execute on function public.catstays_replace_booking_room_segments(uuid, jsonb) to authenticated, service_role;
