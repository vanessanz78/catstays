create table if not exists public.catstays_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  platform text not null default 'pwa',
  is_active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists catstays_push_subscriptions_user_active_idx
  on public.catstays_push_subscriptions (user_id, is_active);

create index if not exists catstays_push_subscriptions_cattery_active_idx
  on public.catstays_push_subscriptions (cattery_id, is_active);

alter table public.catstays_push_subscriptions enable row level security;
revoke all on table public.catstays_push_subscriptions from anon, authenticated;
grant all on table public.catstays_push_subscriptions to service_role;

comment on table public.catstays_push_subscriptions is
  'Server-only Web Push endpoints for authenticated CatStays cattery owners.';
