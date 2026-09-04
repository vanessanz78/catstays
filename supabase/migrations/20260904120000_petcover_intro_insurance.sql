begin;

alter table public.cats
  add column if not exists date_of_birth date,
  add column if not exists sex text,
  add column if not exists acquisition_type text,
  add column if not exists purchase_price numeric(10,2),
  add column if not exists microchip_number text;

create table if not exists public.petcover_applications (
  id uuid primary key default gen_random_uuid(),
  cattery_id uuid not null references public.catteries(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  cat_id uuid not null references public.cats(id) on delete cascade,
  offer_code text not null default 'petcover_intro_4_week',
  status text not null default 'ready_to_submit'
    check (status in ('ready_to_submit', 'submitted', 'active', 'declined', 'ineligible')),
  eligibility_reason text,
  cat_date_of_birth date,
  cat_sex text,
  acquisition_type text,
  purchase_price numeric(10,2),
  microchip_number text,
  declarations jsonb not null default '{}'::jsonb,
  policy_number text,
  policy_url text,
  submitted_at timestamptz,
  activated_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (booking_id, cat_id)
);

create index if not exists petcover_applications_cattery_status_idx
  on public.petcover_applications(cattery_id, status, created_at desc);
create index if not exists petcover_applications_customer_idx
  on public.petcover_applications(customer_id);
create index if not exists petcover_applications_cat_idx
  on public.petcover_applications(cat_id);

alter table public.petcover_applications enable row level security;

drop policy if exists "staff can manage Petcover applications" on public.petcover_applications;
create policy "staff can manage Petcover applications"
on public.petcover_applications
for all to authenticated
using (public.open_home_can_manage_cattery(cattery_id))
with check (public.open_home_can_manage_cattery(cattery_id));

drop trigger if exists petcover_applications_touch_updated_at on public.petcover_applications;
create trigger petcover_applications_touch_updated_at
before update on public.petcover_applications
for each row execute function public.catstays_touch_updated_at();

commit;