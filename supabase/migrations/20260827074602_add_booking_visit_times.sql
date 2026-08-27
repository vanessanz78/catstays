begin;

alter table public.bookings
  add column if not exists check_in_time time,
  add column if not exists check_out_time time;

comment on column public.bookings.check_in_time is
  'Customer arrival appointment time in the cattery local timezone.';

comment on column public.bookings.check_out_time is
  'Customer collection appointment time in the cattery local timezone.';

update public.catteries
set website_settings = jsonb_set(
  jsonb_set(
    coalesce(website_settings, '{}'::jsonb),
    '{morningDays}',
    coalesce(website_settings -> 'morningDays', '[1,2,3,4,5,6]'::jsonb),
    true
  ),
  '{afternoonDays}',
  coalesce(website_settings -> 'afternoonDays', '[0,1,2,3,4,5,6]'::jsonb),
  true
)
where slug = 'delorainecattery';

commit;
