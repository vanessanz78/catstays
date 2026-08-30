-- Align older CatStays availability_rules tables with the foundational schema.
-- Production originally used starts_on/ends_on/is_active; current code uses
-- timestamp ranges and an explicit status while preserving the older columns.

alter table public.availability_rules
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists status text not null default 'active';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'availability_rules' and column_name = 'starts_on'
  ) then
    execute $sql$
      update public.availability_rules
      set starts_at = coalesce(starts_at, starts_on::timestamptz)
      where starts_on is not null
    $sql$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'availability_rules' and column_name = 'ends_on'
  ) then
    execute $sql$
      update public.availability_rules
      set ends_at = coalesce(ends_at, (ends_on + 1)::timestamptz - interval '1 millisecond')
      where ends_on is not null
    $sql$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'availability_rules' and column_name = 'is_active'
  ) then
    execute $sql$
      update public.availability_rules
      set status = case when is_active then 'active' else 'paused' end
    $sql$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.availability_rules'::regclass
      and conname = 'availability_rules_status_check'
  ) then
    alter table public.availability_rules
      add constraint availability_rules_status_check
      check (status in ('active', 'paused', 'archived'));
  end if;
end
$$;

create index if not exists availability_rules_active_range_idx
  on public.availability_rules(cattery_id, starts_at, ends_at)
  where status = 'active';

comment on column public.availability_rules.starts_at is
  'Inclusive start timestamp used by current CatStays availability workflows.';

comment on column public.availability_rules.ends_at is
  'Inclusive end timestamp used by current CatStays availability workflows.';

