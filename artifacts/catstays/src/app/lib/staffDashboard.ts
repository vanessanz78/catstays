import type { BookingWithDetails } from '../../hooks/useBookings';
import type { RoomRecord } from '../../hooks/useRooms';
import { bookingRoomUnitKeysForDate, expandPhysicalRooms } from './roomInventory';

function shiftDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dailyBookingAction(status: string, kind: 'arrival' | 'departure') {
  if (status === 'pending' || status === 'waitlist') return { label: 'Review', nextStatus: null };
  if (kind === 'arrival') {
    if (status === 'checked_in') return { label: 'In', nextStatus: null };
    if (status === 'checked_out') return { label: 'Out', nextStatus: null };
    return status === 'confirmed'
      ? { label: 'Check in', nextStatus: 'checked_in' }
      : { label: 'Open', nextStatus: null };
  }
  if (status === 'checked_out') return { label: 'Out', nextStatus: null };
  return status === 'checked_in'
    ? { label: 'Check out', nextStatus: 'checked_out' }
    : { label: 'Open', nextStatus: null };
}

export function buildDashboardData(bookings: BookingWithDetails[], rooms: RoomRecord[], today: string) {
  const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled' && booking.status !== 'waitlist');
  const arrivalsToday = activeBookings.filter((booking) => booking.check_in === today);
  const departuresToday = activeBookings.filter((booking) => booking.check_out === today);
  const occupiedNow = activeBookings.filter((booking) => {
    if (booking.status === 'checked_out') return false;
    return booking.check_in <= today && booking.check_out >= today;
  });
  const pending = bookings.filter((booking) => booking.status === 'pending');
  const waitingList = bookings.filter((booking) => booking.status === 'waitlist');
  const activeRooms = rooms.filter((room) => room.is_active);
  const physicalRooms = expandPhysicalRooms(activeRooms);
  const occupiedRoomKeys = [...new Set(occupiedNow.flatMap((booking) => bookingRoomUnitKeysForDate(booking, today)))]
    .filter((key) => physicalRooms.some((room) => room.key === key));
  const occupancyWeek = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDateKey(today, index);
    const stays = activeBookings.filter((booking) => booking.check_in <= date && booking.check_out >= date);
    const dayEndStays = activeBookings.filter((booking) => booking.status !== 'checked_out' && booking.check_in <= date && booking.check_out > date);
    const count = [...new Set(stays.flatMap((booking) => bookingRoomUnitKeysForDate(booking, date)))]
      .filter((key) => physicalRooms.some((room) => room.key === key)).length;
    const dayEnd = [...new Set(dayEndStays.flatMap((booking) => bookingRoomUnitKeysForDate(booking, date)))]
      .filter((key) => physicalRooms.some((room) => room.key === key)).length;
    return {
      date,
      count,
      arrivals: activeBookings.filter((booking) => booking.check_in === date).length,
      departures: activeBookings.filter((booking) => booking.check_out === date).length,
      dayEnd,
      percentage: physicalRooms.length > 0 ? Math.round((count / physicalRooms.length) * 100) : 0,
    };
  });

  const latestBookings = [...activeBookings]
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(0, 5);

  return {
    activeRooms,
    arrivalsToday,
    departuresToday,
    occupiedNow,
    occupiedRoomKeys,
    pending,
    waitingList,
    latestBookings,
    occupancyWeek,
    availableRooms: Math.max(physicalRooms.length - occupiedRoomKeys.length, 0),
    occupancyLabel: physicalRooms.length > 0 ? `${occupiedRoomKeys.length}/${physicalRooms.length}` : '0/0',
  };
}
