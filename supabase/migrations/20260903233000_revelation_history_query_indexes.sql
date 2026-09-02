-- Imported history exposed unindexed nested booking lookups. Preserve RLS;
-- index the relationship keys and stable tenant pagination instead.
set lock_timeout='3s';
create index if not exists booking_cats_booking_cat_idx on public.booking_cats(booking_id,cat_id);
create index if not exists payments_booking_id_idx on public.payments(booking_id);
create index if not exists bookings_cattery_created_id_idx on public.bookings(cattery_id,created_at desc,id);
create index if not exists payments_cattery_paid_id_idx on public.payments(cattery_id,paid_on,id);
reset lock_timeout;
analyze public.bookings;
analyze public.booking_cats;
analyze public.payments;
