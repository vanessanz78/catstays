begin;

create table if not exists public.cat_updates (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  cat_id uuid not null references public.cats(id) on delete cascade,
  caption text not null check (char_length(trim(caption)) between 1 and 2000),
  storage_bucket text not null default 'cat-update-photos' check (storage_bucket = 'cat-update-photos'),
  storage_path text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'portal_only', 'failed', 'archived')),
  email_provider_message_id text,
  email_sent_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (storage_bucket, storage_path)
);

create index if not exists cat_updates_cattery_created_idx
  on public.cat_updates (cattery_id, created_at desc);
create index if not exists cat_updates_customer_created_idx
  on public.cat_updates (customer_id, created_at desc);
create index if not exists cat_updates_booking_idx
  on public.cat_updates (booking_id);

drop trigger if exists cat_updates_touch_updated_at on public.cat_updates;
create trigger cat_updates_touch_updated_at
before update on public.cat_updates
for each row execute function public.catstays_touch_updated_at();

alter table public.cat_updates enable row level security;
revoke all on table public.cat_updates from anon, authenticated;
grant select, insert, update, delete on table public.cat_updates to authenticated;
grant all on table public.cat_updates to service_role;

drop policy if exists "Staff manage cattery cat updates" on public.cat_updates;
create policy "Staff manage cattery cat updates"
  on public.cat_updates for all to authenticated
  using (public.open_home_can_manage_cattery(cattery_id))
  with check (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "Customers read their own cat updates" on public.cat_updates;
create policy "Customers read their own cat updates"
  on public.cat_updates for select to authenticated
  using (
    customer_id in (
      select id from public.customers where user_id = (select auth.uid())
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cat-update-photos',
  'cat-update-photos',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Staff upload cattery cat update photos" on storage.objects;
create policy "Staff upload cattery cat update photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'cat-update-photos'
    and exists (
      select 1 from public.catteries c
      where c.id::text = (storage.foldername(name))[1]
        and public.open_home_can_manage_cattery(c.id)
    )
  );

drop policy if exists "Staff read cattery cat update photos" on storage.objects;
create policy "Staff read cattery cat update photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'cat-update-photos'
    and exists (
      select 1 from public.catteries c
      where c.id::text = (storage.foldername(name))[1]
        and public.open_home_can_manage_cattery(c.id)
    )
  );

drop policy if exists "Staff remove cattery cat update photos" on storage.objects;
create policy "Staff remove cattery cat update photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'cat-update-photos'
    and exists (
      select 1 from public.catteries c
      where c.id::text = (storage.foldername(name))[1]
        and public.open_home_can_manage_cattery(c.id)
    )
  );

drop policy if exists "Customers read their own cat update photos" on storage.objects;
create policy "Customers read their own cat update photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'cat-update-photos'
    and exists (
      select 1
      from public.cat_updates update_record
      join public.customers customer on customer.id = update_record.customer_id
      where update_record.storage_bucket = bucket_id
        and update_record.storage_path = name
        and customer.user_id = (select auth.uid())
        and update_record.status <> 'archived'
    )
  );

comment on table public.cat_updates is
  'Tenant-scoped photo updates shared by cattery staff with the customer who owns the booked cat.';

commit;
