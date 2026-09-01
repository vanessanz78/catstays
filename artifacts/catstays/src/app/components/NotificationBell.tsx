import { useEffect, useRef, useState } from 'react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useNavigate } from 'react-router';
import { Bell, BellRing, CalendarDays, Cat, Check, ChevronRight, X } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  bookingAlertCount,
  CATSTAYS_BOOKINGS_CHANGED_EVENT,
  notificationBookingId,
  pendingBookingSummary,
  visibleOtherNotifications,
} from '@/app/lib/bookingAlerts';
import { Button } from './ui/button';

type CatStaysNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  url: string | null;
  metadata: Record<string, unknown> | null;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
};

type PendingBooking = {
  id: string;
  check_in: string;
  check_out: string;
  created_at: string;
  guest_name: string | null;
  cat_names: string | null;
  customer: { name: string } | Array<{ name: string }> | null;
  booking_cats: Array<{ cat: { name: string } | Array<{ name: string }> | null }> | null;
};

function bookingCustomerName(booking: PendingBooking) {
  const customer = Array.isArray(booking.customer) ? booking.customer[0] : booking.customer;
  return customer?.name || booking.guest_name || 'Customer';
}

function bookingCatNames(booking: PendingBooking) {
  const linkedNames = (booking.booking_cats || []).flatMap((entry) => {
    const cats = Array.isArray(entry.cat) ? entry.cat : entry.cat ? [entry.cat] : [];
    return cats.map((cat) => cat.name).filter(Boolean);
  });
  return linkedNames.join(', ') || booking.cat_names || 'Cat stay';
}

