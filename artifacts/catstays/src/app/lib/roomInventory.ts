export type RoomInventoryRecord = {
  id: string;
  name: string;
  type?: string | null;
  capacity: number;
  room_count?: number | null;
  is_active?: boolean;
};

export type PhysicalRoom<T extends RoomInventoryRecord = RoomInventoryRecord> = {
  key: string;
  room: T;
  roomId: string;
  unitNumber: number;
  name: string;
};

type BookingRoomAssignment = {
  room_unit_number?: number | null;
  room?: { id?: string | null } | null;
};

type BookingRoomSegment = BookingRoomAssignment & {
  starts_on: string;
  ends_on: string;
};

export type InventoryBooking = {
  id: string;
  check_in: string;
  check_out: string;
  status: string;
  room_unit_number?: number | null;
  room?: { id?: string | null } | null;
  booking_cat_rooms?: BookingRoomAssignment[] | null;
  booking_room_segments?: BookingRoomSegment[] | null;
};

export function normalizeRoomCount(value: number | null | undefined) {
  return Number.isFinite(value) ? Math.max(1, Math.floor(Number(value))) : 1;
}

export function roomUnitKey(roomId: string, unitNumber: number) {
  return `${roomId}:${unitNumber}`;
}

export function physicalRoomPrefix(room: Pick<RoomInventoryRecord, 'name' | 'type'>) {
  const identity = `${room.name} ${room.type || ''}`.toLowerCase();
  if (identity.includes('private')) return 'Private Room';
  if (identity.includes('indoor')) return 'Indoor Room';
  if (identity.includes('communal')) return 'Communal Room';
  return room.name.replace(/\s+\d+$/, '').trim() || 'Room';
}

export function physicalRoomName(room: Pick<RoomInventoryRecord, 'name' | 'type'>, unitNumber: number) {
  return `${physicalRoomPrefix(room)} ${unitNumber}`;
}

function roomOrder(room: Pick<RoomInventoryRecord, 'name' | 'type'>) {
  const identity = `${room.name} ${room.type || ''}`.toLowerCase();
  if (identity.includes('private')) return 0;
  if (identity.includes('indoor')) return 1;
  if (identity.includes('communal')) return 2;
  return 3;
}

export function expandPhysicalRooms<T extends RoomInventoryRecord>(rooms: T[]): PhysicalRoom<T>[] {
  return [...rooms]
    .sort((a, b) => (
      roomOrder(a) - roomOrder(b)
      || Number(Boolean(b.is_active)) - Number(Boolean(a.is_active))
      || a.name.localeCompare(b.name)
    ))
    .flatMap((room) => Array.from(
      { length: normalizeRoomCount(room.room_count) },
      (_, index) => {
        const unitNumber = index + 1;
        return {
          key: roomUnitKey(room.id, unitNumber),
          room,
          roomId: room.id,
          unitNumber,
          name: physicalRoomName(room, unitNumber),
        };
      },
    ));
}

export function bookingRoomUnits(booking: InventoryBooking) {
  const source = (booking.booking_room_segments || []).length > 0
    ? booking.booking_room_segments || []
    : booking.booking_cat_rooms || [];
  const assigned = source
    .filter((assignment) => assignment.room?.id && assignment.room_unit_number)
    .map((assignment) => ({
      roomId: String(assignment.room?.id),
      unitNumber: Number(assignment.room_unit_number),
    }));

  if (assigned.length === 0 && booking.room?.id && booking.room_unit_number) {
    assigned.push({
      roomId: String(booking.room.id),
      unitNumber: Number(booking.room_unit_number),
    });
  }

  return [...new Map(assigned.map((assignment) => [
    roomUnitKey(assignment.roomId, assignment.unitNumber),
    assignment,
  ])).values()];
}

export function bookingRoomUnitKeys(booking: InventoryBooking) {
  return bookingRoomUnits(booking).map((assignment) => roomUnitKey(assignment.roomId, assignment.unitNumber));
}

export function bookingRoomUnitKeysForDate(booking: InventoryBooking, dateKey: string) {
  const splitSegments = booking.booking_room_segments || [];
  if (splitSegments.length === 0) return bookingRoomUnitKeys(booking);
  return [...new Set(splitSegments
    .filter((segment) => segment.starts_on <= dateKey && segment.ends_on >= dateKey && segment.room?.id && segment.room_unit_number)
    .map((segment) => roomUnitKey(String(segment.room?.id), Number(segment.room_unit_number))))];
}

export function bookingNeedsRoomUnit(booking: InventoryBooking) {
  if ((booking.booking_room_segments || []).length > 0) {
    return (booking.booking_room_segments || []).some((segment) => !segment.room?.id || !segment.room_unit_number);
  }
  if ((booking.booking_cat_rooms || []).length > 0) {
    return (booking.booking_cat_rooms || []).some((assignment) => !assignment.room?.id || !assignment.room_unit_number);
  }
  return !booking.room?.id || !booking.room_unit_number;
}

export function bookingUsesRoomUnit(booking: InventoryBooking, roomId: string, unitNumber: number) {
  return bookingRoomUnitKeys(booking).includes(roomUnitKey(roomId, unitNumber));
}

export function bookingOverlapsDates(
  booking: Pick<InventoryBooking, 'check_in' | 'check_out'>,
  checkIn: string,
  checkOut: string,
) {
  return booking.check_in <= checkOut && booking.check_out >= checkIn;
}

export function roomUnitHasConflict(
  bookings: InventoryBooking[],
  roomId: string,
  unitNumber: number,
  checkIn: string,
  checkOut: string,
  ignoredBookingId?: string,
) {
  return bookings.some((booking) => (
    booking.id !== ignoredBookingId
    && booking.status !== 'cancelled'
    && booking.status !== 'waitlist'
    && ((booking.booking_room_segments || []).length > 0
      ? (booking.booking_room_segments || []).some((segment) => (
          segment.room?.id === roomId
          && segment.room_unit_number === unitNumber
          && segment.starts_on <= checkOut
          && segment.ends_on >= checkIn
        ))
      : bookingUsesRoomUnit(booking, roomId, unitNumber) && bookingOverlapsDates(booking, checkIn, checkOut))
  ));
}

export function firstAvailableRoomUnit<T extends RoomInventoryRecord>(
  room: T,
  bookings: InventoryBooking[],
  checkIn: string,
  checkOut: string,
) {
  return expandPhysicalRooms([room]).find((physicalRoom) => !roomUnitHasConflict(
    bookings,
    physicalRoom.roomId,
    physicalRoom.unitNumber,
    checkIn,
    checkOut,
  )) || null;
}
