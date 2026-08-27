alter table public.catstays_notifications
  add column if not exists dismissed_at timestamptz;

grant update (read_at, dismissed_at)
  on table public.catstays_notifications
  to authenticated;

comment on column public.catstays_notifications.dismissed_at is
  'Recipient-controlled dismissal timestamp; dismissed notifications remain out of that user inbox across devices.';
