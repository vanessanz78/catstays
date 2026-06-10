import { useState, useEffect } from 'react';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  ArrowLeft,
  Crown,
  CheckCircle,
  CreditCard,
  AlertCircle,
  Sparkles,
  Loader2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';

const PLAN_PRICE_NZD = 49;

const PLAN_FEATURES = [
  'Unlimited rooms & bookings',
  'Public website with custom subdomain',
  'Custom domain support',
  'Booking calendar & management',
  'Customer database',
  'Analytics & insights',
  'Automated email notifications',
  'Cat update and marketing tools',
  'Photo updates for customers',
  'Priority support',
];

async function getBillingToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export function Subscription() {
  const { cattery, refreshCattery } = useAuth() as any;
  const [searchParams] = useSearchParams();
  const [subscribing, setSubscribing] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const successParam = searchParams.get('success');
  const sessionId = searchParams.get('session_id');
  const status: string = cattery?.subscription_status || 'trial';

  // Verify subscription after Stripe redirect
  useEffect(() => {
    if (successParam === 'true' && sessionId && cattery?.id) {
      setVerifying(true);
      const verify = async () => {
        try {
          const jwt = await getBillingToken();
          const res = await fetch('/api/billing/verify-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
            },
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json();
          if (data.success) {
            setSuccessMessage('Subscription activated! Welcome to CatStays Professional.');
            if (typeof refreshCattery === 'function') refreshCattery();
          }
        } catch (err) {
          console.error('[subscription] verify error', err);
        } finally {
          setVerifying(false);
        }
      };
      verify();
    }
  }, [successParam, sessionId, cattery?.id]);

  const handleSubscribe = async () => {
    if (!cattery?.id) return;
    setSubscribing(true);
    setError(null);
    try {
      const jwt = await getBillingToken();
      // Derive plan from stored subscription_status (set during onboarding)
      // 'professional' and 'trial_professional' → Professional ($49)
      // 'active' (paid Starter), 'trial_starter', 'starter' → Starter ($29)
      // Anything else (e.g. unknown/trial) defaults to Professional
      const plan = status?.includes('professional') ? 'professional'
        : (status === 'active' || status?.includes('starter')) ? 'starter'
        : 'professional';
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify({ catteryId: cattery.id, plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSubscribing(false);
    }
  };

  const handlePortal = async () => {
    if (!cattery?.id) return;
    setOpeningPortal(true);
    setError(null);
    try {
      const jwt = await getBillingToken();
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify({ catteryId: cattery.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open billing portal');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setOpeningPortal(false);
    }
  };

  const statusConfig: Record<string, { label: string; badgeClass: string; borderColor: string }> = {
    trial: {
      label: 'Free Trial',
      badgeClass: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      borderColor: '#7DAF7B',
    },
    trial_starter: {
      label: 'Free Trial — Starter',
      badgeClass: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      borderColor: '#7DAF7B',
    },
    trial_professional: {
      label: 'Free Trial — Professional',
      badgeClass: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      borderColor: '#C46A3A',
    },
    active: {
      label: 'Active — Starter',
      badgeClass: 'bg-[#7DAF7B] hover:bg-[#7DAF7B]',
      borderColor: '#7DAF7B',
    },
    professional: {
      label: 'Active — Professional',
      badgeClass: 'bg-[#C46A3A] hover:bg-[#C46A3A]',
      borderColor: '#C46A3A',
    },
    past_due: {
      label: 'Payment Overdue',
      badgeClass: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
      borderColor: '#C46A3A',
    },
    cancelled: {
      label: 'Cancelled',
      badgeClass: 'bg-red-100 text-red-800 hover:bg-red-100',
      borderColor: '#e5e7eb',
    },
  };

  const cfg = statusConfig[status] || statusConfig.trial;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F4EF' }}>
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/staff-dashboard" className="p-2 hover:bg-[#F6F4EF] rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" style={{ color: '#2d3e2f' }} />
            </Link>
            <div>
              <h1 className="text-xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                Subscription
              </h1>
              <p className="text-sm" style={{ color: '#6b7a6d' }}>
                Manage your CatStays plan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <RightMenu />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-6 pb-24 space-y-6">

        {/* Success banner */}
        {(successMessage || verifying) && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            {verifying ? (
              <Loader2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-green-900 font-semibold">
              {verifying ? 'Activating your subscription…' : successMessage}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Past due warning */}
        {status === 'past_due' && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 mb-0.5">Payment overdue</p>
              <p className="text-sm text-amber-800">
                Your last payment failed. Update your payment method to keep your cattery online.
              </p>
            </div>
          </div>
        )}

        {/* Current Status Card */}
        <Card className="border-2" style={{ borderColor: cfg.borderColor }}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-2xl font-serif" style={{ color: '#2d3e2f' }}>
                    CatStays Professional
                  </CardTitle>
                  <Badge className={cfg.badgeClass}>{cfg.label}</Badge>
                </div>
                <p className="text-sm" style={{ color: '#6b7a6d' }}>
                  {status === 'active'
                    ? 'Your subscription is active. All features are unlocked.'
                    : status === 'trial'
                    ? 'You are currently on a free trial.'
                    : status === 'past_due'
                    ? 'Please update your payment method to restore access.'
                    : 'Your subscription has been cancelled.'}
                </p>
              </div>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: status === 'active' ? '#7DAF7B20' : '#F0EEE9' }}
              >
                <Crown
                  className="w-7 h-7"
                  style={{ color: status === 'active' ? '#7DAF7B' : '#9aaa9c' }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold" style={{ color: '#2d3e2f' }}>
                ${PLAN_PRICE_NZD}
              </span>
              <span className="text-lg" style={{ color: '#6b7a6d' }}>/month NZD</span>
            </div>

            <div className="flex flex-wrap gap-3">
              {status === 'active' && (
                <Button
                  onClick={handlePortal}
                  disabled={openingPortal}
                  className="bg-[#2d3e2f] hover:bg-[#1a2b1c] text-white"
                >
                  {openingPortal ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Opening…</>
                  ) : (
                    <><CreditCard className="w-4 h-4 mr-2" />Manage Billing</>
                  )}
                </Button>
              )}

              {(status === 'trial' || status === 'cancelled') && (
                <Button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="bg-[#7DAF7B] hover:bg-[#6a9e6a] text-white"
                >
                  {subscribing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting to Stripe…</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />{status === 'cancelled' ? 'Resubscribe' : 'Subscribe Now'}</>
                  )}
                </Button>
              )}

              {status === 'past_due' && (
                <Button
                  onClick={handlePortal}
                  disabled={openingPortal}
                  className="bg-[#C46A3A] hover:bg-[#A85A30] text-white"
                >
                  {openingPortal ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Opening…</>
                  ) : (
                    <><RefreshCw className="w-4 h-4 mr-2" />Update Payment Method</>
                  )}
                </Button>
              )}

              {status === 'active' && (
                <Button
                  variant="outline"
                  onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                  className="border-[#7DAF7B]/40 text-[#2d3e2f]"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Stripe Dashboard
                </Button>
              )}
            </div>

            <p className="text-xs" style={{ color: '#9aaa9c' }}>
              {status === 'trial'
                ? 'Subscribe to ensure uninterrupted access when your trial ends. Cancel anytime.'
                : status === 'active'
                ? 'Billed monthly. Cancel anytime from the billing portal.'
                : ''}
            </p>
          </CardContent>
        </Card>

        {/* What's included */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2" style={{ color: '#2d3e2f' }}>
              <Sparkles className="w-5 h-5 text-[#C46A3A]" />
              Everything included
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid sm:grid-cols-2 gap-3">
              {PLAN_FEATURES.map(feature => (
                <div key={feature} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#7DAF7B] flex-shrink-0 mt-0.5" />
                  <span className="text-sm" style={{ color: '#2d3e2f' }}>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing note */}
        {status !== 'active' && (
          <div className="p-4 bg-[#F8F7F5] rounded-xl border border-[#e8e4dd]">
            <p className="text-sm" style={{ color: '#6b7a6d' }}>
              Payments are processed securely by Stripe. You'll be redirected to Stripe Checkout to enter your card details.
              Your subscription renews monthly and can be cancelled at any time from the billing portal.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
