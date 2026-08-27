begin;

alter table public.bookings
  add column if not exists room_arrangement text not null default 'shared';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_room_arrangement_check'
      and conrelid = 'public.bookings'::regclass
  ) then
    alter table public.bookings
      add constraint bookings_room_arrangement_check
      check (room_arrangement in ('shared', 'separate'));
  end if;
end
$$;

create table if not exists public.booking_cat_rooms (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  cat_id uuid not null references public.cats(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  unique (booking_id, cat_id)
);

create index if not exists booking_cat_rooms_booking_id_idx
  on public.booking_cat_rooms(booking_id);
create index if not exists booking_cat_rooms_room_id_idx
  on public.booking_cat_rooms(room_id);
create index if not exists booking_cat_rooms_cat_id_idx
  on public.booking_cat_rooms(cat_id);

alter table public.booking_cat_rooms enable row level security;

revoke all on table public.booking_cat_rooms from anon, authenticated;
grant select, insert, update, delete on table public.booking_cat_rooms to authenticated;
grant all on table public.booking_cat_rooms to service_role;

drop policy if exists "Staff manage booking cat room assignments" on public.booking_cat_rooms;
create policy "Staff manage booking cat room assignments"
  on public.booking_cat_rooms
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      where b.id = booking_id
        and public.open_home_can_manage_cattery(b.cattery_id)
    )
  )
  with check (
    exists (
      select 1
      from public.bookings b
      join public.cats c on c.id = cat_id and c.cattery_id = b.cattery_id
      join public.rooms r on r.id = room_id and r.cattery_id = b.cattery_id
      where b.id = booking_id
        and public.open_home_can_manage_cattery(b.cattery_id)
    )
  );

drop policy if exists "Customers read their booking cat room assignments" on public.booking_cat_rooms;
create policy "Customers read their booking cat room assignments"
  on public.booking_cat_rooms
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      join public.customers customer on customer.id = b.customer_id
      where b.id = booking_id
        and customer.user_id = (select auth.uid())
    )
  );

comment on table public.booking_cat_rooms is
  'One durable room assignment for every cat included in a booking.';

revoke all on table public.booking_cats from anon;
grant select, insert, update, delete on table public.booking_cats to authenticated;
grant all on table public.booking_cats to service_role;

drop policy if exists "Staff manage cattery booking cats" on public.booking_cats;
create policy "Staff manage cattery booking cats"
  on public.booking_cats
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      where b.id = booking_id
        and public.open_home_can_manage_cattery(b.cattery_id)
    )
  )
  with check (
    exists (
      select 1
      from public.bookings b
      join public.cats c on c.id = cat_id and c.cattery_id = b.cattery_id
      where b.id = booking_id
        and public.open_home_can_manage_cattery(b.cattery_id)
    )
  );

drop policy if exists "Customers read their booking cats" on public.booking_cats;
create policy "Customers read their booking cats"
  on public.booking_cats
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      join public.customers customer on customer.id = b.customer_id
      where b.id = booking_id
        and customer.user_id = (select auth.uid())
    )
  );

commit;
