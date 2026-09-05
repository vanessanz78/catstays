begin;

alter table public.bookings
  add column if not exists waitlist_available_at timestamptz,
  add column if not exists waitlist_alert_claimed_at timestamptz,
  add column if not exists waitlist_alert_email_sent_at timestamptz,
  add column if not exists waitlist_alert_staff_notified_at timestamptz,
  add column if not exists waitlist_alert_last_error text;

create index if not exists bookings_active_waitlist_dates_idx
  on public.bookings (cattery_id, check_in, check_out)
  where status = 'waitlist';

comment on column public.bookings.waitlist_available_at is
  'Start of the current capacity-available transition for a waitlist request; cleared if capacity disappears before staff slot it.';
comment on column public.bookings.waitlist_alert_claimed_at is
  'Short idempotency lease used by the server while delivering a waitlist availability alert.';
comment on column public.bookings.waitlist_alert_email_sent_at is
  'Owner email delivery timestamp for the current waitlist availability transition.';
comment on column public.bookings.waitlist_alert_staff_notified_at is
  'CatStays inbox/native notification attempt timestamp for the current availability transition.';
comment on column public.bookings.waitlist_alert_last_error is
  'Bounded operational delivery error for staff review; never contains provider credentials or customer payloads.';

commit;
