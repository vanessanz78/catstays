insert into public.customers (cattery_id, name, email, phone)
select
  b.cattery_id,
  max(coalesce(nullif(b.guest_name, ''), 'CatStays customer')) as name,
  lower(b.guest_email) as email,
  max(b.guest_phone) as phone
from public.bookings b
where b.customer_id is null
  and nullif(b.guest_email, '') is not null
  and not exists (
    select 1 from public.customers c
    where c.cattery_id = b.cattery_id
      and lower(c.email) = lower(b.guest_email)
  )
group by b.cattery_id, lower(b.guest_email);

update public.bookings b
set customer_id = c.id,
    updated_at = now()
from public.customers c
where b.customer_id is null
  and b.cattery_id = c.cattery_id
  and lower(b.guest_email) = lower(c.email);
