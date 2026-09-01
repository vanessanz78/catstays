import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bookingAlertCount,
  notificationBookingId,
  pendingBookingSummary,
  visibleOtherNotifications,
} from './bookingAlerts';

const notifications = [
  {
    type: 'booking_request',
    read_at: null,
    url: '/staff-dashboard/bookings',
    metadata: { bookingId: 'booking-1' },
  },
  {
    type: 'customer_message',
    read_at: null,
    url: '/staff-dashboard/messages',
    metadata: {},
  },
  {
    type: 'booking_request',
    read_at: '2026-09-01T00:00:00.000Z',
    url: '/staff-dashboard/bookings?booking=booking-2',
    metadata: {},
  },
];

test('booking alerts recover the booking id from metadata or a direct URL', () => {
  assert.equal(notificationBookingId(notifications[0]), 'booking-1');
  assert.equal(notificationBookingId(notifications[2]), 'booking-2');
});

test('live pending bookings replace duplicate booking-request notifications', () => {
  assert.deepEqual(
    visibleOtherNotifications(notifications, ['booking-1']).map((notification) => notification.type),
    ['customer_message', 'booking_request'],
  );
  assert.equal(bookingAlertCount(['booking-1'], notifications), 2);
});

test('pending-booking summary is clear and grammatically correct', () => {
  assert.equal(pendingBookingSummary(0), 'No pending bookings');
  assert.equal(pendingBookingSummary(1), 'You have 1 pending booking');
  assert.equal(pendingBookingSummary(3), 'You have 3 pending bookings');
});
