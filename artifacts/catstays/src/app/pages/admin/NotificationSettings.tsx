import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AlertCircle, ArrowLeft, BellRing, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { RightMenu } from '../../components/RightMenu';
import {
  enablePhoneNotifications,
  getPhoneNotificationState,
  sendTestPhoneNotification,
  type PhoneNotificationState,
} from '@/lib/pushService';

const initialState: PhoneNotificationState = {
  supported: true,
  configured: true,
  permission: 'default',
  subscribed: false,
};

export function NotificationSettings() {
  const { cattery } = useAuth();
  const [state, setState] = useState<PhoneNotificationState>(initialState);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const refresh = async () => {
    try {
      setState(await getPhoneNotificationState());
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Phone notification status could not be loaded.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const enable = async () => {
    if (!cattery?.id) return;
    setBusy(true);
    setMessage(null);
    try {
      await enablePhoneNotifications(cattery.id);
      await refresh();
      setMessage({ tone: 'success', text: 'Native phone notifications are connected to this cattery account.' });
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Phone notifications could not be enabled.' });
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    if (!cattery?.id) return;
    setBusy(true);
    setMessage(null);
    try {
      await sendTestPhoneNotification(cattery.id);
      await refresh();
      setMessage({ tone: 'success', text: 'Test sent. It will appear in your phone notifications even when CatStays is closed.' });
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'The test notification could not be sent.' });
    } finally {
      setBusy(false);
    }
  };

  const statusText = !state.supported
    ? 'Not supported by this browser'
    : !state.configured
      ? 'Waiting for CatStays server setup'
      : state.permission === 'denied'
        ? 'Blocked in phone settings'
        : state.subscribed
          ? 'Connected to this phone'
          : 'Ready to connect';

  return (
    <div className="min-h-screen bg-[#F8F7F5] lg:flex">
      <RightMenu mode="sidebar" />
      <div className="min-w-0 flex-1 pb-24">
      <header className="sticky top-0 z-40 border-b border-[#0A1128]/10 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <div className="lg:hidden"><RightMenu /></div>
          <Link to="/staff-dashboard/settings" className="rounded-lg p-2 transition-colors hover:bg-[#F8F7F5]" aria-label="Back to settings">
            <ArrowLeft className="h-5 w-5 text-[#0A1128]" />
          </Link>
          <BellRing className="h-6 w-6 text-[#C46A3A]" />
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#0A1128]">Phone notifications</h1>
            <p className="text-sm text-[#0A1128]/60">For {cattery?.name || 'your cattery account'}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 p-4">
        <Card className="overflow-hidden rounded-2xl border-[#C46A3A]/25 shadow-sm">
          <CardHeader className="bg-gradient-to-br from-white to-[#F4E9E2]">
            <CardTitle className="flex items-center gap-3 text-[#0A1128]">
              <span className="rounded-full bg-[#C46A3A]/10 p-3"><Smartphone className="h-6 w-6 text-[#C46A3A]" /></span>
              Native phone alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <p className="text-[#0A1128]/70">
              CatStays uses your installed app and your phone's own notification system. Booking and customer alerts can appear on the lock screen, with sound and vibration, whether the app is open or closed.
            </p>

            <div className="flex items-center justify-between rounded-xl bg-[#F8F7F5] px-4 py-3">
              <span className="font-medium text-[#0A1128]">This phone</span>
              <span className={`text-sm font-semibold ${state.subscribed ? 'text-emerald-700' : 'text-[#C46A3A]'}`}>
                {loading ? 'Checking…' : statusText}
              </span>
            </div>

            {message && (
              <div className={`flex gap-3 rounded-xl p-4 ${message.tone === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                {message.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            {!state.subscribed ? (
              <Button
                className="w-full bg-[#C46A3A] text-white hover:bg-[#A9572E]"
                disabled={busy || loading || !state.supported || !state.configured || !cattery?.id}
                onClick={enable}
              >
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enable phone notifications
              </Button>
            ) : (
              <Button
                className="w-full bg-[#C46A3A] text-white hover:bg-[#A9572E]"
                disabled={busy || !cattery?.id}
                onClick={test}
              >
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send a phone test
              </Button>
            )}

            <p className="text-xs leading-relaxed text-[#0A1128]/55">
              If notifications were blocked previously, open this installed app's site settings on your phone and allow notifications, sound, vibration, and lock-screen alerts.
            </p>
          </CardContent>
        </Card>
      </main>
      </div>
    </div>
  );
}
