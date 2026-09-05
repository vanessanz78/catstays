import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('customer booking flow supports communal rooms, plain availability, and an explicit waitlist choice', () => {
  const source = readFileSync(new URL('./BookingFlow.tsx', import.meta.url), 'utf8');

  assert.match(source, /const MAX_PUBLIC_CATS = 25/);
  assert.match(source, /A shared communal facility with \$\{room\.room_count\} individual rooms/);
  assert.match(source, /\$\{numberOfCats\} individual room/);
  assert.match(source, /availability === 'whole' \|\| roomAvailability\?\.availability === 'split'/);
  assert.match(source, /Available for the whole stay/);
  assert.doesNotMatch(source, /Available with .*room move/);
  assert.doesNotMatch(source, /room move during stay/);
  assert.doesNotMatch(source, /Not suitable for .*sharing one room/);
  assert.match(source, /Would you like to be added to the waitlist\?/);
  assert.match(source, /We'll notify you as soon as a suitable room becomes available\./);
});

test('homepage booking restores date selection before opening the details-first flow', () => {
  const source = readFileSync(new URL('../onboarding/CatstaysTemplateSite.tsx', import.meta.url), 'utf8');

  assert.match(source, /name=\{label === 'Check-in' \? 'checkIn' : 'checkOut'\}/);
  assert.match(source, /querySelectorAll\('input\[type="date"\]'\)/);
  assert.match(source, /params\.set\('checkIn', dateInputs\[0\]\.value\)/);
  assert.match(source, /params\.set\('checkOut', dateInputs\[1\]\.value\)/);
  assert.match(source, /window\.location\.href = `\$\{liveBookingPath\(\)\}\$\{params\.toString\(\)/);
  assert.match(source, /if \(!embedded\) return/);
  assert.doesNotMatch(source, /select name="cats"/);
});
