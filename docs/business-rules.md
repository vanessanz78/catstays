# Business Rules

Last reviewed: 2026-06-12

## Product Scope

- CatStays is for cats only.
- CatStays is for boarding catteries only during MVP.
- Dog kennels, general pet boarding, grooming, and appointment calendars are out of MVP scope.
- Grooming may be considered later, but it should not complicate the first booking and boarding workflow.

## Plans

Starter: $49/month

- Public website.
- Booking dashboard.
- Booking management.
- Customer communication.
- Payments setup.

Professional: $79/month

- Starter features.
- Client portal.
- Cat updates.
- Reminders.
- Reports.

Premium: $99/month

- Professional features.
- Custom domain.
- Marketing tools.
- Advanced reports.
- Accounting support.

## Trial

- Trial length: 14 days.
- Trial users should receive access to premium features during the trial.
- After trial, features should lock according to the selected plan unless the subscription is active.
- Trial messaging should be clear before and after publishing.

## Domains

- Default cattery sites use CatStays subdomains.
- Premium customers can request a custom domain.
- Custom-domain requests should create an action for the CatStays platform owner.
- Domain setup may require manual Replit and Cloudflare steps until automation is built.

## Customer Communication

- Photo updates should be warm and personal.
- AI-generated messages must be owner-reviewed before sending.
- Cat voice can be an option, but the owner should be able to toggle to caretaker voice.
- Customer updates should be sent through the customer portal and appropriate notifications.

## Design And Brand Rules

- CatStays should feel calm, premium, mobile-friendly, and cattery-specific.
- Use the chosen palette: navy, greys, browns, terracotta, sand, and muted supporting tones.
- Avoid random greens, purples, reds, pinks, and yellows in operational UI unless they are deliberately mapped status colours.
- Avoid generic SaaS icons when real cattery imagery or product-specific UI communicates better.

## Data And Security Rules

- Customer data must be tenant-isolated.
- Customer portal users must only see their own data.
- Cattery owners and staff must only see their cattery data.
- CatStays platform admin access must be separate from cattery staff access.
- Do not commit private API keys or service-role secrets.
