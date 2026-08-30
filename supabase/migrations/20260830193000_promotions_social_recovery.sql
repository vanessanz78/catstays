begin;

create table if not exists public.cattery_promotions (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  name text not null,
  code text not null,
  discount_type text not null default 'percentage' check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12, 2) not null check (discount_value > 0),
  valid_from date,
  valid_to date,
  minimum_days integer not null default 1 check (minimum_days >= 1),
  maximum_uses integer check (maximum_uses is null or maximum_uses > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'expired', 'archived')),
  terms text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (cattery_id, code)
);

drop trigger if exists cattery_promotions_touch_updated_at on public.cattery_promotions;
create trigger cattery_promotions_touch_updated_at
before update on public.cattery_promotions
for each row execute function public.catstays_touch_updated_at();

create table if not exists public.cattery_social_posts (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  promotion_id uuid references public.cattery_promotions(id) on delete set null,
  title text not null,
  caption text not null,
  platforms text[] not null default '{}'::text[],
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'archived')),
  scheduled_for timestamptz,
  published_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists cattery_social_posts_touch_updated_at on public.cattery_social_posts;
create trigger cattery_social_posts_touch_updated_at
before update on public.cattery_social_posts
for each row execute function public.catstays_touch_updated_at();

create index if not exists cattery_promotions_scope_idx
  on public.cattery_promotions(cattery_id, status, valid_to);
create index if not exists cattery_social_posts_scope_idx
  on public.cattery_social_posts(cattery_id, status, scheduled_for desc);

alter table public.cattery_promotions enable row level security;
alter table public.cattery_social_posts enable row level security;

drop policy if exists "staff manage cattery promotions" on public.cattery_promotions;
create policy "staff manage cattery promotions"
on public.cattery_promotions for all to authenticated
using (public.open_home_can_manage_cattery(cattery_id))
with check (public.open_home_can_manage_cattery(cattery_id));

drop policy if exists "staff manage cattery social posts" on public.cattery_social_posts;
create policy "staff manage cattery social posts"
on public.cattery_social_posts for all to authenticated
using (public.open_home_can_manage_cattery(cattery_id))
with check (public.open_home_can_manage_cattery(cattery_id));

grant select, insert, update, delete on public.cattery_promotions to authenticated;
grant select, insert, update, delete on public.cattery_social_posts to authenticated;
grant all on public.cattery_promotions to service_role;
grant all on public.cattery_social_posts to service_role;

commit;
