import { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, BellRing, Check, X } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';

type CatStaysNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  url: string | null;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
};

export function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CatStaysNotification[]>([]);
  const touchStarts = useRef<Record<string, number>>({});

  const refresh = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const { data, error } = await supabase
      .from('catstays_notifications')
      .select('id,type,title,body,url,read_at,dismissed_at,created_at')
      .is('dismissed_at', null)
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error) setNotifications((data || []) as CatStaysNotification[]);
  };

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    return () => window.clearInterval(timer);
  }, [user?.id]);

  const unreadCount = notifications.filter((notification) => !notification.read_at).length;

  const markAsRead = async (notification: CatStaysNotification) => {
    if (!notification.read_at) {
      const readAt = new Date().toISOString();
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read_at: readAt } : item));
      await supabase.from('catstays_notifications').update({ read_at: readAt }).eq('id', notification.id);
    }
    if (notification.url) window.location.assign(notification.url);
  };

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;
    const readAt = new Date().toISOString();
    setNotifications((items) => items.map((item) => ({ ...item, read_at: item.read_at || readAt })));
    await supabase.from('catstays_notifications').update({ read_at: readAt }).eq('user_id', user.id).is('read_at', null);
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
        onClick={() => setIsOpen((value) => !value)}
        variant="ghost"
        size="icon"
        className="relative rounded-full bg-white text-[#C46A3A] shadow-sm hover:bg-[#F8F7F5]"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#0A1128] px-1 text-xs font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <button className="fixed inset-0 z-40 cursor-default bg-black/20" onClick={() => setIsOpen(false)} aria-label="Close notifications" />
          <section
            className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4.75rem)] z-50 max-h-[calc(100dvh-env(safe-area-inset-top)-5.75rem)] overflow-hidden rounded-2xl bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-12 sm:max-h-[78vh] sm:w-[380px]"
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
          >
            <header className="flex items-center justify-between border-b border-[#E8DED4] px-4 py-3">
              <div className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-[#C46A3A]" />
                <h2 className="font-semibold text-[#0A1128]">Notifications</h2>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-[#4E5871]">
                    <Check className="mr-1 h-4 w-4" /> Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close notifications">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </header>

            <div className="max-h-[calc(100dvh-env(safe-area-inset-top)-9.5rem)] overflow-y-auto overscroll-contain p-3 sm:max-h-[calc(78vh-60px)]">
              {notifications.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Bell className="mx-auto h-9 w-9 text-[#0A1128]/20" />
                  <p className="mt-3 text-sm font-medium text-[#0A1128]">No notifications yet</p>
                  <p className="mt-1 text-xs text-[#4E5871]">Booking and customer activity will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onTouchStart={(event) => handleTouchStart(notification.id, event.touches[0]?.clientX ?? 0)}
                      onTouchEnd={(event) => handleTouchEnd(notification, event.changedTouches[0]?.clientX ?? 0)}
                      className={`flex w-full items-start gap-2 rounded-xl border p-2 transition-all ${notification.read_at ? 'border-[#E8DED4] bg-white' : 'border-[#C46A3A]/30 bg-[#F8F1EC]'}`}
                    >
                      <button
                        type="button"
                        onClick={() => void markAsRead(notification)}
                        className="min-w-0 flex-1 rounded-lg p-2 text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                          <p className="text-sm font-semibold text-[#0A1128]">{notification.title}</p>
                          <p className="mt-1 text-sm leading-5 text-[#4E5871]">{notification.body}</p>
                          <p className="mt-2 text-xs text-[#768098]">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                          </div>
                          {!notification.read_at && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#C46A3A]" />}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => void dismissNotification(notification)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#768098] hover:bg-[#E8DED4] hover:text-[#0A1128]"
                        aria-label={`Dismiss ${notification.title}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
