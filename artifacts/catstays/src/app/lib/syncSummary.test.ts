import test from 'node:test';
import assert from 'node:assert/strict';
import {syncSummaryText} from './syncSummary';
test('empty and zero changes do not invent updates',()=>{
  assert.equal(syncSummaryText({bookings:{added:0,updated:0}}),'Sync complete. No changes since the last sync.');
});
test('summary separates new and updated records without historical warnings',()=>{
  assert.equal(syncSummaryText({bookings:{added:1,updated:2},cats:{added:1,updated:0}}),'Sync complete: 1 booking added, 2 bookings updated, 1 cat added.');
});
