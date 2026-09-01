import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bookingNeedsRoomUnit,
  bookingRoomUnitKeys,
  expandPhysicalRooms,
  firstAvailableRoomUnit,
  physicalRoomName,
  roomUnitHasConflict,
} from './roomInventory';

const privateRoom = {
  id: 'private',
  name: 'Private Suite',
  type: 'private',
  capacity: 3,
  room_count: 17,
  is_active: true,
};

const booking = {
  id: 'booking-1',
  check_in: '2026-09-01',
  check_out: '2026-09-03',
  status: 'confirmed',
  room_unit_number: 1,
  room: { id: 'private' },
  booking_cat_rooms: [],
};

test('physical inventory expands room types in operational order', () => {
  const rows = expandPhysicalRooms([
    { id: 'communal', name: 'Communal Room', type: 'standard', capacity: 1, room_count: 25, is_active: true },
    privateRoom,
    { id: 'indoor', name: 'Indoor Suite', type: 'indoor', capacity: 2, room_count: 8, is_active: true },
  ]);

  assert.equal(rows.length, 50);
  assert.deepEqual(rows.slice(0, 2).map((row) => row.name), ['Private Room 1', 'Private Room 2']);
  assert.equal(rows[16]?.name, 'Private Room 17');
  assert.equal(rows[17]?.name, 'Indoor Room 1');
  assert.equal(rows[24]?.name, 'Indoor Room 8');
  assert.equal(rows[25]?.name, 'Communal Room 1');
  assert.equal(rows[49]?.name, 'Communal Room 25');
});

test('physical room names are based on the accommodation type', () => {
  assert.equal(physicalRoomName(privateRoom, 1), 'Private Room 1');
  assert.equal(physicalRoomName({ name: 'Indoor Suite', type: 'standard' }, 8), 'Indoor Room 8');
});

test('room-unit occupancy distinguishes rooms of the same type', () => {
  assert.deepEqual(bookingRoomUnitKeys(booking), ['private:1']);
  assert.equal(roomUnitHasConflict([booking], 'private', 1, '2026-09-03', '2026-09-05'), true);
  assert.equal(roomUnitHasConflict([booking], 'private', 2, '2026-09-03', '2026-09-05'), false);
  assert.equal(firstAvailableRoomUnit(privateRoom, [booking], '2026-09-02', '2026-09-04')?.unitNumber, 2);
});

test('legacy bookings without a physical room number remain visibly unassigned', () => {
  assert.equal(bookingNeedsRoomUnit({ ...booking, room_unit_number: null }), true);
});

test('split room conflicts use the segment dates rather than the whole stay', () => {
  const split = {
    ...booking,
    check_out: '2026-09-06',
    booking_room_segments: [
      { starts_on: '2026-09-01', ends_on: '2026-09-03', room_unit_number: 1, room: { id: 'private' } },
      { starts_on: '2026-09-04', ends_on: '2026-09-06', room_unit_number: 2, room: { id: 'private' } },
    ],
  };
  assert.equal(roomUnitHasConflict([split], 'private', 1, '2026-09-04', '2026-09-06'), false);
  assert.equal(roomUnitHasConflict([split], 'private', 2, '2026-09-04', '2026-09-06'), true);
});
