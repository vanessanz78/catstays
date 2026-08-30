# Messages recovery

## Issue

The staff menu marked Messages as **Soon** and both tenant routers sent `/staff-dashboard/messages` to the generic coming-soon panel. An older `AdminMessages` screen displayed a static empty state and a Draft button that did nothing, even though CatStays already had a tenant-scoped `customer_messages` table and email delivery infrastructure.

## Evidence

- `RightMenu.tsx` added a `Soon` badge to Messages.
- The main and tenant subdomain routers mapped the route to `StaffDashboard`, whose Messages section rendered `Messages is coming soon`.
- The older admin screen neither queried nor wrote `customer_messages`.
- The existing website enquiry endpoint emailed the cattery but did not journal the enquiry in the dashboard.
- CatStays already had an authenticated staff policy for `customer_messages`, a verified server-side Resend client, and client phone-notification delivery.

## Workflow restored

- Real tenant customer list with name, email, phone, and cat-name search.
- One chronological conversation per customer, including website enquiries, drafts, sent email, and failed delivery records.
- Booking-aware composer so a message can be linked to a real customer booking.
- Save and reopen drafts without sending anything.
- Server-side branded email delivery with the cattery email as Reply-To.
- StayDirect's safety principle retained: a queued dashboard history row must exist before email delivery is attempted.
- Sent/failed status and provider message id are written back to the same history row.
- Linked client accounts receive an installed-app notification after successful delivery.
- New public website enquiries are journalled as inbound customer messages after their cattery email is delivered.
- Shared staff navigation, live notification bell, and a responsive single-column phone layout.

## Security and data boundaries

- Message delivery requires a valid signed-in owner/staff token and verifies staff access to the selected cattery.
- The server re-fetches the cattery, customer, and optional booking; it does not trust browser-supplied email addresses or cattery names.
- A related booking is accepted only when it belongs to both the selected cattery and customer.
- Staff-entered subject and body content are length limited and HTML escaped before branded email rendering.
- Resend and the Supabase service role remain server-only.
- Drafts use the existing authenticated tenant RLS policy. No new database table or policy is required.

## Branch verification

- `git diff --check`
- `pnpm --filter @workspace/api-server exec tsx --test src/lib/emailTemplates.test.ts ../catstays/src/app/lib/customerMessages.test.ts`
- `pnpm --filter @workspace/api-server typecheck`
- `pnpm --filter @workspace/catstays typecheck`
- `pnpm --filter @workspace/catstays build`
- Local desktop route review.
- Local 390 px UAT: `innerWidth`, `clientWidth`, document `scrollWidth`, and body `scrollWidth` all equal 390.

## Customer UAT

1. Sign in to a cattery staff dashboard and choose **Messages**; confirm there is no **Soon** badge or coming-soon panel.
2. Search for a customer by name, email, phone, or cat name and select them.
3. Add a subject and message, choose **Save draft**, and confirm the page says nothing was sent.
4. Refresh the page, select the same customer, and use **Continue draft** to reopen it.
5. If the customer has a booking, select it under **Related booking**.
6. Use a customer email address you control, choose **Send email**, and confirm the success message appears only after delivery.
7. Confirm the sent message appears in Conversation history with a **sent** status and reaches the customer inbox with CatStays branding.
8. Reply to the email and confirm the reply is addressed to the cattery email.
9. Sign in as that linked client and confirm the installed CatStays app receives a message notification.
10. Submit the cattery website enquiry form using the same customer email, then refresh Messages and confirm it appears as an inbound website enquiry.
11. Repeat steps 1–4 at phone width and confirm there is no sideways scrolling.
