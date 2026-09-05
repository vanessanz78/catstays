export type PhysicalRoomBooking = {
  id: string;
  room_id?: string | null;
  room_unit_number?: number | null;
  check_in: string;
  check_out: string;
  status: string;
  booking_cat_rooms?: Array<{
    room_id?: string | null;
    room_unit_number?: number | null;
  }> | null;
  booking_room_segments?: Array<{
    room_id?: string | null;
    room_unit_number?: number | null;
    starts_on: string;
    ends_on: string;
  }> | null;
};

export type PhysicalRoomPlanSegment = {
  roomId: string;
  unitNumber: number;
  startsOn: string;
  endsOn: string;
};

export type AccommodationRoom = {
  id: string;
  name?: string | null;
  type?: string | null;
  capacity: number;
  room_count: number;
};

export type AccommodationStayPlan = {
  unitNumbers: number[];
  segments: PhysicalRoomPlanSegment[];
  roomMoves: number;
  usesOneRoomPerCat: boolean;
};

function overlaps(booking: PhysicalRoomBooking, checkIn: string, checkOut: string) {
  return booking.check_in <= checkOut && booking.check_out >= checkIn;
}

function usesRoomUnit(booking: PhysicalRoomBooking, roomId: string, unitNumber: number) {
  if (booking.room_id === roomId && booking.room_unit_number === unitNumber) return true;
  return (booking.booking_cat_rooms || []).some((assignment) => (
    assignment.room_id === roomId && assignment.room_unit_number === unitNumber
  ));
}

function dateKeysBetween(checkIn: string, checkOut: string) {
  const first = new Date(`${checkIn}T12:00:00Z`);
  const last = new Date(`${checkOut}T12:00:00Z`);
  if (Number.isNaN(first.getTime()) || Number.isNaN(last.getTime()) || last < first) return [];
  const days: string[] = [];
  for (let cursor = first; cursor <= last; cursor = new Date(cursor.getTime() + 86_400_000)) {
    days.push(cursor.toISOString().slice(0, 10));
  }
  return days;
}

function blocksInventory(booking: PhysicalRoomBooking) {
  return booking.status !== 'cancelled' && booking.status !== 'waitlist';
}

function roomUnitIsBlockedOn(
  booking: PhysicalRoomBooking,
  roomId: string,
  unitNumber: number,
  day: string,
) {
  if (!blocksInventory(booking) || !overlaps(booking, day, day)) return false;
  const segments = booking.booking_room_segments || [];
  if (segments.length > 0) {
    return segments.some((segment) => (
      segment.room_id === roomId
      && segment.room_unit_number === unitNumber
      && segment.starts_on <= day
      && segment.ends_on >= day
    ));
  }
  return usesRoomUnit(booking, roomId, unitNumber);
}

export function roomUsesOnePhysicalUnitPerCat(room: Pick<AccommodationRoom, 'name' | 'type'>) {
  return `${room.name || ''} ${room.type || ''}`.toLowerCase().includes('communal');
}

export function accommodationCanHoldCats(room: AccommodationRoom, numberOfCats: number) {
  const cats = Math.max(1, Math.floor(Number(numberOfCats) || 1));
  return roomUsesOnePhysicalUnitPerCat(room)
    ? cats <= Math.max(1, Math.floor(Number(room.room_count) || 1))
    : cats <= Math.max(1, Math.floor(Number(room.capacity) || 1));
}

export function firstAvailablePhysicalRooms(
  roomId: string,
  roomCount: number,
  bookings: PhysicalRoomBooking[],
  checkIn: string,
  checkOut: string,
  requiredRooms: number,
) {
  const days = dateKeysBetween(checkIn, checkOut);
  const count = Math.max(1, Math.floor(Number(roomCount) || 1));
  const required = Math.max(1, Math.floor(Number(requiredRooms) || 1));
  if (days.length === 0 || required > count) return null;

  const available: number[] = [];
  for (let unitNumber = 1; unitNumber <= count; unitNumber += 1) {
    const freeForWholeStay = days.every((day) => (
      !bookings.some((booking) => roomUnitIsBlockedOn(booking, roomId, unitNumber, day))
    ));
    if (freeForWholeStay) available.push(unitNumber);
    if (available.length === required) return available;
  }
  return null;
}

