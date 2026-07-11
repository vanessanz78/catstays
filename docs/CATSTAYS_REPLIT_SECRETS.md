# CatStays Replit Secrets

Use this as the source list when setting up CatStays in Replit.

Do not paste filled private secret values into GitHub, chat, screenshots, or committed files. The values marked `PASTE_FROM_*` must be added only inside Replit Secrets.

## Supabase project

- Project name: `CatStays`
- Project ref: `iwyoezwqorddkmqnjbif`
- Project URL: `https://iwyoezwqorddkmqnjbif.supabase.co`

## Replit Secrets to add

These are the private runtime secrets the app needs.

```env
SUPABASE_SERVICE_ROLE_KEY=PASTE_FROM_SUPABASE_PROJECT_SETTINGS_API_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY=PASTE_FROM_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=PASTE_FROM_STRIPE_WEBHOOK_SIGNING_SECRET
RESEND_API_KEY=PASTE_FROM_RESEND_API_KEYS
```

These are optional admin/setup secrets. Add them when you want to run the Supabase email template script from Replit.

```env
SUPABASE_ACCESS_TOKEN=PASTE_FROM_SUPABASE_ACCOUNT_ACCESS_TOKENS
SUPABASE_PROJECT_REF=iwyoezwqorddkmqnjbif
```

## Public values already in `.replit`

These are public/client-safe values already configured in `.replit`.

```env
CATSTAYS_APP_URL=https://catstays.app
VITE_PUBLIC_APP_URL=https://catstays.app
VITE_SUPABASE_URL=https://iwyoezwqorddkmqnjbif.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Y4Hwj84ljj86Lfec3xkUkg_TSsfZKG7
STRIPE_PUBLIC_KEY=pk_live_51TE1rTB3RIUlHBEr7mKyoXvhRRZX8kfO7cUc8f5f8CJLPXVFwJS9pzI0hL80qTIFU39Hfd1gUiCfyPIg73m6HSKf00rWNV4Ofo
```

`CATSTAYS_APP_URL` and `VITE_PUBLIC_APP_URL` should stay pointed at the live CatStays URL so Supabase confirmation emails do not inherit a Replit development preview origin.

## How `.replit` maps these names

The app code reads `STRIPE_API_KEY`, but `.replit` maps it from the Replit Secret named `STRIPE_SECRET_KEY`:

```toml
STRIPE_API_KEY = "$STRIPE_SECRET_KEY"
```

So in Replit Secrets, add `STRIPE_SECRET_KEY`, not `STRIPE_API_KEY`.

The app code reads `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `STRIPE_WEBHOOK_SECRET` directly, so those Replit Secret names must match exactly.

The publish provisioning route reads `CATSTAYS_APP_URL` for email confirmation redirects. The frontend reads `VITE_PUBLIC_APP_URL` for public app links.

## Where to get each private value

- `SUPABASE_SERVICE_ROLE_KEY`: Supabase dashboard > CatStays project > Project Settings > API > service role / secret key.
- `SUPABASE_ACCESS_TOKEN`: Supabase dashboard > Account > Access Tokens. This is only needed for project management tasks like applying Auth email templates.
- `STRIPE_SECRET_KEY`: Stripe dashboard > Developers > API keys > Secret key.
- `STRIPE_WEBHOOK_SECRET`: Stripe dashboard > Developers > Webhooks > CatStays endpoint > Signing secret.
- `RESEND_API_KEY`: Resend dashboard > API Keys.

## After adding secrets in Replit

Pull the latest GitHub version in Replit and restart the visible CatStays frontend. Replace `main` with the active branch when testing a feature branch:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main

pkill -f "vite|tsx|node" || true
pnpm --filter @workspace/catstays run dev
```

Every future Replit pull handoff should include the stop/start block. This keeps Replit from continuing to serve an old Vite, TSX, or Node process after the Git ref changes.

Supabase Auth email templates are versioned in:

```text
supabase/auth-email-templates/
```

Paste them into Supabase Dashboard under Authentication > Emails, using `docs/email-templates.md` as the checklist.
