# Loading repair

Working ref: `fix/loading-customer-booking-details-20260903`
Base: `542089b2746b986995255430810e05fd03fbdb8b`.

Production UAT found slow full-history reads, alert deep links waiting on those reads,
and customer nested OFFSET queries failing after the historical import.

- Resolve customer IDs with a stable cursor, then bounded tenant-filtered detail batches.
- Cancel superseded customer requests and ignore stale results.
- Fetch a requested booking independently; retain the complete availability snapshot.
- Select the booking interface fields rather than archived source payloads on every read.
- No schema, RLS, source archive, payment or synchronization mutations.

Verification: 21 pagination/scope tests, staff booking operations suite, frontend
typecheck and production build passed. Existing source-map/chunk warnings remain.
Runtime verification and publication are pending. Validate alert opening, customer
search and full history with the imported Deloraine dataset before signoff.

Replit Shell only. Preserve local publication checkpoints. Never use Replit Agent.
