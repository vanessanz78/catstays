import assert from 'node:assert/strict';
import test from 'node:test';
import { firstAvailablePhysicalRoom, type PhysicalRoomBooking } from './physicalRoomInventory';

const bookings: PhysicalRoomBooking[] = [
  {
    id: 'booking-1',
    room_id: 'private',
    room_unit_number: 1,
    check_in: '2026-09-01',
    check_out: '2026-09-05',
    status: 'confirmed',
  },
  {
    id: 'booking-2',
    check_in: '2026-09-03',
    check_out: '2026-09-07',
    status: 'confirmed',
    booking_cat_rooms: [{ room_id: 'private', room_unit_number: 2 }],
  },
];

test('assigns the first free physical room for overlapping dates', () => {
  assert.equal(firstAvailablePhysicalRoom('private', 17, bookings, '2026-09-04', '2026-09-06'), 3);
});

test('reuses the first physical room when dates do not overlap', () => {
  assert.equal(firstAvailablePhysicalRoom('private', 17, bookings, '2026-09-08', '2026-09-10'), 1);
});

test('returns no room when every physical room is occupied', () => {
  assert.equal(firstAvailablePhysicalRoom('private', 2, bookings, '2026-09-04', '2026-09-05'), null);
});
