import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bookingHoursSummary,
  bookingTimeSlotsForDate,
  customerMatchesSearch,
  formatBookingTime,
  normalizeBookingSchedule,
} from './bookingSchedule';

const deloraineSchedule = {
  morningStart: '09:00',
  morningEnd: '10:30',
  afternoonStart: '16:30',
  afternoonEnd: '18:00',
  bookingInterval: '15',
  morningDays: [1, 2, 3, 4, 5, 6],
  afternoonDays: [0, 1, 2, 3, 4, 5, 6],
};

test('customer matches stay hidden until a real query is entered', () => {
  const customer = {
    name: 'Vanessa Wilson',
    email: 'owner@example.test',
    phone: '021 555 0100',
    cats: [{ name: 'Charlie' }],
  };

  assert.equal(customerMatchesSearch(customer, ''), false);
  assert.equal(customerMatchesSearch(customer, '   '), false);
  assert.equal(customerMatchesSearch(customer, 'wilson'), true);
  assert.equal(customerMatchesSearch(customer, 'charlie'), true);
  assert.equal(customerMatchesSearch(customer, '555 0100'), true);
  assert.equal(customerMatchesSearch(customer, 'owner@'), true);
  assert.equal(customerMatchesSearch(customer, 'missing'), false);
});

test('Deloraine Monday offers inclusive 15-minute morning and afternoon slots', () => {
  assert.deepEqual(bookingTimeSlotsForDate(deloraineSchedule, '2026-08-31'), [
    '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30',
    '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00',
  ]);
});

test('Deloraine Sunday offers afternoon slots only', () => {
  assert.deepEqual(bookingTimeSlotsForDate(deloraineSchedule, '2026-08-30'), [
    '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00',
  ]);
});

test('schedule supports nested booking rules and safe defaults', () => {
  const normalized = normalizeBookingSchedule({ bookingRules: { bookingInterval: '15' } });
  assert.equal(normalized.bookingInterval, 15);
  assert.deepEqual(normalized.morningDays, [0, 1, 2, 3, 4, 5, 6]);
});

test('time labels are customer-readable', () => {
  assert.equal(formatBookingTime('09:00'), '9:00 am');
  assert.equal(formatBookingTime('16:45'), '4:45 pm');
});

test('opening-hours summary reflects the configured Deloraine schedule', () => {
  assert.deepEqual(bookingHoursSummary(deloraineSchedule), {
    heading: 'Open seven days a week.',
    lines: [
      'Mornings: Monday to Saturday, 9:00 am to 10:30 am.',
      'Afternoons: Monday to Sunday, 4:30 pm to 6:00 pm.',
    ],
  });
});
