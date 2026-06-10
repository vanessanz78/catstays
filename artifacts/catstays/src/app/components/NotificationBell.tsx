import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Bell, X, Calendar, DollarSign, MessageSquare, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'New Booking',
      message: 'Sarah Johnson booked for Whiskers & Luna',
      time: new Date(2026, 2, 16, 10, 30),
      read: false,
      icon: Calendar,
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: '$280 from Mike Chen',
      time: new Date(2026, 2, 16, 9, 15),
      read: false,
      icon: DollarSign,
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message',
      message: 'Emma Wilson sent you a message',
      time: new Date(2026, 2, 15, 16, 45),
      read: true,
      icon: MessageSquare,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'booking': return '#C46A3A';
      case 'payment': return '#0A1128';
      case 'message': return '#C46A3A';
      default: return '#0A1128';
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-[#C46A3A]/10 relative"
      >
        <Bell className="w-6 h-6" style={{ color: '#C46A3A' }} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0A1128] flex items-center justify-center">
            <span className="text-xs text-white font-bold">{unreadCount}</span>
          </div>
        )}
      </Button>

      {/* Notifications Bottom Sheet */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/30 z-50 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet Drawer */}
          <div 
            className="fixed left-0 right-0 bottom-0 bg-white rounded-t-[24px] transition-all duration-300 shadow-2xl flex flex-col overflow-hidden z-[9999]"
            style={{ 
              height: '75vh',
              maxWidth: '100%',
            }}
          >
            {/* Drag Handle & Header */}
            <div className="flex-shrink-0 bg-white border-b border-[#0A1128]/10 px-5 pt-2 pb-4">
              <div className="w-12 h-1.5 bg-[#0A1128]/20 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-semibold text-[#0A1128]">
                  Notifications
                </h2>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-[#0A1128]/60 hover:bg-[#0A1128]/5"
                    >
                      Mark all read
                    </Button>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-[#0A1128]/5 rounded-lg -mr-2"
                  >
                    <X className="w-5 h-5 text-[#0A1128]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Notifications List */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-[#0A1128]/30" />
                  <p className="text-sm text-[#0A1128]/60">
                    No notifications
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mt-4">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <button
                        key={notification.id}
                        onClick={() => {
                          markAsRead(notification.id);
                          setIsOpen(false);
                          setSelectedNotification(notification);
                        }}
                        className={`w-full text-left p-4 rounded-xl transition-colors border ${
                          !notification.read 
                            ? 'bg-[#F8F7F5] border-[#C46A3A]/20' 
                            : 'bg-white border-[#0A1128]/10 hover:bg-[#F8F7F5]'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${getIconColor(notification.type)}20` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: getIconColor(notification.type) }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm text-[#0A1128]">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-[#C46A3A] flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-[#0A1128]/70 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-[#0A1128]/50">
                              {format(notification.time, 'MMM dd, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Notification Detail Drawer */}
      {selectedNotification && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/30 z-[10000] transition-opacity duration-300"
            onClick={() => setSelectedNotification(null)}
          />

          {/* Detail Bottom Sheet */}
          <div 
            className="fixed left-0 right-0 bottom-0 bg-white rounded-t-[24px] transition-all duration-300 shadow-2xl flex flex-col overflow-hidden z-[10001]"
            style={{ 
              height: '75vh',
              maxWidth: '100%',
            }}
          >
            {/* Drag Handle & Header */}
            <div className="flex-shrink-0 bg-white border-b border-[#0A1128]/10 px-5 pt-2 pb-4">
              <div className="w-12 h-1.5 bg-[#0A1128]/20 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-semibold text-[#0A1128]">
                  {selectedNotification.title}
                </h2>
                <button 
                  onClick={() => setSelectedNotification(null)}
                  className="p-2 hover:bg-[#0A1128]/5 rounded-lg -mr-2"
                >
                  <X className="w-5 h-5 text-[#0A1128]" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
              {selectedNotification.type === 'booking' && (
                <div className="space-y-4">
                  <Card className="border-[#0A1128]/10">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <div className="text-xs text-[#0A1128]/50 mb-1">Customer</div>
                        <div className="text-base font-semibold text-[#0A1128]">Sarah Johnson</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#0A1128]/50 mb-1">Pets</div>
                        <div className="text-base font-semibold text-[#0A1128]">Whiskers & Luna</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#0A1128]/50 mb-1">Dates</div>
                        <div className="text-base font-semibold text-[#0A1128]">Mar 20 - Mar 25, 2026</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#0A1128]/50 mb-1">Room</div>
                        <div className="text-base font-semibold text-[#0A1128]">Suite 3</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#0A1128]/50 mb-1">Payment Status</div>
                        <Badge className="bg-[#C46A3A]/10 text-[#C46A3A] hover:bg-[#C46A3A]/20">
                          Deposit Paid
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedNotification.type === 'payment' && (
                <div className="space-y-4">
                  <Card className="border-[#0A1128]/10">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <div className="text-xs text-[#0A1128]/50 mb-1">Amount Received</div>
                        <div className="text-2xl font-bold text-[#C46A3A]">$280.00</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#0A1128]/50 mb-1">Customer</div>
                        <div className="text-base font-semibold text-[#0A1128]">Mike Chen</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#0A1128]/50 mb-1">Payment Method</div>
                        <div className="text-base font-semibold text-[#0A1128]">Credit Card</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#0A1128]/50 mb-1">Date & Time</div>
                        <div className="text-base font-semibold text-[#0A1128]">
                          {format(selectedNotification.time, 'MMM dd, yyyy - h:mm a')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedNotification.type === 'message' && (
                <div className="space-y-4">
                  <Card className="border-[#0A1128]/10">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <div className="text-xs text-[#0A1128]/50 mb-1">From</div>
                        <div className="text-base font-semibold text-[#0A1128]">Emma Wilson</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#0A1128]/50 mb-1">Message</div>
                        <div className="text-base text-[#0A1128] bg-[#F8F7F5] p-3 rounded-lg">
                          Hi! Just wanted to confirm that Mittens will be arriving on Thursday at 2pm. Also, I've packed his favorite toy. Looking forward to seeing you!
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#0A1128]/50 mb-1">Received</div>
                        <div className="text-base font-semibold text-[#0A1128]">
                          {format(selectedNotification.time, 'MMM dd, yyyy - h:mm a')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Fixed Bottom Actions */}
            <div className="flex-shrink-0 bg-white border-t border-[#0A1128]/10 px-5 py-4">
              {selectedNotification.type === 'booking' && (
                <div className="space-y-3">
                  <Button className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white">
                    Accept & Confirm Booking
                  </Button>
                  <Button variant="outline" className="w-full border-[#0A1128]/20 text-[#0A1128]">
                    View Full Booking
                  </Button>
                </div>
              )}

              {selectedNotification.type === 'payment' && (
                <div className="space-y-3">
                  <Button className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white">
                    View Booking
                  </Button>
                  <Button variant="outline" className="w-full border-[#0A1128]/20 text-[#0A1128]">
                    View Payment Details
                  </Button>
                </div>
              )}

              {selectedNotification.type === 'message' && (
                <div className="space-y-3">
                  <Button className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white">
                    Reply
                  </Button>
                  <Button variant="outline" className="w-full border-[#0A1128]/20 text-[#0A1128]">
                    Open Full Conversation
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}