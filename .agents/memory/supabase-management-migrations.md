---
name: Supabase management migrations
description: Applying migrations when the Supabase CLI cannot create its login role.
---

The project’s Supabase CLI may fail during `migration list` or `db push` because the managed database denies the CLI login-role alteration. The Supabase project management database-query endpoint can apply the SQL directly; record manually applied versions in `supabase_migrations.schema_migrations` so future migration tooling does not treat them as pending.

**Why:** The active project uses restricted database roles, while the management API still has the required migration privileges.

**How to apply:** Use the workspace’s Supabase project reference and management access token without printing either value, run the migration SQL in order, verify the resulting tables/settings through the API, and keep the migration file committed.