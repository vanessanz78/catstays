-- Run only after the safe public-booking application SHA is published.
-- Keeping activation separate prevents the previous production API from becoming
-- live during the schema-first deployment window.
begin;

do $$
declare affected integer;
begin
  update public.catteries
  set website_settings = jsonb_set(coalesce(website_settings, '{}'::jsonb), '{bookingMode}', '"live"'::jsonb, true),
      updated_at = now()
  where slug = 'delorainecattery';
  get diagnostics affected = row_count;
  if affected <> 1 then
    raise exception 'Expected exactly one Deloraine cattery, updated %', affected;
  end if;
end
$$;

commit;
