-- Platform administration is verified by the authenticated server endpoint.
-- Browser roles do not need direct PostgREST or GraphQL access to this allow-list.
revoke all on table public.platform_admins from anon, authenticated;
grant all on table public.platform_admins to service_role;

comment on table public.platform_admins is
  'Server-only allow-list for the CatStays cross-tenant operations dashboard. Browser clients verify access through the authenticated platform API.';
