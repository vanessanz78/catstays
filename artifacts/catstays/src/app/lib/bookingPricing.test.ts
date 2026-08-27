import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBookingEstimate,
  inclusiveStayDays,
  longStayDiscountPercent,
} from './bookingPricing';

test('inclusiveStayDays counts both arrival and departure dates', () => {
  assert.equal(inclusiveStayDays('2026-08-28', '2026-08-28'), 1);
  assert.equal(inclusiveStayDays('2026-08-28', '2026-08-29'), 2);
  assert.equal(inclusiveStayDays('2026-08-28', '2026-09-03'), 7);
});

test('inclusiveStayDays rejects incomplete, invalid, or backwards ranges', () => {
  assert.equal(inclusiveStayDays('', '2026-08-29'), 0);
  assert.equal(inclusiveStayDays('not-a-date', '2026-08-29'), 0);
  assert.equal(inclusiveStayDays('2026-08-30', '2026-08-29'), 0);
});

test('calculateBookingEstimate updates for cats and inclusive days', () => {
  assert.deepEqual(calculateBookingEstimate({ dailyRate: 20, days: 2, numberOfCats: 1 }), {
    beforeDiscount: 40,
    discount: 0,
    subtotal: 40,
    gst: 6,
    total: 46,
  });

  assert.deepEqual(calculateBookingEstimate({ dailyRate: 20, days: 2, numberOfCats: 4 }), {
    beforeDiscount: 160,
    discount: 0,
    subtotal: 160,
    gst: 24,
    total: 184,
  });
});

test('long-stay discounts use inclusive day thresholds', () => {
  assert.equal(longStayDiscountPercent(14), 0);
  assert.equal(longStayDiscountPercent(15), 5);
  assert.equal(longStayDiscountPercent(30), 10);
  assert.equal(longStayDiscountPercent(60), 15);
});
