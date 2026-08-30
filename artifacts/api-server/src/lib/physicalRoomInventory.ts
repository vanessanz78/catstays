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

export function firstAvailablePhysicalRoom(
  roomId: string,
  roomCount: number,
  bookings: PhysicalRoomBooking[],
  checkIn: string,
  checkOut: string,
) {
  const count = Math.max(1, Math.floor(Number(roomCount) || 1));
  for (let unitNumber = 1; unitNumber <= count; unitNumber += 1) {
    const unavailable = bookings.some((booking) => (
      booking.status !== 'cancelled'
      && overlaps(booking, checkIn, checkOut)
      && usesRoomUnit(booking, roomId, unitNumber)
    ));
    if (!unavailable) return unitNumber;
  }
  return null;
}
