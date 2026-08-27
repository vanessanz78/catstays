create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('owner', 'admin', 'support')),
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;

revoke all on table public.platform_admins from anon, authenticated;
grant all on table public.platform_admins to service_role;

drop policy if exists "Platform admins can verify their own access" on public.platform_admins;
create policy "Platform admins can verify their own access"
  on public.platform_admins
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Bootstrap the CatStays platform owner without hard-coding an environment-specific UUID.
-- Additional platform admins must be added deliberately through a privileged server or SQL action.
insert into public.platform_admins (user_id, role)
select owner_id, 'owner'
from public.catteries
where slug = 'delorainecattery'
on conflict (user_id) do update set role = excluded.role;

comment on table public.platform_admins is
  'Server-only allow-list for the CatStays cross-tenant operations dashboard. Browser clients verify access through the authenticated platform API.';
