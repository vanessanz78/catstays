drop policy if exists "Public can create pending bookings" on public.bookings;
revoke select, insert on table public.bookings from anon;
grant select, insert, update, delete on table public.bookings to authenticated;
grant all on table public.bookings to service_role;

comment on table public.bookings is
  'Booking requests are created by the validated CatStays API; owners, active staff, and linked customers receive scoped access through RLS.';
