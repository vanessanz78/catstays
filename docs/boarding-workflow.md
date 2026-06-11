# Boarding Workflow

Last reviewed: 2026-06-12

## Purpose

Boarding is the operational workflow after a booking is accepted. It covers the cat's arrival, stay, owner updates, tasks, notes, and checkout.

## Current Status

CatStays currently has booking, room, calendar, dashboard, and photo update concepts. This gives the foundation for boarding operations, but boarding is not yet a complete first-class workflow in the database or UI.

## Target Boarding Flow

1. Arrival due today.
2. Check cat in.
3. Confirm room/run allocation.
4. Record feeding, medication, vaccination, and care notes.
5. Schedule or prompt photo updates.
6. Send approved customer updates through the portal.
7. Track incidents or special care.
8. Prepare checkout.
9. Check cat out.
10. Send final invoice or follow-up.

## Data Needed

Future boarding tables or fields should support:

- Stay records separate from booking requests.
- Check-in and check-out timestamps.
- Room movements.
- Care tasks.
- Feeding and medication logs.
- Photo update records.
- Incident notes.
- Staff assignments.

## Gaps

- No dedicated stay table is currently visible in migrations.
- Boarding task workflow is not complete.
- Photo update history needs durable storage.
- Staff role permissions need definition.
- Mobile arrival/check-in/check-out experience needs focused testing.
