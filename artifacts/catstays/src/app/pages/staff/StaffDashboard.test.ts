import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { buildDashboardData, dailyBookingAction } from '../../lib/staffDashboard';

test('Today detail panels start closed with native keyboard-accessible disclosure', () => {
  const source = readFileSync(new URL('./StaffDashboard.tsx', import.meta.url), 'utf8');
  const panel = source.slice(source.indexOf('function TodayPanel'), source.indexOf('function NewBookingDraft'));
  assert.match(panel, /<details className=/);
  assert.doesNotMatch(panel, /<details[^>]*\bopen[=\s>]/);
  assert.match(panel, /<summary/);
  assert.match(panel, /group-open:rotate-90/);
  for (const title of ['Currently Occupied', 'Pending bookings', 'Latest bookings', '7-day occupancy', 'Workspace', 'Website']) {
    assert.ok(source.includes(`<TodayPanel title="${title}"`));
  }
});

function booking(overrides: Record<string, unknown>) {
  return {
    id: 'booking',
    check_in: '2026-09-02',
    check_out: '2026-09-04',
    check_in_time: '09:30',
    check_out_time: '16:30',
    status: 'confirmed',
    payment_status: 'unpaid',
    total_amount: 60,
    created_at: '2026-09-02T10:00:00.000Z',
    room_unit_number: 1,
    room: { id: 'room-private', name: 'Private Room', type: 'private', price_per_night: 20 },
    booking_cats: [],
    booking_cat_rooms: [],
    booking_room_segments: [],
    booking_adjustments: [],
    payments: [],
    ...overrides,
  };
}

const rooms = [{
  id: 'room-private',
  name: 'Private Room',
  type: 'private',
  room_count: 3,
  capacity: 3,
  price_per_night: 20,
  is_active: true,
}];

test('daily dashboard keeps recent work, live occupancy, and day-end figures distinct', () => {
  const data = buildDashboardData([
    booking({ id: 'arrival', created_at: '2026-09-02T10:00:00.000Z' }),
    booking({
      id: 'departure',
      check_in: '2026-09-01',
      check_out: '2026-09-02',
      status: 'checked_out',
      room_unit_number: 2,
      created_at: '2026-09-02T11:00:00.000Z',
    }),
    booking({ id: 'waiting', status: 'waitlist', room_unit_number: 3, created_at: '2026-09-02T11:30:00.000Z' }),
    booking({ id: 'cancelled', status: 'cancelled', created_at: '2026-09-02T12:00:00.000Z' }),
  ] as never, rooms as never, '2026-09-02');

  assert.deepEqual(data.arrivalsToday.map((item) => item.id), ['arrival']);
  assert.deepEqual(data.departuresToday.map((item) => item.id), ['departure']);
  assert.deepEqual(data.occupiedNow.map((item) => item.id), ['arrival']);
  assert.deepEqual(data.latestBookings.map((item) => item.id), ['departure', 'arrival']);
  assert.equal(data.occupancyWeek[0].count, 2);
  assert.equal(data.occupancyWeek[0].arrivals, 1);
  assert.equal(data.occupancyWeek[0].departures, 1);
  assert.equal(data.occupancyWeek[0].dayEnd, 1);
});

test('arrival and departure shortcuts become completed labels after use', () => {
  assert.deepEqual(dailyBookingAction('confirmed', 'arrival'), { label: 'Check in', nextStatus: 'checked_in' });
  assert.deepEqual(dailyBookingAction('checked_in', 'arrival'), { label: 'In', nextStatus: null });
  assert.deepEqual(dailyBookingAction('pending', 'arrival'), { label: 'Review', nextStatus: null });
  assert.deepEqual(dailyBookingAction('checked_in', 'departure'), { label: 'Check out', nextStatus: 'checked_out' });
  assert.deepEqual(dailyBookingAction('confirmed', 'departure'), { label: 'Open', nextStatus: null });
  assert.deepEqual(dailyBookingAction('checked_out', 'departure'), { label: 'Out', nextStatus: null });
});
