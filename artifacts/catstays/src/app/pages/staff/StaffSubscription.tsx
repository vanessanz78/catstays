import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AlertTriangle, CheckCircle2, CreditCard, Crown, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';

type PlanKey = 'starter' | 'professional' | 'premium';

type BillingPlan = {
  id: PlanKey;
  name: string;
  priceNzd: number;
  description: string;
  features: string[];
};

const FALLBACK_PLANS: BillingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceNzd: 49,
    description: 'A calm, simple way to launch your cattery online.',
    features: ['Booking-ready cattery website', 'Dashboard to manage bookings', 'Customer communication tools', 'Payment request setup', 'Availability and room setup'],
  },
  {
    id: 'professional',
    name: 'Professional',
    priceNzd: 79,
    description: 'For catteries ready to give customers more self-service.',
    features: ['Everything in Starter', 'Client portal logins', 'Customer-managed bookings', 'Photo updates and reminders', 'Reports for bookings and revenue'],
  },
  {
    id: 'premium',
    name: 'Premium',
    priceNzd: 99,
    description: 'For established catteries that want the complete growth toolkit.',
    features: ['Everything in Professional', 'Custom domain request workflow', 'Marketing kit and social assets', 'Accounting and financial tools', 'Advanced reports'],
  },
];

async function getBillingToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

function getPlanFromStatus(status: string): PlanKey | null {
  if (status === 'active') return 'starter';
  if (status === 'starter' || status === 'professional' || status === 'premium') return status;
  if (status.startsWith('trial_')) {
    const trialPlan = status.slice('trial_'.length);
    if (trialPlan === 'starter' || trialPlan === 'professional' || trialPlan === 'premium') return trialPlan;
  }
  return null;
}

function getStatusDetails(status: string, planName?: string) {
  if (status.startsWith('trial')) {
    return {
      label: planName ? `${planName} trial` : 'Free trial',
      description: planName
        ? `Your selected plan after the trial is ${planName}. Stripe will show the monthly price before you confirm.`
        : 'Choose the CatStays plan you want to continue with after your trial.',
      badgeClass: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    };
  }
  if (status === 'starter' || status === 'professional' || status === 'premium' || status === 'active') {
    return {
      label: `${planName || 'Starter'} active`,
      description: 'Your subscription is active. Use Stripe’s secure billing portal to manage payment details or your plan.',
      badgeClass: 'bg-[#7DAF7B] text-white hover:bg-[#7DAF7B]',
    };
  }
  if (status === 'past_due' || status === 'unpaid') {
    return {
      label: 'Payment needs attention',
      description: 'Open the secure billing portal to update your payment method and restore your subscription.',
      badgeClass: 'bg-amber-100 text-amber-900 hover:bg-amber-100',
    };
  }
  if (status === 'cancelled' || status === 'canceled') {
    return {
      label: 'Cancelled',
      description: 'Choose a plan below when you are ready to restart your CatStays subscription.',
      badgeClass: 'bg-red-100 text-red-800 hover:bg-red-100',
    };
  }
  return {
    label: 'Choose a plan',
    description: 'Select the CatStays plan that best fits your cattery.',
    badgeClass: 'bg-slate-100 text-slate-800 hover:bg-slate-100',
  };
}

