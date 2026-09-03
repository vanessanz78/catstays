import assert from 'node:assert/strict';
import test from 'node:test';
import { applyBookingReadScope, bookingReadScope, bookingListScope, matchesBookingListView } from './bookingReadScope.ts';

test('reports and default consumers retain complete history', () => {
  assert.deepEqual(bookingReadScope(), {});
  assert.deepEqual(bookingReadScope({ allPages: true, checkOutFrom: '2026-09-03' }), {});
});
test('current scope includes stays already in progress and departure today', () => {
  const calls: unknown[] = [];
  const query = { gte(column: string, value: string) { calls.push([column, value]); return this; }, lte() { throw new Error('Unexpected upper bound'); } };
  assert.equal(applyBookingReadScope(query, bookingReadScope({ checkOutFrom: '2026-09-03' })), query);
  assert.deepEqual(calls, [['check_out', '2026-09-03']]);
});
test('full-history scope adds no date filter', () => {
  const query = { gte() { throw new Error('Unexpected date filter'); }, lte() { throw new Error('Unexpected date filter'); } };
  assert.equal(applyBookingReadScope(query, bookingReadScope()), query);
});

test('operational tabs use bounded non-overlapping date ranges; search keeps history', () => {
  assert.deepEqual(bookingListScope('current', '2026-09-03'), {checkOutFrom:'2026-09-03',checkInThrough:'2026-09-03'});
  assert.deepEqual(bookingListScope('future', '2026-09-03'), {checkInFrom:'2026-09-04'});
  assert.deepEqual(bookingListScope('recent', '2026-09-03'), {checkOutFrom:'2026-08-04',checkOutThrough:'2026-09-02'});
  assert.deepEqual(bookingListScope('current', '2026-09-03', 'Old cat'), {});
  assert.deepEqual(bookingListScope('future', '2026-12-31'), {checkInFrom:'2027-01-01'});
});

test('current matches occupancy and future excludes today', () => {
  const stay = {checkIn:'2026-09-03',checkOut:'2026-09-03',status:'confirmed'};
  assert.equal(matchesBookingListView(stay,'current','2026-09-03'), true);
  assert.equal(matchesBookingListView(stay,'future','2026-09-03'), false);
  for (const status of ['cancelled','waitlist','checked_out']) assert.equal(matchesBookingListView({...stay,status},'current','2026-09-03'), false);
  const old = {...stay,checkIn:'2016-01-01',checkOut:'2016-01-02'};
  assert.equal(matchesBookingListView(old,'recent','2026-09-03'), false);
  assert.equal(matchesBookingListView(old,'current','2026-09-03','old'), true);
});

test('upper and lower bounds are applied before fetching records', () => {
  const calls: unknown[] = [];
  const query = {gte(column:string,value:string){calls.push(['gte',column,value]);return this;},lte(column:string,value:string){calls.push(['lte',column,value]);return this;}};
  applyBookingReadScope(query, bookingListScope('recent','2026-09-03'));
  assert.deepEqual(calls,[['gte','check_out','2026-08-04'],['lte','check_out','2026-09-02']]);
  assert.throws(()=>bookingReadScope({checkInThrough:'2026-02-30'}),/Invalid booking read date/);
});
test('reject malformed and impossible dates before querying', () => {
  for (const date of ['03/09/2026', '2026-02-30', '2026-13-03', 'bad']) {
    assert.throws(() => bookingReadScope({ checkOutFrom: date }), /Invalid booking read date/);
  }
});
