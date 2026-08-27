create table if not exists public.catstays_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  url text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists catstays_notifications_user_created_idx
  on public.catstays_notifications (user_id, created_at desc);
create index if not exists catstays_notifications_cattery_created_idx
  on public.catstays_notifications (cattery_id, created_at desc);

alter table public.catstays_notifications enable row level security;
revoke all on table public.catstays_notifications from anon, authenticated;
grant select on table public.catstays_notifications to authenticated;
grant update (read_at) on table public.catstays_notifications to authenticated;
grant all on table public.catstays_notifications to service_role;

drop policy if exists "Users read their CatStays notifications" on public.catstays_notifications;
create policy "Users read their CatStays notifications"
  on public.catstays_notifications for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users mark their CatStays notifications read" on public.catstays_notifications;
create policy "Users mark their CatStays notifications read"
  on public.catstays_notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Customers read their own profile" on public.customers;
create policy "Customers read their own profile"
  on public.customers for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Customers read their own bookings" on public.bookings;
create policy "Customers read their own bookings"
  on public.bookings for select to authenticated
  using (
    customer_id in (
      select id from public.customers where user_id = (select auth.uid())
    )
  );

drop policy if exists "Staff manage cattery bookings" on public.bookings;
create policy "Staff manage cattery bookings"
  on public.bookings for all to authenticated
  using (public.open_home_can_manage_cattery(cattery_id))
  with check (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "Staff manage cattery customers" on public.customers;
create policy "Staff manage cattery customers"
  on public.customers for all to authenticated
  using (public.open_home_can_manage_cattery(cattery_id))
  with check (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "Customers read their own cats" on public.cats;
create policy "Customers read their own cats"
  on public.cats for select to authenticated
  using (
    customer_id in (
      select id from public.customers where user_id = (select auth.uid())
    )
  );

drop policy if exists "Public can view bookings for availability" on public.bookings;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  business text;
  base_slug text;
  final_slug text;
  requested_cattery uuid;
  counter int := 0;
begin
  if coalesce(new.raw_user_meta_data->>'account_type', '') = 'customer' then
    begin
      requested_cattery := nullif(new.raw_user_meta_data->>'cattery_id', '')::uuid;
    exception when invalid_text_representation then
      requested_cattery := null;
    end;

    if requested_cattery is not null and new.email is not null then
      update public.customers
      set user_id = new.id,
          updated_at = now()
      where cattery_id = requested_cattery
        and lower(email) = lower(new.email)
        and user_id is null;
    end if;
    return new;
  end if;

  business := coalesce(nullif(new.raw_user_meta_data->>'business_name', ''), 'My Cattery');
  base_slug := trim(both '-' from regexp_replace(lower(business), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then
    base_slug := 'my-cattery';
  end if;

  final_slug := base_slug;
  while exists (select 1 from public.catteries where slug = final_slug) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  end loop;

  insert into public.catteries (owner_id, name, slug, email)
  values (new.id, business, final_slug, new.email)
  on conflict do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

comment on table public.catstays_notifications is
  'Per-user CatStays inbox; server writes engagement events and authenticated recipients read their own rows.';