export function StaffSubscription() {
  const { cattery, refreshCattery } = useAuth();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState<BillingPlan[]>(FALLBACK_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const verificationAttempted = useRef(false);

  const status = cattery?.subscription_status || 'trial';
  const currentPlanKey = getPlanFromStatus(status);
  const currentPlan = plans.find((plan) => plan.id === currentPlanKey);
  const statusDetails = getStatusDetails(status, currentPlan?.name);
  const canManageBilling = ['starter', 'professional', 'premium', 'active', 'past_due', 'unpaid'].includes(status);
  const canChoosePlan = !canManageBilling;

  useEffect(() => {
    let cancelled = false;
    fetch('/api/billing/plans')
      .then(async (response) => {
        if (!response.ok) throw new Error('Plan catalogue is unavailable');
        const payload = await response.json();
        if (!Array.isArray(payload.plans) || payload.plans.length !== 3) throw new Error('Plan catalogue is incomplete');
        return payload.plans as BillingPlan[];
      })
      .then((nextPlans) => {
        if (!cancelled) setPlans(nextPlans);
      })
      .catch((fetchError) => {
        console.error('[staff-subscription] plan catalogue', fetchError);
      })
      .finally(() => {
        if (!cancelled) setLoadingPlans(false);
      });
    return () => { cancelled = true; };
  }, []);

  const sessionId = searchParams.get('session_id');
  const returnedFromCheckout = searchParams.get('success') === 'true';
  useEffect(() => {
    if (!returnedFromCheckout || !sessionId || !cattery?.id || verificationAttempted.current) return;
    verificationAttempted.current = true;
    let cancelled = false;
    setBusyAction('verify');
    setError(null);
    void (async () => {
      try {
        const token = await getBillingToken();
        const response = await fetch('/api/billing/verify-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ sessionId }),
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error || 'Stripe has not confirmed this subscription yet');
        const activatedPlan = plans.find((plan) => plan.id === payload.plan);
        if (!cancelled) setSuccessMessage(`${activatedPlan?.name || 'Your'} subscription is active.`);
        await refreshCattery();
      } catch (verificationError) {
        if (!cancelled) setError(verificationError instanceof Error ? verificationError.message : 'Could not verify the subscription');
      } finally {
        if (!cancelled) setBusyAction(null);
      }
    })();
    return () => { cancelled = true; };
  }, [cattery?.id, plans, refreshCattery, returnedFromCheckout, sessionId]);

  const selectedPlanSummary = useMemo(() => currentPlan
    ? `${currentPlan.name} · $${currentPlan.priceNzd} NZD/month`
    : 'No paid plan is active', [currentPlan]);

  const startCheckout = async (plan: PlanKey) => {
    if (!cattery?.id) return;
    setBusyAction(plan);
    setError(null);
    try {
      const token = await getBillingToken();
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ catteryId: cattery.id, plan }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.url) throw new Error(payload.error || 'Could not open secure checkout');
      window.location.assign(payload.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Could not open secure checkout');
      setBusyAction(null);
    }
  };

  const openBillingPortal = async () => {
    if (!cattery?.id) return;
    setBusyAction('portal');
    setError(null);
    try {
      const token = await getBillingToken();
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ catteryId: cattery.id }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.url) throw new Error(payload.error || 'Could not open secure billing');
      window.location.assign(payload.url);
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : 'Could not open secure billing');
      setBusyAction(null);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {busyAction === 'verify' && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-900">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Confirming your subscription with Stripe…
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-900">
          <CheckCircle2 className="h-5 w-5" /> {successMessage}
        </div>
      )}
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div><p className="font-semibold">Billing could not continue</p><p className="mt-1">{error}</p></div>
        </div>
      )}

      <section className="rounded-xl border border-[#E8DED4] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#C46A3A]/10">
                <Crown className="h-6 w-6 text-[#C46A3A]" />
              </div>
              <Badge className={statusDetails.badgeClass}>{statusDetails.label}</Badge>
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-[#0A1128]">{selectedPlanSummary}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4E5871]">{statusDetails.description}</p>
          </div>
          {canManageBilling && (
            <Button onClick={openBillingPortal} disabled={busyAction !== null} className="w-full shrink-0 rounded-lg bg-[#0A1128] text-white hover:bg-[#19233D] sm:w-auto">
              {busyAction === 'portal' ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
              Manage billing securely
            </Button>
          )}
        </div>
      </section>

      <div>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-[#0A1128]">CatStays plans</h3>
            <p className="mt-1 text-sm text-[#4E5871]">Monthly prices in NZD. Stripe shows the full total before you confirm.</p>
          </div>
          {loadingPlans && <span className="mt-2 flex items-center gap-2 text-xs text-[#4E5871] sm:mt-0"><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Checking live plan catalogue</span>}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentPlanKey === plan.id;
            return (
              <section key={plan.id} className={`flex min-w-0 flex-col rounded-xl border bg-white p-5 shadow-sm ${plan.id === 'professional' ? 'border-[#C46A3A]' : 'border-[#E8DED4]'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xl font-semibold text-[#0A1128]">{plan.name}</h4>
                  {isCurrent ? <Badge className="bg-[#7DAF7B] text-white hover:bg-[#7DAF7B]">Selected</Badge> : plan.id === 'professional' ? <Badge className="bg-[#C46A3A] text-white hover:bg-[#C46A3A]">Most popular</Badge> : null}
                </div>
                <div className="mt-4 flex items-baseline gap-1 text-[#0A1128]">
                  <span className="text-4xl font-bold">${plan.priceNzd}</span><span className="text-sm text-[#4E5871]">NZD/month</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#4E5871]">{plan.description}</p>
                <ul className="mt-5 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#0A1128]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7DAF7B]" /> {feature}
                    </li>
                  ))}
                </ul>
                {canChoosePlan && (
                  <Button onClick={() => startCheckout(plan.id)} disabled={busyAction !== null} className="mt-6 w-full rounded-lg bg-[#C46A3A] text-white hover:bg-[#A85A30]">
                    {busyAction === plan.id ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isCurrent ? `Continue with ${plan.name}` : `Choose ${plan.name}`}
                  </Button>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-[#E8DED4] bg-[#F8F7F5] p-4 text-sm leading-6 text-[#4E5871]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2D5830]" />
        <p>CatStays subscription billing is handled by Stripe. Card details are entered only on Stripe’s secure checkout or billing portal. This is separate from the Stripe connection your cattery uses to accept customer booking payments.</p>
      </div>
    </div>
  );
}
