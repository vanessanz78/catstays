import { addDays, differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';
import type { BookingWithDetails } from '@/hooks/useBookings';

export type TimelineSegment = {
  booking: BookingWithDetails;
  startIndex: number;
  endIndex: number;
  lane: number;
};

export function addDateKey(dateKey: string, days: number) {
  const date = parseISO(dateKey);
  if (!isValid(date)) return dateKey;
  return format(addDays(date, days), 'yyyy-MM-dd');
}

export function buildTimelineDays(startDate: string, count: number) {
  const safeCount = Number.isFinite(count) ? Math.max(1, Math.floor(count)) : 1;
  return Array.from({ length: safeCount }, (_, index) => addDateKey(startDate, index));
}

export function shiftBookingDates(checkIn: string, checkOut: string, nextCheckIn: string) {
  const currentStart = parseISO(checkIn);
  const currentEnd = parseISO(checkOut);
  const nextStart = parseISO(nextCheckIn);
  if (!isValid(currentStart) || !isValid(currentEnd) || !isValid(nextStart)) {
    return { checkIn, checkOut };
  }

  const duration = Math.max(0, differenceInCalendarDays(currentEnd, currentStart));
  return {
    checkIn: nextCheckIn,
    checkOut: format(addDays(nextStart, duration), 'yyyy-MM-dd'),
  };
}

export function bookingRoomIds(booking: BookingWithDetails) {
  return [...new Set([
    booking.room?.id,
    ...(booking.booking_cat_rooms || []).map((assignment) => assignment.room?.id),
  ].filter((roomId): roomId is string => Boolean(roomId)))];
}

export function bookingUsesRoom(booking: BookingWithDetails, roomId: string) {
  return bookingRoomIds(booking).includes(roomId);
}

export function bookingOverlapsRange(
  booking: Pick<BookingWithDetails, 'check_in' | 'check_out'>,
  checkIn: string,
  checkOut: string,
) {
  return booking.check_in <= checkOut && booking.check_out >= checkIn;
}

export function catNamesForRoom(booking: BookingWithDetails, roomId?: string) {
  if (roomId) {
    const assigned = (booking.booking_cat_rooms || [])
      .filter((assignment) => assignment.room?.id === roomId)
      .map((assignment) => assignment.cat?.name)
      .filter((name): name is string => Boolean(name));
    if (assigned.length > 0) return assigned.join(', ');
  }

  const linked = (booking.booking_cats || [])
    .map((assignment) => assignment.cat?.name)
    .filter((name): name is string => Boolean(name));
  if (linked.length > 0) return linked.join(', ');
  return booking.cat_names || 'Cat guest';
}

export function buildRoomSegments(
  bookings: BookingWithDetails[],
  roomId: string | null,
  firstDate: string,
  lastDate: string,
): TimelineSegment[] {
  const segments = bookings
    .filter((booking) => {
      if (booking.status === 'cancelled' || !bookingOverlapsRange(booking, firstDate, lastDate)) return false;
      const roomIds = bookingRoomIds(booking);
      return roomId ? roomIds.includes(roomId) : roomIds.length === 0;
    })
    .map((booking) => ({
      booking,
      startIndex: Math.max(0, differenceInCalendarDays(parseISO(booking.check_in), parseISO(firstDate))),
      endIndex: Math.min(
        differenceInCalendarDays(parseISO(lastDate), parseISO(firstDate)),
        differenceInCalendarDays(parseISO(booking.check_out), parseISO(firstDate)),
      ),
      lane: 0,
    }))
    .sort((a, b) => a.startIndex - b.startIndex || a.endIndex - b.endIndex);

  const laneEnds: number[] = [];
  return segments.map((segment) => {
    let lane = laneEnds.findIndex((endIndex) => endIndex < segment.startIndex);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = segment.endIndex;
    return { ...segment, lane };
  });
}

export function roomHasBookingConflict(
  bookings: BookingWithDetails[],
  roomId: string,
  checkIn: string,
  checkOut: string,
  ignoredBookingId?: string,
) {
  return bookings.some((booking) => (
    booking.id !== ignoredBookingId
    && booking.status !== 'cancelled'
    && bookingUsesRoom(booking, roomId)
    && bookingOverlapsRange(booking, checkIn, checkOut)
  ));
}
