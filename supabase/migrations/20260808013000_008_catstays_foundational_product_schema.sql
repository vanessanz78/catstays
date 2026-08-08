begin;

create or replace function public.catstays_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.staff_memberships (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  role text not null default 'staff' check (role in ('owner','admin','staff','viewer')),
  status text not null default 'active' check (status in ('invited','active','disabled')),
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz,
  accepted_at timestamptz,
  last_seen_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (cattery_id, email)
);

drop trigger if exists staff_memberships_touch_updated_at on public.staff_memberships;
create trigger staff_memberships_touch_updated_at
before update on public.staff_memberships
for each row
execute function public.catstays_touch_updated_at();

create or replace function public.catstays_is_cattery_staff(target_cattery_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_memberships sm
    where sm.cattery_id = target_cattery_id
      and sm.status = 'active'
      and (
        sm.user_id = (select auth.uid())
        or lower(sm.email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
      )
  );
$$;

create or replace function public.catstays_can_admin_cattery(target_cattery_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_memberships sm
    where sm.cattery_id = target_cattery_id
      and sm.status = 'active'
      and sm.role in ('owner','admin')
      and (
        sm.user_id = (select auth.uid())
        or lower(sm.email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
      )
  );
$$;

create or replace function public.open_home_can_manage_cattery(target_cattery_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.catteries c
    where c.id = target_cattery_id
      and c.owner_id = (select auth.uid())
  )
  or public.catstays_can_admin_cattery(target_cattery_id);
$$;

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete cascade,
  name text not null,
  rule_type text not null check (rule_type in ('open_hours','blackout','minimum_stay','capacity_override','price_override','check_in_window','check_out_window')),
  starts_at timestamptz,
  ends_at timestamptz,
  days_of_week int[] not null default '{}'::int[],
  value jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active','paused','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists availability_rules_touch_updated_at on public.availability_rules;
create trigger availability_rules_touch_updated_at
before update on public.availability_rules
for each row
execute function public.catstays_touch_updated_at();

create table if not exists public.customer_messages (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  channel text not null default 'email' check (channel in ('email','sms','portal','internal')),
  direction text not null default 'outbound' check (direction in ('inbound','outbound')),
  subject text,
  body text not null,
  status text not null default 'draft' check (status in ('draft','queued','sent','delivered','failed','read','archived')),
  provider text,
  provider_message_id text,
  sent_at timestamptz,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists customer_messages_touch_updated_at on public.customer_messages;
create trigger customer_messages_touch_updated_at
before update on public.customer_messages
for each row
execute function public.catstays_touch_updated_at();

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  document_type text not null default 'form' check (document_type in ('form','contract','vaccination','policy','invoice','receipt','other')),
  title text not null,
  storage_bucket text,
  storage_path text,
  status text not null default 'draft' check (status in ('draft','requested','submitted','approved','rejected','archived')),
  submitted_at timestamptz,
  approved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists documents_touch_updated_at on public.documents;
create trigger documents_touch_updated_at
before update on public.documents
for each row
execute function public.catstays_touch_updated_at();

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid references public.catteries(id) on delete set null,
  provider text not null default 'stripe',
  event_id text not null,
  event_type text not null,
  status text not null default 'received' check (status in ('received','processed','ignored','failed')),
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (provider, event_id)
);

alter table public.content_sources add column if not exists storage_bucket text;
alter table public.content_sources add column if not exists storage_prefix text;
alter table public.content_sources add column if not exists asset_manifest jsonb not null default '{}'::jsonb;
alter table public.content_sources add column if not exists preview_snapshot jsonb not null default '{}'::jsonb;
alter table public.content_sources add column if not exists selected_template text;
alter table public.content_sources add column if not exists last_imported_at timestamptz;

alter table public.media_library add column if not exists storage_bucket text;
alter table public.media_library add column if not exists storage_path text;
alter table public.media_library add column if not exists file_size_bytes bigint;
alter table public.media_library add column if not exists sha256 text;
alter table public.media_library add column if not exists asset_role text;
alter table public.media_library add column if not exists source_page_url text;
alter table public.media_library add column if not exists persisted_at timestamptz;
alter table public.media_library add column if not exists status text not null default 'captured';

alter table public.content_library add column if not exists source_page_url text;
alter table public.content_library add column if not exists section_key text;
alter table public.content_library add column if not exists sort_order integer not null default 0;

alter table public.website_drafts add column if not exists source_snapshot jsonb not null default '{}'::jsonb;
alter table public.website_drafts add column if not exists rendered_snapshot jsonb not null default '{}'::jsonb;
alter table public.website_drafts add column if not exists template_key text;

alter table public.website_previews add column if not exists source_id uuid references public.content_sources(id) on delete set null;
alter table public.website_previews add column if not exists template_key text;
alter table public.website_previews add column if not exists rendered_snapshot jsonb not null default '{}'::jsonb;

alter table public.website_published_versions add column if not exists source_id uuid references public.content_sources(id) on delete set null;
alter table public.website_published_versions add column if not exists template_key text;
alter table public.website_published_versions add column if not exists rendered_snapshot jsonb not null default '{}'::jsonb;

create index if not exists staff_memberships_cattery_id_idx on public.staff_memberships(cattery_id);
create index if not exists staff_memberships_user_id_idx on public.staff_memberships(user_id);
create index if not exists staff_memberships_email_idx on public.staff_memberships(lower(email));
create index if not exists availability_rules_cattery_id_idx on public.availability_rules(cattery_id);
create index if not exists customer_messages_cattery_id_idx on public.customer_messages(cattery_id);
create index if not exists documents_cattery_id_idx on public.documents(cattery_id);
create index if not exists payment_webhook_events_cattery_id_idx on public.payment_webhook_events(cattery_id);
create index if not exists media_library_storage_path_idx on public.media_library(storage_bucket, storage_path);
create index if not exists media_library_sha256_idx on public.media_library(sha256);
create index if not exists content_library_source_page_url_idx on public.content_library(source_page_url);
create index if not exists website_previews_source_id_idx on public.website_previews(source_id);
create index if not exists website_published_versions_source_id_idx on public.website_published_versions(source_id);

alter table public.staff_memberships enable row level security;
alter table public.availability_rules enable row level security;
alter table public.customer_messages enable row level security;
alter table public.documents enable row level security;
alter table public.payment_webhook_events enable row level security;

drop policy if exists "staff memberships are manageable by cattery admins" on public.staff_memberships;
create policy "staff memberships are manageable by cattery admins"
on public.staff_memberships
for all
to authenticated
using (public.open_home_can_manage_cattery(cattery_id))
with check (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "staff can read their own membership" on public.staff_memberships;
create policy "staff can read their own membership"
on public.staff_memberships
for select
to authenticated
using (
  user_id = (select auth.uid())
  or lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
);

drop policy if exists "staff can manage availability rules" on public.availability_rules;
create policy "staff can manage availability rules"
on public.availability_rules
for all
to authenticated
using (public.open_home_can_manage_cattery(cattery_id))
with check (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "staff can manage customer messages" on public.customer_messages;
create policy "staff can manage customer messages"
on public.customer_messages
for all
to authenticated
using (public.open_home_can_manage_cattery(cattery_id))
with check (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "staff can manage documents" on public.documents;
create policy "staff can manage documents"
on public.documents
for all
to authenticated
using (public.open_home_can_manage_cattery(cattery_id))
with check (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "staff can read payment webhook events" on public.payment_webhook_events;
create policy "staff can read payment webhook events"
on public.payment_webhook_events
for select
to authenticated
using (cattery_id is not null and public.open_home_can_manage_cattery(cattery_id));

grant select, insert, update, delete on public.staff_memberships to authenticated;
grant select, insert, update, delete on public.availability_rules to authenticated;
grant select, insert, update, delete on public.customer_messages to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select on public.payment_webhook_events to authenticated;

grant all on public.staff_memberships to service_role;
grant all on public.availability_rules to service_role;
grant all on public.customer_messages to service_role;
grant all on public.documents to service_role;
grant all on public.payment_webhook_events to service_role;

insert into public.staff_memberships (cattery_id, user_id, email, role, status, accepted_at)
select c.id, c.owner_id, coalesce(u.email, c.email), 'owner', 'active', timezone('utc', now())
from public.catteries c
left join auth.users u on u.id = c.owner_id
where c.owner_id is not null
  and coalesce(u.email, c.email) is not null
on conflict (cattery_id, email) do update
set user_id = excluded.user_id,
    role = 'owner',
    status = 'active',
    accepted_at = coalesce(public.staff_memberships.accepted_at, excluded.accepted_at),
    updated_at = timezone('utc', now());

commit;
