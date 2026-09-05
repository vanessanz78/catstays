# Booking Workflow

Last reviewed: 2026-09-05

## Public Booking Request

The current public booking flow follows this order:

1. Your Details: customer name, email, and phone.
2. Your Cats: one collapsible card per cat, optional breed and notes, and optional Petcover intake.
3. Dates & Room: dates, configured arrival/departure times, and live accommodation availability.
4. Review & Submit: the booking request, split-room request, or waitlist request is clearly labelled before submission.

The cat cards are the only source of the cat count. Adding another cat collapses the current card and opens the new one. The dates step must not ask for a second count.

Petcover is optional. When selected, date of birth is required and may be a best estimate, while the microchip number remains optional. Accept all selects every declaration. CatStays collects the details for staff to enter manually.

The public flow counts both the arrival date and departure date as chargeable days. Its base estimate is `daily rate × number of cats × inclusive days` before discounts and GST.

After dates and cats are known, the public API returns one of four states for each accommodation type:

- `whole`: one physical room is free for every care day.
- `split`: continuous capacity exists by moving the stay across no more than three physical rooms of that accommodation type.
- `waitlist`: no continuous whole/split plan currently exists, but the customer may request that accommodation type.
- `not_suitable`: one physical room cannot hold all cats in the request.

Submission performs the same authoritative check again on the API server. Whole and split results are stored as pending booking requests; split plans are stored in `booking_room_segments`. Waitlist results use `status = 'waitlist'`, preserve the requested accommodation type, and deliberately have no physical room number. All paths create the customer-facing and owner-facing receipt email appropriate to their status.

Waitlist rows do not reserve a room or count as occupancy or booking revenue. Availability is refreshed after relevant CatStays booking changes and after completed manual or nightly Revelation changes-only syncs. On the first available transition, CatStays saves an inbox/native phone notification and emails the cattery owner with a direct booking link and a prompt to slot the customer. The authenticated Slot into room action rechecks current capacity, assigns the whole/split plan, and moves the request to pending for the normal review/confirmation workflow.

## Dashboard Booking Management

The staff dashboard can show bookings, customers, physical-room rows, and booking details. Staff-created shared bookings persist one room number; separate-room bookings persist the exact room number for each cat. Calendar clicks preselect an exact physical room, and drag/drop validates capacity and conflicts before moving a stay.

## Booking States

The product should use a clear booking lifecycle:

- Draft
- Pending request
- Waitlist request
- Accepted
- Deposit requested
- Deposit paid
- Confirmed
- Checked in
- Checked out
- Cancelled

The current database has booking status and payment status fields, but the UI needs a clearer approval and lifecycle workflow.

## Gaps

- A database-level exclusion strategy for simultaneous overlapping requests remains a future hardening item; current public requests perform the authoritative availability check on the API server before insert.
- Public booking reads should not expose sensitive booking data.
- Customer self-service edits, cancellations, and repeat bookings are not complete.
- Automatic confirmation requires authoritative server-side room availability and capacity enforcement.
- Customer login requires authenticated customer ownership and tenant-isolated booking/cat access.
- Stripe deposit/full-payment and bank-transfer flows need approved cattery payment rules and full test-mode verification before public release.
- Physical phone notification receipt still requires device-level production UAT with notifications enabled; email and in-app records alone are not proof of phone delivery.
