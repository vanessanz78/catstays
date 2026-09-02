begin;

create or replace function public.catstays_update_my_customer_profile(
  profile_name text,
  profile_phone text default null,
  profile_address text default null,
  profile_notes text default null
)
returns table (
  id uuid,
  name text,
  email text,
  phone text,
  address text,
  notes text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_customer public.customers%rowtype;
  clean_name text := trim(coalesce(profile_name, ''));
  clean_phone text := nullif(trim(coalesce(profile_phone, '')), '');
  clean_address text := nullif(trim(coalesce(profile_address, '')), '');
  clean_notes text := nullif(trim(coalesce(profile_notes, '')), '');
begin
  if auth.uid() is null then
    raise exception 'Sign in to update your details';
  end if;
  if char_length(clean_name) < 2 or char_length(clean_name) > 160 then
    raise exception 'Enter a customer name between 2 and 160 characters';
  end if;
  if char_length(coalesce(clean_phone, '')) > 50 then
    raise exception 'Keep the phone number under 50 characters';
  end if;
  if char_length(coalesce(clean_address, '')) > 500 then
    raise exception 'Keep the address under 500 characters';
  end if;
  if char_length(coalesce(clean_notes, '')) > 2000 then
    raise exception 'Keep the notes under 2,000 characters';
  end if;

  select customer.* into current_customer
  from public.customers customer
  where customer.user_id = auth.uid()
  order by customer.created_at
  limit 1
  for update;

  if current_customer.id is null then
    raise exception 'No customer record is linked to this login';
  end if;

  return query
  update public.customers customer
  set name = clean_name,
      phone = clean_phone,
      address = clean_address,
      notes = clean_notes,
      updated_at = now()
  where customer.id = current_customer.id
  returning customer.id, customer.name, customer.email, customer.phone, customer.address, customer.notes;
end;
$$;

create or replace function public.catstays_upsert_my_cat(
  target_cat_id uuid,
  cat_name text,
  cat_breed text default null,
  cat_age text default null,
  cat_medical_notes text default null,
  cat_dietary_requirements text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_customer public.customers%rowtype;
  saved_cat_id uuid;
  clean_name text := trim(coalesce(cat_name, ''));
  clean_breed text := nullif(trim(coalesce(cat_breed, '')), '');
  clean_age text := nullif(trim(coalesce(cat_age, '')), '');
  clean_medical text := nullif(trim(coalesce(cat_medical_notes, '')), '');
  clean_diet text := nullif(trim(coalesce(cat_dietary_requirements, '')), '');
begin
  if auth.uid() is null then
    raise exception 'Sign in to update a cat';
  end if;
  if char_length(clean_name) < 1 or char_length(clean_name) > 120 then
    raise exception 'Enter a cat name under 120 characters';
  end if;
  if char_length(coalesce(clean_breed, '')) > 120 or char_length(coalesce(clean_age, '')) > 80 then
    raise exception 'Keep the breed and age concise';
  end if;
  if char_length(coalesce(clean_medical, '')) > 4000 or char_length(coalesce(clean_diet, '')) > 4000 then
    raise exception 'Keep each care note under 4,000 characters';
  end if;

  select customer.* into current_customer
  from public.customers customer
  where customer.user_id = auth.uid()
  order by customer.created_at
  limit 1;

  if current_customer.id is null then
    raise exception 'No customer record is linked to this login';
  end if;

  if target_cat_id is null then
    insert into public.cats (
      customer_id,
      cattery_id,
      name,
      breed,
      age,
      medical_notes,
      dietary_requirements
    ) values (
      current_customer.id,
      current_customer.cattery_id,
      clean_name,
      clean_breed,
      clean_age,
      clean_medical,
      clean_diet
    )
    returning id into saved_cat_id;
  else
    update public.cats cat
    set name = clean_name,
        breed = clean_breed,
        age = clean_age,
        medical_notes = clean_medical,
        dietary_requirements = clean_diet
    where cat.id = target_cat_id
      and cat.customer_id = current_customer.id
      and cat.cattery_id = current_customer.cattery_id
    returning cat.id into saved_cat_id;

    if saved_cat_id is null then
      raise exception 'That cat is not linked to this customer login';
    end if;
  end if;

  return saved_cat_id;
end;
$$;

drop policy if exists "Customers read their own customer messages" on public.customer_messages;
create policy "Customers read their own customer messages"
on public.customer_messages
for select
to authenticated
using (
  customer_id in (
    select customer.id
    from public.customers customer
    where customer.user_id = (select auth.uid())
  )
);

grant execute on function public.catstays_update_my_customer_profile(text, text, text, text) to authenticated;
grant execute on function public.catstays_upsert_my_cat(uuid, text, text, text, text, text) to authenticated;
grant select on table public.customer_messages to authenticated;

revoke all on function public.catstays_update_my_customer_profile(text, text, text, text) from anon;
revoke all on function public.catstays_upsert_my_cat(uuid, text, text, text, text, text) from anon;

comment on function public.catstays_update_my_customer_profile(text, text, text, text) is
  'Lets a signed-in customer update only the safe contact fields on their linked customer record.';
comment on function public.catstays_upsert_my_cat(uuid, text, text, text, text, text) is
  'Lets a signed-in customer add or edit a cat linked to their own customer record.';

commit;
