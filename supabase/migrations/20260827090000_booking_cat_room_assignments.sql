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

create table if not exists public.cattery_payment_accounts (
  cattery_id uuid primary key references public.catteries(id) on delete cascade,
  provider text not null default 'stripe' check (provider = 'stripe'),
  publishable_key text not null,
  secret_id uuid not null,
  webhook_secret_id uuid not null,
  provider_account_id text not null,
  webhook_endpoint_id text not null,
  mode text not null check (mode in ('test', 'live')),
  status text not null default 'active' check (status in ('active', 'invalid', 'disconnected')),
  last_validated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.cattery_payment_accounts enable row level security;
revoke all on table public.cattery_payment_accounts from anon, authenticated;
grant all on table public.cattery_payment_accounts to service_role;

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  request_type text not null check (request_type in ('deposit', 'full')),
  amount numeric(10,2) not null check (amount > 0),
  currency text not null default 'nzd',
  provider text not null default 'stripe' check (provider = 'stripe'),
  provider_session_id text not null unique,
  checkout_url text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'cancelled', 'failed')),
  expires_at timestamptz,
  paid_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.payments
  add column if not exists payment_request_id uuid references public.payment_requests(id) on delete set null,
  add column if not exists provider_payment_id text;

create unique index if not exists payments_payment_request_id_unique_idx
  on public.payments(payment_request_id)
  where payment_request_id is not null;

create index if not exists payment_requests_cattery_id_idx on public.payment_requests(cattery_id);
create index if not exists payment_requests_booking_id_idx on public.payment_requests(booking_id);
create index if not exists payment_requests_customer_id_idx on public.payment_requests(customer_id);

alter table public.payment_requests enable row level security;
revoke all on table public.payment_requests from anon, authenticated;
grant select on table public.payment_requests to authenticated;
grant all on table public.payment_requests to service_role;

drop policy if exists "Staff read cattery payment requests" on public.payment_requests;
create policy "Staff read cattery payment requests"
  on public.payment_requests for select to authenticated
  using (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "Customers read their payment requests" on public.payment_requests;
create policy "Customers read their payment requests"
  on public.payment_requests for select to authenticated
  using (
    customer_id in (
      select id from public.customers where user_id = (select auth.uid())
    )
  );

create or replace function public.catstays_store_cattery_stripe_credentials(
  target_cattery_id uuid,
  new_publishable_key text,
  new_secret_key text,
  new_webhook_secret text,
  new_provider_account_id text,
  new_webhook_endpoint_id text,
  new_mode text
)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  existing_secret_id uuid;
  existing_webhook_secret_id uuid;
begin
  select secret_id, webhook_secret_id
    into existing_secret_id, existing_webhook_secret_id
  from public.cattery_payment_accounts
  where cattery_id = target_cattery_id;

  if existing_secret_id is null then
    existing_secret_id := vault.create_secret(
      new_secret_key,
      'catstays_stripe_secret_' || target_cattery_id::text,
      'Stripe secret key for CatStays cattery ' || target_cattery_id::text
    );
  else
    perform vault.update_secret(existing_secret_id, new_secret_key);
  end if;

  if existing_webhook_secret_id is null then
    existing_webhook_secret_id := vault.create_secret(
      new_webhook_secret,
      'catstays_stripe_webhook_' || target_cattery_id::text,
      'Stripe webhook signing secret for CatStays cattery ' || target_cattery_id::text
    );
  else
    perform vault.update_secret(existing_webhook_secret_id, new_webhook_secret);
  end if;

  insert into public.cattery_payment_accounts (
    cattery_id,
    publishable_key,
    secret_id,
    webhook_secret_id,
    provider_account_id,
    webhook_endpoint_id,
    mode,
    status,
    last_validated_at,
    updated_at
  ) values (
    target_cattery_id,
    new_publishable_key,
    existing_secret_id,
    existing_webhook_secret_id,
    new_provider_account_id,
    new_webhook_endpoint_id,
    new_mode,
    'active',
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (cattery_id) do update set
    publishable_key = excluded.publishable_key,
    provider_account_id = excluded.provider_account_id,
    webhook_endpoint_id = excluded.webhook_endpoint_id,
    mode = excluded.mode,
    status = 'active',
    last_validated_at = timezone('utc', now()),
    updated_at = timezone('utc', now());
end;
$$;

create or replace function public.catstays_get_cattery_stripe_credentials(target_cattery_id uuid)
returns table (
  secret_key text,
  webhook_secret text
)
language sql
security definer
set search_path = public, vault
as $$
  select secret.decrypted_secret, webhook.decrypted_secret
  from public.cattery_payment_accounts account
  join vault.decrypted_secrets secret on secret.id = account.secret_id
  join vault.decrypted_secrets webhook on webhook.id = account.webhook_secret_id
  where account.cattery_id = target_cattery_id
    and account.status = 'active';
$$;

create or replace function public.catstays_delete_cattery_stripe_credentials(target_cattery_id uuid)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  stored_secret_id uuid;
  stored_webhook_secret_id uuid;
begin
  select secret_id, webhook_secret_id
    into stored_secret_id, stored_webhook_secret_id
  from public.cattery_payment_accounts
  where cattery_id = target_cattery_id;

  delete from public.cattery_payment_accounts where cattery_id = target_cattery_id;
  delete from vault.secrets where id in (stored_secret_id, stored_webhook_secret_id);
end;
$$;

revoke all on function public.catstays_store_cattery_stripe_credentials(uuid, text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.catstays_get_cattery_stripe_credentials(uuid) from public, anon, authenticated;
revoke all on function public.catstays_delete_cattery_stripe_credentials(uuid) from public, anon, authenticated;
grant execute on function public.catstays_store_cattery_stripe_credentials(uuid, text, text, text, text, text, text) to service_role;
grant execute on function public.catstays_get_cattery_stripe_credentials(uuid) to service_role;
grant execute on function public.catstays_delete_cattery_stripe_credentials(uuid) to service_role;

comment on table public.cattery_payment_accounts is
  'Server-only Stripe account metadata. Secret and webhook credentials are stored in Supabase Vault.';
comment on table public.payment_requests is
  'Per-booking Stripe Checkout requests for a deposit or full payment.';

commit;
