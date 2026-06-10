# CatStays Email Templates

Supabase Auth email templates are configured in the Supabase dashboard, not through SQL migrations.

Use these files as the versioned source for the CatStays-branded templates:

- `confirm-signup.html` - Supabase Auth confirmation email.
- `magic-link.html` - Supabase Auth magic link email.
- `reset-password.html` - Supabase Auth password recovery email.
- `trial-reminder.html` - App transactional email for trial ending reminders.
- `billing-reminder.html` - App transactional email for billing reminders.

For Supabase Auth templates, paste the HTML into:

Authentication > Emails > Templates

The Auth templates use Supabase variables such as `{{ .ConfirmationURL }}`, `{{ .Email }}`, and `{{ .SiteURL }}`.

Before turning on live sending:

1. Set the Site URL to the production CatStays domain.
2. Add `https://catstays.app/confirm-email` to the allowed redirect URLs.
3. Add Replit preview URLs used for testing to the allowed redirect URLs.
4. Configure custom SMTP for the final branded sender domain.
5. Send a test signup and confirm that the link returns to `/confirm-email`.
