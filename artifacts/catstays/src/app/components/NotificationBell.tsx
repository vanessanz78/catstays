import { useEffect, useState } from 'react';
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
  created_at: string;
};

export function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CatStaysNotification[]>([]);

  const refresh = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const { data, error } = await supabase
      .from('catstays_notifications')
      .select('id,type,title,body,url,read_at,created_at')
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
          <section className="fixed inset-x-3 bottom-3 z-50 max-h-[78vh] overflow-hidden rounded-2xl bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-12 sm:w-[380px]">
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

            <div className="max-h-[calc(78vh-60px)] overflow-y-auto p-3">
              {notifications.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Bell className="mx-auto h-9 w-9 text-[#0A1128]/20" />
                  <p className="mt-3 text-sm font-medium text-[#0A1128]">No notifications yet</p>
                  <p className="mt-1 text-xs text-[#4E5871]">Booking and customer activity will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => void markAsRead(notification)}
                      className={`w-full rounded-xl border p-4 text-left transition-colors ${notification.read_at ? 'border-[#E8DED4] bg-white' : 'border-[#C46A3A]/30 bg-[#F8F1EC]'}`}
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