/**
 * Finds a continuous stay using no more than three physical rooms of one
 * customer-facing accommodation type. The dynamic plan minimises room moves
 * and keeps physical room numbers server-side.
 */
export function planPhysicalRoomStay(
  roomId: string,
  roomCount: number,
  bookings: PhysicalRoomBooking[],
  checkIn: string,
  checkOut: string,
  maximumSegments = 3,
): PhysicalRoomPlanSegment[] | null {
  const days = dateKeysBetween(checkIn, checkOut);
  const count = Math.max(1, Math.floor(Number(roomCount) || 1));
  if (days.length === 0 || maximumSegments < 1) return null;

  type State = { segments: number; previousUnit: number | null };
  const history: Array<Map<number, State>> = [];

  for (let dayIndex = 0; dayIndex < days.length; dayIndex += 1) {
    const day = days[dayIndex];
    const previous = history[dayIndex - 1];
    const current = new Map<number, State>();
    for (let unitNumber = 1; unitNumber <= count; unitNumber += 1) {
      if (bookings.some((booking) => roomUnitIsBlockedOn(booking, roomId, unitNumber, day))) continue;
      if (!previous) {
        current.set(unitNumber, { segments: 1, previousUnit: null });
        continue;
      }
      let best: State | null = null;
      for (const [previousUnit, previousState] of previous) {
        const segments = previousState.segments + (previousUnit === unitNumber ? 0 : 1);
        if (segments > maximumSegments) continue;
        if (!best || segments < best.segments || (segments === best.segments && previousUnit === unitNumber)) {
          best = { segments, previousUnit };
        }
      }
      if (best) current.set(unitNumber, best);
    }
    if (current.size === 0) return null;
    history.push(current);
  }

  const finalState = [...history.at(-1)!].sort((a, b) => a[1].segments - b[1].segments || a[0] - b[0])[0];
  if (!finalState) return null;
  const units = Array<number>(days.length);
  units[days.length - 1] = finalState[0];
  for (let dayIndex = days.length - 1; dayIndex > 0; dayIndex -= 1) {
    const state = history[dayIndex].get(units[dayIndex]);
    if (!state?.previousUnit) return null;
    units[dayIndex - 1] = state.previousUnit;
  }

  const segments: PhysicalRoomPlanSegment[] = [];
  for (let dayIndex = 0; dayIndex < days.length; dayIndex += 1) {
    const current = segments.at(-1);
    if (current?.unitNumber === units[dayIndex]) {
      current.endsOn = days[dayIndex];
    } else {
      segments.push({
        roomId,
        unitNumber: units[dayIndex],
        startsOn: days[dayIndex],
        endsOn: days[dayIndex],
      });
    }
  }
  return segments;
}

export function firstAvailablePhysicalRoom(
  roomId: string,
  roomCount: number,
  bookings: PhysicalRoomBooking[],
  checkIn: string,
  checkOut: string,
) {
  const plan = planPhysicalRoomStay(roomId, roomCount, bookings, checkIn, checkOut, 1);
  return plan?.[0]?.unitNumber || null;
}

export function planAccommodationStay(
  room: AccommodationRoom,
  numberOfCats: number,
  bookings: PhysicalRoomBooking[],
  checkIn: string,
  checkOut: string,
): AccommodationStayPlan | null {
  const cats = Math.max(1, Math.floor(Number(numberOfCats) || 1));
  if (!accommodationCanHoldCats(room, cats)) return null;

  if (roomUsesOnePhysicalUnitPerCat(room)) {
    const unitNumbers = firstAvailablePhysicalRooms(
      room.id,
      room.room_count,
      bookings,
      checkIn,
      checkOut,
      cats,
    );
    return unitNumbers ? {
      unitNumbers,
      segments: [],
      roomMoves: 0,
      usesOneRoomPerCat: true,
    } : null;
  }

  const segments = planPhysicalRoomStay(
    room.id,
    room.room_count,
    bookings,
    checkIn,
    checkOut,
  );
  return segments ? {
    unitNumbers: [segments[0].unitNumber],
    segments,
    roomMoves: segments.length - 1,
    usesOneRoomPerCat: false,
  } : null;
}
