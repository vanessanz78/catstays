import test from 'node:test';
import assert from 'node:assert/strict';
import type { BookingWithDetails } from '@/hooks/useBookings';
import {
  addDateKey,
  bookingRoomIds,
  buildRoomSegments,
  buildTimelineDays,
  roomHasBookingConflict,
  shiftBookingDates,
} from './staffRoomTimeline';

function booking(overrides: Partial<BookingWithDetails> = {}): BookingWithDetails {
  return {
    id: 'booking-1',
    check_in: '2026-09-01',
    check_out: '2026-09-03',
    check_in_time: '09:00',
    check_out_time: '17:00',
    status: 'confirmed',
    payment_status: 'unpaid',
    total_amount: 60,
    notes: null,
    created_at: '2026-08-31T00:00:00Z',
    guest_name: null,
    guest_email: null,
    guest_phone: null,
    cat_names: null,
    number_of_cats: 1,
    room_arrangement: 'shared',
    room_unit_number: 1,
    customer: { id: 'customer-1', name: 'Vanessa Wilson', email: 'v@example.test', phone: null },
    room: { id: 'room-1', name: 'Private Room 1', type: 'private', price_per_night: 20 },
    booking_cats: [{ cat: { id: 'cat-1', name: 'Car', breed: null } }],
    booking_cat_rooms: [{
      room_unit_number: 1,
      cat: { id: 'cat-1', name: 'Car' },
      room: { id: 'room-1', name: 'Private Room 1', type: 'private', price_per_night: 20 },
    }],
    ...overrides,
  };
}

test('timeline dates and shifted bookings remain inclusive across month boundaries', () => {
  assert.deepEqual(buildTimelineDays('2026-08-31', 4), [
    '2026-08-31', '2026-09-01', '2026-09-02', '2026-09-03',
  ]);
  assert.equal(addDateKey('2026-08-31', 1), '2026-09-01');
  assert.deepEqual(shiftBookingDates('2026-08-31', '2026-09-07', '2026-09-10'), {
    checkIn: '2026-09-10',
    checkOut: '2026-09-17',
  });
});

test('room ids are unique across primary and per-cat assignments', () => {
  assert.deepEqual(bookingRoomIds(booking()), ['room-1']);
  assert.deepEqual(bookingRoomIds(booking({
    booking_cat_rooms: [
      { room_unit_number: 1, cat: { id: 'cat-1', name: 'Car' }, room: { id: 'room-1', name: 'Private 1', type: 'private', price_per_night: 20 } },
      { room_unit_number: 1, cat: { id: 'cat-2', name: 'Milo' }, room: { id: 'room-2', name: 'Private 2', type: 'private', price_per_night: 20 } },
    ],
  })), ['room-1', 'room-2']);
});

test('room segments clip to the visible window and stack overlaps into lanes', () => {
  const segments = buildRoomSegments([
    booking({ id: 'a', check_in: '2026-08-30', check_out: '2026-09-02' }),
    booking({ id: 'b', check_in: '2026-09-02', check_out: '2026-09-04' }),
    booking({ id: 'c', check_in: '2026-09-05', check_out: '2026-09-06' }),
  ], 'room-1', 1, '2026-09-01', '2026-09-07');

  assert.deepEqual(segments.map(({ booking: value, startIndex, endIndex, lane }) => ({ id: value.id, startIndex, endIndex, lane })), [
    { id: 'a', startIndex: 0, endIndex: 1, lane: 0 },
    { id: 'b', startIndex: 1, endIndex: 3, lane: 1 },
    { id: 'c', startIndex: 4, endIndex: 5, lane: 0 },
  ]);
});

test('conflict detection ignores cancelled and currently dragged bookings', () => {
  const bookings = [
    booking({ id: 'existing' }),
    booking({ id: 'cancelled', status: 'cancelled' }),
  ];
  assert.equal(roomHasBookingConflict(bookings, 'room-1', 1, '2026-09-03', '2026-09-04'), true);
  assert.equal(roomHasBookingConflict(bookings, 'room-1', 2, '2026-09-03', '2026-09-04'), false);
  assert.equal(roomHasBookingConflict(bookings, 'room-1', 1, '2026-09-04', '2026-09-05'), false);
  assert.equal(roomHasBookingConflict(bookings, 'room-1', 1, '2026-09-01', '2026-09-03', 'existing'), false);
});
