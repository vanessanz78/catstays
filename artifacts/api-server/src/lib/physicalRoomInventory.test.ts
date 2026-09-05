import assert from 'node:assert/strict';
import test from 'node:test';
import {
  accommodationCanHoldCats,
  firstAvailablePhysicalRoom,
  planAccommodationStay,
  planPhysicalRoomStay,
  type PhysicalRoomBooking,
} from './physicalRoomInventory';

const bookings: PhysicalRoomBooking[] = [
  {
    id: 'booking-1',
    room_id: 'private',
    room_unit_number: 1,
    check_in: '2026-09-01',
    check_out: '2026-09-05',
    status: 'confirmed',
  },
  {
    id: 'booking-2',
    check_in: '2026-09-03',
    check_out: '2026-09-07',
    status: 'confirmed',
    booking_cat_rooms: [{ room_id: 'private', room_unit_number: 2 }],
  },
];

test('assigns the first free physical room for overlapping dates', () => {
  assert.equal(firstAvailablePhysicalRoom('private', 17, bookings, '2026-09-04', '2026-09-06'), 3);
});

test('reuses the first physical room when dates do not overlap', () => {
  assert.equal(firstAvailablePhysicalRoom('private', 17, bookings, '2026-09-08', '2026-09-10'), 1);
});

test('returns no room when every physical room is occupied', () => {
  assert.equal(firstAvailablePhysicalRoom('private', 2, bookings, '2026-09-04', '2026-09-05'), null);
});

test('finds a continuous stay with one room move when no unit is free for the whole stay', () => {
  const splitBookings: PhysicalRoomBooking[] = [
    { id: 'one', room_id: 'private', room_unit_number: 1, check_in: '2026-12-24', check_out: '2026-12-26', status: 'confirmed' },
    { id: 'two', room_id: 'private', room_unit_number: 2, check_in: '2026-12-27', check_out: '2026-12-30', status: 'confirmed' },
  ];

  assert.deepEqual(planPhysicalRoomStay('private', 2, splitBookings, '2026-12-24', '2026-12-30'), [
    { roomId: 'private', unitNumber: 2, startsOn: '2026-12-24', endsOn: '2026-12-26' },
    { roomId: 'private', unitNumber: 1, startsOn: '2026-12-27', endsOn: '2026-12-30' },
  ]);
});

test('honours existing split segments without blocking the primary room for the whole stay', () => {
  const splitBooking: PhysicalRoomBooking = {
    id: 'split',
    room_id: 'private',
    room_unit_number: 1,
    check_in: '2026-12-20',
    check_out: '2026-12-24',
    status: 'confirmed',
    booking_room_segments: [
      { room_id: 'private', room_unit_number: 1, starts_on: '2026-12-20', ends_on: '2026-12-21' },
      { room_id: 'private', room_unit_number: 2, starts_on: '2026-12-22', ends_on: '2026-12-24' },
    ],
  };

  assert.equal(firstAvailablePhysicalRoom('private', 2, [splitBooking], '2026-12-22', '2026-12-24'), 1);
});

test('waitlist entries never reserve inventory', () => {
  const waitlist: PhysicalRoomBooking = {
    id: 'waitlist',
    room_id: 'private',
    room_unit_number: 1,
    check_in: '2026-12-24',
    check_out: '2026-12-30',
    status: 'waitlist',
  };
  assert.equal(firstAvailablePhysicalRoom('private', 1, [waitlist], '2026-12-24', '2026-12-30'), 1);
});

test('returns no plan when continuous coverage would need more than three room segments', () => {
  const alternating: PhysicalRoomBooking[] = [
    { id: 'one-a', room_id: 'private', room_unit_number: 1, check_in: '2026-12-20', check_out: '2026-12-20', status: 'confirmed' },
    { id: 'two-a', room_id: 'private', room_unit_number: 2, check_in: '2026-12-21', check_out: '2026-12-21', status: 'confirmed' },
    { id: 'one-b', room_id: 'private', room_unit_number: 1, check_in: '2026-12-22', check_out: '2026-12-22', status: 'confirmed' },
    { id: 'two-b', room_id: 'private', room_unit_number: 2, check_in: '2026-12-23', check_out: '2026-12-23', status: 'confirmed' },
  ];
  assert.equal(planPhysicalRoomStay('private', 2, alternating, '2026-12-20', '2026-12-23'), null);
});

test('communal accommodation assigns one whole-stay physical room to every cat', () => {
  const communal = { id: 'communal', name: 'Communal Room', type: 'standard', capacity: 1, room_count: 25 };
  const occupied: PhysicalRoomBooking[] = [
    { id: 'one', room_id: 'communal', room_unit_number: 1, check_in: '2026-12-20', check_out: '2026-12-24', status: 'confirmed' },
    { id: 'two', check_in: '2026-12-20', check_out: '2026-12-24', status: 'confirmed', booking_cat_rooms: [{ room_id: 'communal', room_unit_number: 3 }] },
  ];

  assert.equal(accommodationCanHoldCats(communal, 5), true);
  assert.deepEqual(planAccommodationStay(communal, 5, occupied, '2026-12-20', '2026-12-24'), {
    unitNumbers: [2, 4, 5, 6, 7],
    segments: [],
    roomMoves: 0,
    usesOneRoomPerCat: true,
  });
});

test('communal accommodation waits when there are not enough whole-stay rooms', () => {
  const communal = { id: 'communal', name: 'Communal Room', type: 'standard', capacity: 1, room_count: 3 };
  const occupied: PhysicalRoomBooking[] = [
    { id: 'one', room_id: 'communal', room_unit_number: 1, check_in: '2026-12-20', check_out: '2026-12-24', status: 'confirmed' },
  ];

  assert.equal(planAccommodationStay(communal, 3, occupied, '2026-12-20', '2026-12-24'), null);
});

test('communal waitlist entries do not reserve one-room-per-cat inventory', () => {
  const communal = { id: 'communal', name: 'Communal Room', type: 'standard', capacity: 1, room_count: 2 };
  const waitlist: PhysicalRoomBooking[] = [
    { id: 'waiting', room_id: 'communal', room_unit_number: 1, check_in: '2026-12-20', check_out: '2026-12-24', status: 'waitlist' },
  ];

  assert.deepEqual(planAccommodationStay(communal, 2, waitlist, '2026-12-20', '2026-12-24')?.unitNumbers, [1, 2]);
});
