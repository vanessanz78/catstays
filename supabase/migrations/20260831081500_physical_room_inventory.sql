begin;

-- A rooms row remains the public accommodation type (for example Private Suite).
-- room_count records how many individually bookable physical rooms exist for that type.
alter table public.rooms
  add column if not exists room_count integer not null default 1;

alter table public.bookings
  add column if not exists room_unit_number integer;

alter table public.booking_cat_rooms
  add column if not exists room_unit_number integer;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'rooms_room_count_positive_check'
      and conrelid = 'public.rooms'::regclass
  ) then
    alter table public.rooms
      add constraint rooms_room_count_positive_check
      check (room_count > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'bookings_room_unit_number_positive_check'
      and conrelid = 'public.bookings'::regclass
  ) then
    alter table public.bookings
      add constraint bookings_room_unit_number_positive_check
      check (room_unit_number is null or room_unit_number > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'booking_cat_rooms_room_unit_number_positive_check'
      and conrelid = 'public.booking_cat_rooms'::regclass
  ) then
    alter table public.booking_cat_rooms
      add constraint booking_cat_rooms_room_unit_number_positive_check
      check (room_unit_number is null or room_unit_number > 0);
  end if;
end
$$;

-- Preserve every legacy assignment by placing it in physical room 1. This is
-- deterministic, reversible, and keeps existing bookings visible after release.
update public.bookings
set room_unit_number = 1
where room_id is not null
  and room_unit_number is null;

update public.booking_cat_rooms
set room_unit_number = 1
where room_unit_number is null;

-- Deloraine's verified physical inventory. Capacity is cats per physical room;
-- room_count is the number of physical rooms of that accommodation type.
update public.rooms room
set room_count = case
      when lower(room.name || ' ' || coalesce(room.type, '')) like '%private%' then 17
      when lower(room.name || ' ' || coalesce(room.type, '')) like '%indoor%' then 8
      when lower(room.name || ' ' || coalesce(room.type, '')) like '%communal%' then 25
      else room.room_count
    end,
    capacity = case
      when lower(room.name || ' ' || coalesce(room.type, '')) like '%private%' then 3
      when lower(room.name || ' ' || coalesce(room.type, '')) like '%indoor%' then 2
      when lower(room.name || ' ' || coalesce(room.type, '')) like '%communal%' then 1
      else room.capacity
    end
from public.catteries cattery
where cattery.id = room.cattery_id
  and (
    lower(coalesce(cattery.slug, '')) = 'delorainecattery'
    or regexp_replace(lower(cattery.name), '[^a-z0-9]+', '', 'g') = 'delorainecattery'
  );

create index if not exists bookings_room_unit_dates_idx
  on public.bookings(cattery_id, room_id, room_unit_number, check_in, check_out)
  where status <> 'cancelled';

create index if not exists booking_cat_rooms_room_unit_idx
  on public.booking_cat_rooms(room_id, room_unit_number, booking_id);

create or replace function public.validate_physical_room_assignment()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  configured_room_count integer;
begin
  if new.room_unit_number is null then
    return new;
  end if;

  if new.room_id is null then
    raise exception 'A physical room number requires an accommodation type.';
  end if;

  select room_count
  into configured_room_count
  from public.rooms
  where id = new.room_id;

  if configured_room_count is null then
    raise exception 'The selected accommodation type does not exist.';
  end if;

  if new.room_unit_number < 1 or new.room_unit_number > configured_room_count then
    raise exception 'Physical room % is outside the configured range 1-% for this accommodation type.',
      new.room_unit_number, configured_room_count;
  end if;

  return new;
end;
$$;

revoke all on function public.validate_physical_room_assignment() from public, anon, authenticated;
grant execute on function public.validate_physical_room_assignment() to service_role;

drop trigger if exists validate_booking_physical_room on public.bookings;
create trigger validate_booking_physical_room
  before insert or update of room_id, room_unit_number
  on public.bookings
  for each row execute function public.validate_physical_room_assignment();

drop trigger if exists validate_booking_cat_physical_room on public.booking_cat_rooms;
create trigger validate_booking_cat_physical_room
  before insert or update of room_id, room_unit_number
  on public.booking_cat_rooms
  for each row execute function public.validate_physical_room_assignment();

comment on column public.rooms.room_count is
  'Number of individually bookable physical rooms represented by this accommodation type.';
comment on column public.bookings.room_unit_number is
  'One-based physical room number within the selected rooms accommodation type.';
comment on column public.booking_cat_rooms.room_unit_number is
  'One-based physical room number assigned to this cat within the selected accommodation type.';

commit;
