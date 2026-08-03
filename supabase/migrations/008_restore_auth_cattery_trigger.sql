-- CatStays: restore Auth -> cattery provisioning trigger

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  business text;
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  business := COALESCE(NULLIF(NEW.raw_user_meta_data->>'business_name', ''), 'My Cattery');
  base_slug := trim(both '-' from regexp_replace(lower(business), '[^a-z0-9]+', '-', 'g'));
  IF base_slug = '' THEN
    base_slug := 'my-cattery';
  END IF;

  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.catteries WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO public.catteries (owner_id, name, slug, email)
  VALUES (NEW.id, business, final_slug, NEW.email)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.catteries (owner_id, name, slug, email)
SELECT
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data->>'business_name', ''), 'My Cattery') AS name,
  trim(both '-' from regexp_replace(lower(COALESCE(NULLIF(u.raw_user_meta_data->>'business_name', ''), 'my-cattery')), '[^a-z0-9]+', '-', 'g'))
    || '-' || left(replace(u.id::text, '-', ''), 8) AS slug,
  u.email
FROM auth.users u
LEFT JOIN public.catteries c ON c.owner_id = u.id
WHERE c.id IS NULL
ON CONFLICT DO NOTHING;