export function NotificationBell() {
  const navigate = useNavigate();
  const { user, cattery } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CatStaysNotification[]>([]);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const touchStarts = useRef<Record<string, number>>({});

  const refresh = async () => {
    if (!user || !cattery?.id) {
      setNotifications([]);
      setPendingBookings([]);
      return;
    }

    const [notificationResult, bookingResult] = await Promise.all([
      supabase
        .from('catstays_notifications')
        .select('id,type,title,body,url,metadata,read_at,dismissed_at,created_at')
        .eq('cattery_id', cattery.id)
        .is('dismissed_at', null)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('bookings')
        .select('id,check_in,check_out,created_at,guest_name,cat_names,customer:customers(name),booking_cats(cat:cats(name))')
        .eq('cattery_id', cattery.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
    ]);

    if (!notificationResult.error) {
      setNotifications((notificationResult.data || []) as CatStaysNotification[]);
    }
    if (!bookingResult.error) {
      setPendingBookings((bookingResult.data || []) as unknown as PendingBooking[]);
    }
  };

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    const handleBookingChange = () => void refresh();
    window.addEventListener(CATSTAYS_BOOKINGS_CHANGED_EVENT, handleBookingChange);
    const channel = cattery?.id
      ? supabase
        .channel(`pending-booking-alerts-${cattery.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings', filter: `cattery_id=eq.${cattery.id}` },
          () => void refresh(),
        )
        .subscribe()
      : null;

    return () => {
      window.clearInterval(timer);
      window.removeEventListener(CATSTAYS_BOOKINGS_CHANGED_EVENT, handleBookingChange);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [user?.id, cattery?.id]);

  const pendingBookingIds = pendingBookings.map((booking) => booking.id);
  const otherNotifications = visibleOtherNotifications(notifications, pendingBookingIds);
  const unreadCount = otherNotifications.filter((notification) => !notification.read_at).length;
  const alertCount = bookingAlertCount(pendingBookingIds, notifications);

  const markAsRead = async (notification: CatStaysNotification) => {
    if (!notification.read_at) {
      const readAt = new Date().toISOString();
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read_at: readAt } : item));
      await supabase.from('catstays_notifications').update({ read_at: readAt }).eq('id', notification.id);
    }

    const bookingId = notificationBookingId(notification);
    const target = notification.type === 'booking_request' && bookingId
      ? `/staff-dashboard/bookings?booking=${encodeURIComponent(bookingId)}`
      : notification.url;
    setIsOpen(false);
    if (target) navigate(target);
  };

  const openPendingBooking = async (booking: PendingBooking) => {
    const matchingNotificationIds = notifications
      .filter((notification) => notification.type === 'booking_request' && notificationBookingId(notification) === booking.id && !notification.read_at)
      .map((notification) => notification.id);
    if (matchingNotificationIds.length > 0) {
      const readAt = new Date().toISOString();
      setNotifications((items) => items.map((item) => matchingNotificationIds.includes(item.id) ? { ...item, read_at: readAt } : item));
      await supabase.from('catstays_notifications').update({ read_at: readAt }).in('id', matchingNotificationIds);
    }
    setIsOpen(false);
    navigate(`/staff-dashboard/bookings?booking=${encodeURIComponent(booking.id)}`);
  };

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;
    const readAt = new Date().toISOString();
    setNotifications((items) => items.map((item) => ({ ...item, read_at: item.read_at || readAt })));
    let query = supabase.from('catstays_notifications').update({ read_at: readAt }).eq('user_id', user.id).is('read_at', null);
    if (cattery?.id) query = query.eq('cattery_id', cattery.id);
    await query;
  };

  const dismissNotification = async (notification: CatStaysNotification) => {
    const dismissedAt = new Date().toISOString();
    setNotifications((items) => items.filter((item) => item.id !== notification.id));
    const { error } = await supabase
      .from('catstays_notifications')
      .update({ dismissed_at: dismissedAt })
      .eq('id', notification.id);
    if (error) void refresh();
  };

  const handleTouchStart = (notificationId: string, clientX: number) => {
    touchStarts.current[notificationId] = clientX;
  };

  const handleTouchEnd = (notification: CatStaysNotification, clientX: number) => {
    const start = touchStarts.current[notification.id];
    delete touchStarts.current[notification.id];
    if (typeof start === 'number' && Math.abs(clientX - start) >= 56) {
      void dismissNotification(notification);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => {
          if (!isOpen) void refresh();
          setIsOpen((value) => !value);
        }}
        variant="ghost"
        size="icon"
        className="relative rounded-full bg-white text-[#C46A3A] shadow-sm hover:bg-[#F8F7F5]"
        aria-label={`Booking alerts${pendingBookings.length ? `, ${pendingBookings.length} pending` : ''}${alertCount ? `, ${alertCount} total` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {alertCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#0A1128] px-1 text-xs font-semibold text-white">
            {alertCount > 99 ? '99+' : alertCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <button className="fixed inset-0 z-40 cursor-default bg-black/20" onClick={() => setIsOpen(false)} aria-label="Close booking alerts" />
          <section
            className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4.75rem)] z-50 max-h-[calc(100dvh-env(safe-area-inset-top)-5.75rem)] overflow-hidden rounded-2xl bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-12 sm:max-h-[78vh] sm:w-[400px]"
            role="dialog"
            aria-modal="true"
            aria-label="Booking alerts"
          >
            <header className="flex items-center justify-between border-b border-[#E8DED4] px-4 py-3">
              <div className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-[#C46A3A]" />
                <div>
                  <h2 className="font-semibold text-[#0A1128]">Booking alerts</h2>
                  <p className="text-xs text-[#4E5871]">{pendingBookingSummary(pendingBookings.length)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllRead} className="hidden text-xs text-[#4E5871] sm:inline-flex">
                    <Check className="mr-1 h-4 w-4" /> Mark read
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close booking alerts">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </header>

            <div className="max-h-[calc(100dvh-env(safe-area-inset-top)-9.5rem)] overflow-y-auto overscroll-contain p-3 sm:max-h-[calc(78vh-68px)]">
              {pendingBookings.length > 0 && (
                <section aria-labelledby="pending-bookings-heading">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <h3 id="pending-bookings-heading" className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Needs approval</h3>
                    <span className="rounded-full bg-[#C46A3A]/10 px-2 py-1 text-xs font-semibold text-[#A85A30]">{pendingBookings.length}</span>
                  </div>
                  <div className="space-y-2">
                    {pendingBookings.map((booking) => (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => void openPendingBooking(booking)}
                        className="flex w-full items-center gap-3 rounded-xl border border-[#C46A3A]/25 bg-[#FFF8F2] p-3 text-left transition hover:border-[#C46A3A]/50 hover:bg-[#F8F1EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C46A3A]"
                      >
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#C46A3A] text-white">
                          <CalendarDays className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#0A1128]">{bookingCustomerName(booking)}</p>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#4E5871]"><Cat className="h-3.5 w-3.5 shrink-0" />{bookingCatNames(booking)}</p>
                          <p className="mt-1 text-xs font-medium text-[#A85A30]">{format(parseISO(booking.check_in), 'd MMM yyyy')} – {format(parseISO(booking.check_out), 'd MMM yyyy')}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#C46A3A]">
                          Review <ChevronRight className="h-4 w-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {otherNotifications.length > 0 && (
                <section className={pendingBookings.length > 0 ? 'mt-5 border-t border-[#E8DED4] pt-4' : ''} aria-labelledby="recent-activity-heading">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <h3 id="recent-activity-heading" className="text-xs font-semibold uppercase tracking-wide text-[#768098]">Recent activity</h3>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 text-xs text-[#4E5871] sm:hidden">
                        <Check className="mr-1 h-3.5 w-3.5" /> Mark read
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {otherNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        onTouchStart={(event) => handleTouchStart(notification.id, event.touches[0]?.clientX ?? 0)}
                        onTouchEnd={(event) => handleTouchEnd(notification, event.changedTouches[0]?.clientX ?? 0)}
                        className={`flex w-full items-start gap-2 rounded-xl border p-2 transition-all ${notification.read_at ? 'border-[#E8DED4] bg-white' : 'border-[#C46A3A]/30 bg-[#F8F1EC]'}`}
                      >
                        <button type="button" onClick={() => void markAsRead(notification)} className="min-w-0 flex-1 rounded-lg p-2 text-left">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#0A1128]">{notification.title}</p>
                              <p className="mt-1 text-sm leading-5 text-[#4E5871]">{notification.body}</p>
                              <p className="mt-2 text-xs text-[#768098]">{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</p>
                            </div>
                            {!notification.read_at && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#C46A3A]" />}
                          </div>
                        </button>
                        <button type="button" onClick={() => void dismissNotification(notification)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#768098] hover:bg-[#E8DED4] hover:text-[#0A1128]" aria-label={`Dismiss ${notification.title}`}>
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {pendingBookings.length === 0 && otherNotifications.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <Bell className="mx-auto h-9 w-9 text-[#0A1128]/20" />
                  <p className="mt-3 text-sm font-medium text-[#0A1128]">You’re all caught up</p>
                  <p className="mt-1 text-xs text-[#4E5871]">New booking requests will appear here for quick approval.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
