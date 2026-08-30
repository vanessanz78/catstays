import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCatUpdateCandidates,
  catUpdateFileError,
  normalizeCatUpdateCaption,
  safeCatUpdateFilename,
} from './catUpdates';

test('normalises captions and filenames without inventing content', () => {
  assert.equal(normalizeCatUpdateCaption('  Milo had breakfast.  \r\nToday he relaxed. \n'), 'Milo had breakfast.\nToday he relaxed.');
  assert.equal(safeCatUpdateFilename('Milo Sunday Photo!!.JPG'), 'milo-sunday-photo.jpg');
});

test('rejects unsafe or oversized photo uploads', () => {
  assert.match(catUpdateFileError({ name: 'photo.gif', type: 'image/gif', size: 20 }), /JPG/);
  assert.match(catUpdateFileError({ name: 'photo.jpg', type: 'image/jpeg', size: 9 * 1024 * 1024 }), /8 MB/);
  assert.equal(catUpdateFileError({ name: 'photo.webp', type: 'image/webp', size: 1024 }), '');
});

test('builds real booking-cat choices with boarding cats first and their assigned room', () => {
  const candidates = buildCatUpdateCandidates([
    {
      id: 'upcoming', check_in: '2026-09-02', check_out: '2026-09-05', status: 'confirmed',
      customer: { id: 'customer-1', name: 'Vanessa', email: 'vanessa@example.com' },
      room: { id: 'room-1', name: 'Shared room' },
      booking_cats: [{ cat: { id: 'cat-1', name: 'Milo' } }], booking_cat_rooms: [],
    },
    {
      id: 'current', check_in: '2026-08-29', check_out: '2026-09-01', status: 'checked_in',
      customer: { id: 'customer-2', name: 'Wilson', email: 'wilson@example.com' },
      room: null,
      booking_cats: [{ cat: { id: 'cat-2', name: 'Poppy' } }],
      booking_cat_rooms: [{ cat: { id: 'cat-2', name: 'Poppy' }, room: { id: 'room-2', name: 'Private Suite 2' } }],
    },
  ], '2026-08-30');

  assert.deepEqual(candidates.map((candidate) => candidate.catName), ['Poppy', 'Milo']);
  assert.equal(candidates[0]?.stayStatus, 'boarding');
  assert.equal(candidates[0]?.roomName, 'Private Suite 2');
  assert.equal(candidates[1]?.customerId, 'customer-1');
});

test('excludes cancelled bookings and bookings without a linked customer', () => {
  const base = {
    check_in: '2026-08-29', check_out: '2026-09-01', room: null, booking_cat_rooms: [],
    booking_cats: [{ cat: { id: 'cat-1', name: 'Milo' } }],
  };
  assert.equal(buildCatUpdateCandidates([
    { ...base, id: 'cancelled', status: 'cancelled', customer: { id: 'one', name: 'One', email: 'one@example.com' } },
    { ...base, id: 'orphan', status: 'confirmed', customer: null },
  ], '2026-08-30').length, 0);
});
