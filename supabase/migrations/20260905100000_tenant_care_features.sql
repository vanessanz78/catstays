begin;

-- Existing Deloraine launch tenant has the Petcover offer enabled deliberately.
-- Other tenants remain off until an owner enables a feature in Booking Setup.
update public.catteries
set website_settings = coalesce(website_settings, '{}'::jsonb) ||
  '{"petcoverOfferEnabled":true,"groomingEnabled":false}'::jsonb
where slug = 'delorainecattery'
   or regexp_replace(lower(coalesce(name, '')), '[^a-z0-9]+', '', 'g') = 'delorainecattery';

commit;