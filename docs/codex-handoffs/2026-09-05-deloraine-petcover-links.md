# Deloraine Petcover links

## Scope

- Booking intake links the word `Petcover` to `https://www.petcovergroup.com/nz/cat-insurance/`.
- Booking intake provides a direct download of the supplied four-week trial policy PDF.
- Deloraine Cattery's published tenant website displays a four-week free Petcover trial promotion with the same two links.
- The tenant website promotion is gated to Deloraine Cattery as well as the existing Petcover feature flag.

## Guardrails

- The supplied PDF is hosted unchanged at `/documents/petcover-four-week-trial-policy.pdf`.
- The policy's SHA-256 is `d6bafa00ee6afea02c93c4c85d2f54087cf3c774b09b523db10227e6297a393b`.
- This release does not change Petcover eligibility, policy activation, booking persistence, customer notifications, payments, or Revelation sync.

## Verification

- `pnpm run test:public-booking-flow`
- `pnpm --filter @workspace/catstays run typecheck`
- `pnpm run build`
- Development and production browser UAT must confirm the external Petcover link, direct PDF response, and Deloraine-only website promotion.
