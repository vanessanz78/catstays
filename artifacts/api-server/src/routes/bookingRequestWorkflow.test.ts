import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('public booking requests persist pending before staff bell and email delivery', () => {
  const source = readFileSync(new URL('./email.ts', import.meta.url), 'utf8');
  const requestRoute = source.slice(source.indexOf("router.post('/bookings/request'"), source.indexOf("router.post('/email/test'"));
  const pendingInsert = requestRoute.indexOf("status: waitlistRequested ? 'waitlist' : 'pending'");
  const staffNotification = requestRoute.indexOf('void notifyCatteryStaff');
  const ownerEmail = requestRoute.indexOf('resend.emails.send');

  assert.ok(pendingInsert >= 0 && pendingInsert < staffNotification);
  assert.ok(staffNotification >= 0 && staffNotification < ownerEmail);
  assert.match(requestRoute, /type: waitlistRequested \? 'waitlist_request' : 'booking_request'/);
  assert.match(requestRoute, /New booking request/);
});

test('public communal bookings write one physical-room assignment per cat', () => {
  const source = readFileSync(new URL('./email.ts', import.meta.url), 'utf8');
  const requestRoute = source.slice(source.indexOf("router.post('/bookings/request'"), source.indexOf("router.post('/email/test'"));

  assert.match(requestRoute, /resolvedRoomAllocation\?\.usesOneRoomPerCat/);
  assert.match(requestRoute, /from\('booking_cat_rooms'\)\.insert/);
  assert.match(requestRoute, /room_unit_number: resolvedRoomAllocation\.unitNumbers\[index\]/);
  assert.match(requestRoute, /room_arrangement: resolvedRoomAllocation\?\.usesOneRoomPerCat \? 'separate' : 'shared'/);
  assert.match(requestRoute, /status: waitlistRequested \? 'waitlist' : 'pending'/);
});
