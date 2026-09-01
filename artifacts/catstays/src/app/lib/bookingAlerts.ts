export type BookingAlertNotification = {
  type: string;
  read_at: string | null;
  url?: string | null;
  metadata?: Record<string, unknown> | null;
};

export const CATSTAYS_BOOKINGS_CHANGED_EVENT = 'catstays:bookings-changed';

export function announceCatStaysBookingsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CATSTAYS_BOOKINGS_CHANGED_EVENT));
  }
}

export function notificationBookingId(notification: BookingAlertNotification) {
  const metadataId = notification.metadata?.bookingId;
  if (typeof metadataId === 'string' && metadataId.trim()) return metadataId;

  const match = notification.url?.match(/[?&]booking=([^&#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function visibleOtherNotifications<T extends BookingAlertNotification>(
  notifications: T[],
  pendingBookingIds: string[],
) {
  const pendingIds = new Set(pendingBookingIds);
  return notifications.filter((notification) => {
    if (notification.type !== 'booking_request') return true;
    const bookingId = notificationBookingId(notification);
    return !bookingId || !pendingIds.has(bookingId);
  });
}

export function bookingAlertCount(
  pendingBookingIds: string[],
  notifications: BookingAlertNotification[],
) {
  const otherUnread = visibleOtherNotifications(notifications, pendingBookingIds)
    .filter((notification) => !notification.read_at).length;
  return pendingBookingIds.length + otherUnread;
}

export function pendingBookingSummary(count: number) {
  if (count === 0) return 'No pending bookings';
  return `You have ${count} pending ${count === 1 ? 'booking' : 'bookings'}`;
}
