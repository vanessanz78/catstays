# CatStays Supabase Auth Email Templates

These templates keep Supabase Auth emails visually consistent with CatStays app emails.

Use them in Supabase Dashboard under Authentication > Emails. Paste each HTML file into the matching email template:

- `confirmation.html` - Confirm signup
- `recovery.html` - Reset password
- `magic-link.html` - Magic link
- `invite.html` - Invite user
- `email-change.html` - Confirm email change
- `reauthentication.html` - Reauthentication code
- `trial-reminder.html` - Trial ending reminder reference
- `billing-reminder.html` - Billing reminder reference

To apply the Supabase Auth templates from Replit Shell instead of copy-pasting:

```bash
SUPABASE_PROJECT_REF="your-project-ref" SUPABASE_ACCESS_TOKEN="your-access-token" pnpm run apply:supabase-email-templates
```

The script updates the six Supabase Auth action templates only. Trial and billing reminders are app transactional emails and are not Supabase Auth templates.

Legacy filenames are retained for compatibility:

- `confirm-signup.html` mirrors `confirmation.html`
- `reset-password.html` mirrors `recovery.html`

The templates use Supabase Auth variables such as `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .Email }}`, and `{{ .SiteURL }}`.

Logo source:

`{{ .SiteURL }}/icons/icon-192.png`

Recommended production values:

- Site URL: `https://catstays.app`
- Sender name: `CatStays`
- Sender email: the verified CatStays transactional sender

App transactional emails are generated from:

`artifacts/api-server/src/lib/emailTemplates.ts`
