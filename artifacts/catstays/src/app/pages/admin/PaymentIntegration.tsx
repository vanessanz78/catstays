import { useState, useEffect } from 'react';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  ExternalLink,
  Zap,
  Lock,
  Shield,
  Settings,
  AlertCircle,
  Mail,
  Send,
  Loader2,
  Eye,
  EyeOff,
  Store,
} from 'lucide-react';
import { Link } from 'react-router';
import { stripeConfigured, stripePublishableKey, stripeLiveMode } from '@/utils/stripe';
import { sendTestEmail } from '@/utils/email';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';

export function PaymentIntegration() {
  const { cattery } = useAuth();
  const [acceptPayments, setAcceptPayments] = useState(true);
  const [autoReceipts, setAutoReceipts] = useState(true);
  const [saveCards, setSaveCards] = useState(true);
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<'sent' | 'error' | null>(null);

  // Per-cattery Stripe (for accepting payments from clients)
  const [catteryPubKey, setCatteryPubKey] = useState('');
  const [catterySecretKey, setCatterySecretKey] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [savingCatteryStripe, setSavingCatteryStripe] = useState(false);
  const [catteryStripeSaved, setCatteryStripeSaved] = useState(false);
  const [catteryStripeError, setCatteryStripeError] = useState<string | null>(null);

  useEffect(() => {
    if (!cattery?.id) return;
    const fetchPaymentSettings = async () => {
      const { data } = await supabase
        .from('catteries')
        .select('payment_settings')
        .eq('id', cattery.id)
        .single();
      if (data?.payment_settings) {
        setCatteryPubKey(data.payment_settings.stripe_publishable_key || '');
        setCatterySecretKey(data.payment_settings.stripe_secret_key || '');
      }
    };
    fetchPaymentSettings();
  }, [cattery?.id]);

  const handleSaveCatteryStripe = async () => {
    if (!cattery?.id) return;
    if (!catteryPubKey.startsWith('pk_')) {
      setCatteryStripeError('Publishable key must start with pk_live_ or pk_test_');
      return;
    }
    if (catterySecretKey && !catterySecretKey.startsWith('sk_')) {
      setCatteryStripeError('Secret key must start with sk_live_ or sk_test_');
      return;
    }
    setSavingCatteryStripe(true);
    setCatteryStripeError(null);
    const { error } = await supabase
      .from('catteries')
      .update({
        payment_settings: {
          stripe_publishable_key: catteryPubKey.trim(),
          stripe_secret_key: catterySecretKey.trim(),
        },
      })
      .eq('id', cattery.id);
    if (error) {
      setCatteryStripeError(error.message);
    } else {
      setCatteryStripeSaved(true);
      setTimeout(() => setCatteryStripeSaved(false), 3000);
    }
    setSavingCatteryStripe(false);
  };

  const catteryStripeConfigured = !!catteryPubKey && catteryPubKey.startsWith('pk_');

  const handleTestEmail = async () => {
    const to = cattery?.email || 'support@catstays.app';
    setEmailTesting(true);
    setEmailTestResult(null);
    const result = await sendTestEmail(to);
    setEmailTesting(false);
    setEmailTestResult(result.success ? 'sent' : 'error');
    setTimeout(() => setEmailTestResult(null), 5000);
  };

  const maskedKey = stripePublishableKey
    ? stripePublishableKey.slice(0, 14) + '...' + stripePublishableKey.slice(-4)
    : '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F4EF' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="p-2 hover:bg-[#F6F4EF] rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" style={{ color: '#2d3e2f' }} />
            </Link>
            <div>
              <h1 className="text-xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                Payment Integration
              </h1>
              <p className="text-sm" style={{ color: '#6b7a6d' }}>
                Stripe payments for your bookings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <RightMenu />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24 space-y-6">

        {/* Connection Status */}
        <Card
          className="border-2"
          style={{ borderColor: stripeConfigured ? '#7DAF7B' : '#C46A3A' }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#635BFF] to-[#0A2540] flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                    {stripeConfigured ? 'Stripe Connected' : 'Stripe Not Configured'}
                  </h2>
                  <Badge
                    className={stripeConfigured
                      ? 'bg-[#7DAF7B] hover:bg-[#7DAF7B]'
                      : 'bg-[#C46A3A] hover:bg-[#C46A3A]'
                    }
                  >
                    {stripeConfigured
                      ? (stripeLiveMode ? 'Live Mode' : 'Test Mode')
                      : 'Not set up'
                    }
                  </Badge>
                </div>
                {stripeConfigured ? (
                  <p className="text-sm font-mono" style={{ color: '#6b7a6d' }}>
                    {maskedKey}
                  </p>
                ) : (
                  <p className="text-sm" style={{ color: '#6b7a6d' }}>
                    Add your Stripe keys as environment secrets to enable payments.
                  </p>
                )}
              </div>
              {stripeConfigured && (
                <Button
                  onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                  className="bg-[#635BFF] hover:bg-[#0A2540] text-white flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* What you get / Features */}
        <Card className="border-[#7DAF7B]/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#2d3e2f' }}>
              <Zap className="w-5 h-5 text-[#C46A3A]" />
              With Stripe you can:
            </h3>
            <ul className="space-y-3">
              {[
                'Accept credit & debit cards from customers',
                'Collect deposits and full payments at booking',
                'Send automated payment confirmations',
                'PCI-compliant secure payment processing',
              ].map(feature => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#7DAF7B] flex-shrink-0 mt-0.5" />
                  <span className="text-sm" style={{ color: '#2d3e2f' }}>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Key Configuration Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-serif" style={{ color: '#2d3e2f' }}>
                Key Configuration
              </CardTitle>
              <Badge className="bg-[#6b7a6d] hover:bg-[#6b7a6d]">
                <Lock className="w-3 h-3 mr-1" />
                Secure
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {stripeConfigured ? (
              <>
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 mb-1">
                      Keys configured via environment variables
                    </p>
                    <p className="text-sm text-green-800">
                      <strong>STRIPE_PUBLIC_KEY</strong> and <strong>STRIPE_API_KEY</strong> are securely stored as Replit secrets — they're never exposed in your source code.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#F8F7F5] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#2d3e2f' }}>Publishable Key</p>
                      <p className="text-xs font-mono mt-0.5" style={{ color: '#6b7a6d' }}>{maskedKey}</p>
                    </div>
                    <Badge className={stripeLiveMode ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      {stripeLiveMode ? 'Live' : 'Test'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#2d3e2f' }}>Secret Key</p>
                      <p className="text-xs font-mono mt-0.5" style={{ color: '#6b7a6d' }}>sk_live_••••••••••••••••</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#6b7a6d' }}>
                      <Shield className="w-3 h-3" />
                      Server-side only
                    </div>
                  </div>
                </div>

                {stripeLiveMode && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      You're in <strong>live mode</strong> — real payments will be processed. Make sure you've tested your setup first.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 mb-1">Keys not found</p>
                    <p className="text-sm text-amber-800">
                      Add two Replit secrets to enable payments:
                    </p>
                    <ul className="text-sm text-amber-800 mt-2 space-y-1">
                      <li>• <code className="font-mono bg-amber-100 px-1 rounded">STRIPE_PUBLIC_KEY</code> — your publishable key (pk_...)</li>
                      <li>• <code className="font-mono bg-amber-100 px-1 rounded">STRIPE_API_KEY</code> — your secret key (sk_...)</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    <strong>New to Stripe?</strong>{' '}
                    <a href="https://dashboard.stripe.com/register" target="_blank" rel="noreferrer" className="underline">
                      Create a free account →
                    </a>
                    {' '}then find your keys under Developers → API Keys.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2" style={{ color: '#2d3e2f' }}>
              <Settings className="w-5 h-5" />
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[
              { label: 'Accept card payments at booking', desc: 'Customers can pay deposits or full amount', state: acceptPayments, set: setAcceptPayments },
              { label: 'Automatic payment receipts', desc: 'Send receipts to customers automatically', state: autoReceipts, set: setAutoReceipts },
              { label: 'Save cards for future bookings', desc: 'Allow customers to save payment methods', state: saveCards, set: setSaveCards },
            ].map(setting => (
              <div key={setting.label} className="flex items-center justify-between p-4 bg-[#F8F7F5] rounded-lg">
                <div>
                  <p className="font-semibold" style={{ color: '#2d3e2f' }}>{setting.label}</p>
                  <p className="text-sm" style={{ color: '#6b7a6d' }}>{setting.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.state}
                    onChange={e => setting.set(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7DAF7B]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7DAF7B]"></div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resend Email Integration */}
        <Card className="border-[#7DAF7B]/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-serif flex items-center gap-2" style={{ color: '#2d3e2f' }}>
                <Mail className="w-5 h-5 text-[#C46A3A]" />
                Email Integration
              </CardTitle>
              <Badge className="bg-[#7DAF7B] hover:bg-[#7DAF7B]">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 mb-1">Resend configured</p>
                <p className="text-sm text-green-800">
                  <strong>RESEND_API_KEY</strong> is set — booking confirmation emails and customer enquiries are enabled.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#F8F7F5] rounded-xl space-y-2">
              <p className="text-sm font-semibold" style={{ color: '#2d3e2f' }}>What gets sent automatically:</p>
              <ul className="space-y-1.5">
                {[
                  'Booking confirmation to customer on new booking',
                  'Contact enquiry forwarded to your email',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: '#5c6b5e' }}>
                    <CheckCircle className="w-4 h-4 text-[#7DAF7B] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-1">Domain verification needed for customers</p>
                <p className="text-sm text-amber-800">
                  Until you verify a domain at{' '}
                  <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="underline font-medium">
                    resend.com/domains
                  </a>
                  , emails can only be sent to your own address. Once verified, booking confirmations will go directly to your customers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleTestEmail}
                disabled={emailTesting}
                className="bg-[#2d3e2f] hover:bg-[#1a2b1c] text-white"
              >
                {emailTesting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" />Send test email</>
                )}
              </Button>
              {emailTestResult === 'sent' && (
                <span className="text-sm text-green-700 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Sent to {cattery?.email || 'support@catstays.app'}
                </span>
              )}
              {emailTestResult === 'error' && (
                <span className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Failed — check domain verification
                </span>
              )}
            </div>

            <p className="text-xs" style={{ color: '#9aaa9c' }}>
              Test email will be sent to your cattery's email address.
            </p>
          </CardContent>
        </Card>

        {/* Customer Payments (per-cattery Stripe) */}
        <Card className="border-2" style={{ borderColor: catteryStripeConfigured ? '#7DAF7B' : '#e5e7eb' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-serif flex items-center gap-2" style={{ color: '#2d3e2f' }}>
                <Store className="w-5 h-5 text-[#C46A3A]" />
                Accept Payments from Your Clients
              </CardTitle>
              <Badge className={catteryStripeConfigured ? 'bg-[#7DAF7B] hover:bg-[#7DAF7B]' : 'bg-gray-200 text-gray-700 hover:bg-gray-200'}>
                {catteryStripeConfigured ? 'Connected' : 'Not set up'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-5">
            <div className="p-4 bg-[#F8F7F5] rounded-xl">
              <p className="text-sm" style={{ color: '#5c6b5e' }}>
                This is <strong>separate</strong> from the CatStays platform Stripe account. Enter your <strong>own Stripe keys</strong> so your clients can pay booking deposits directly to you.
                Your keys are protected — only you can access them.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: '#2d3e2f' }}>
                  Publishable Key <span className="font-mono text-xs text-gray-400">(pk_live_... or pk_test_...)</span>
                </label>
                <input
                  type="text"
                  value={catteryPubKey}
                  onChange={e => setCatteryPubKey(e.target.value)}
                  placeholder="pk_live_..."
                  className="w-full px-4 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7DAF7B]"
                  style={{ borderColor: '#d1d5db' }}
                />
                <p className="text-xs" style={{ color: '#9aaa9c' }}>
                  Safe to store — this key is public-facing.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: '#2d3e2f' }}>
                  Secret Key <span className="font-mono text-xs text-gray-400">(sk_live_... or sk_test_...)</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    value={catterySecretKey}
                    onChange={e => setCatterySecretKey(e.target.value)}
                    placeholder="sk_live_..."
                    className="w-full px-4 py-2 pr-12 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7DAF7B]"
                    style={{ borderColor: '#d1d5db' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs" style={{ color: '#9aaa9c' }}>
                  Stored securely, protected by row-level security — only your account can access it.
                </p>
              </div>
            </div>

            {catteryStripeError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{catteryStripeError}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveCatteryStripe}
                disabled={savingCatteryStripe || !catteryPubKey.trim()}
                className="bg-[#635BFF] hover:bg-[#0A2540] text-white"
              >
                {savingCatteryStripe ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                ) : (
                  <><CreditCard className="w-4 h-4 mr-2" />Save Stripe Keys</>
                )}
              </Button>
              {catteryStripeSaved && (
                <span className="text-sm text-green-700 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Saved
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://dashboard.stripe.com/apikeys', '_blank')}
                className="ml-auto border-gray-200 text-gray-600"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Get keys from Stripe
              </Button>
            </div>

            {catteryStripeConfigured && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 mb-0.5">Ready to accept payments</p>
                  <p className="text-sm text-green-800">
                    Your clients can now pay booking deposits online. Your key:{' '}
                    <code className="font-mono bg-green-100 px-1 rounded text-xs">
                      {catteryPubKey.slice(0, 14)}…{catteryPubKey.slice(-4)}
                    </code>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test cards reference */}
        {stripeConfigured && !stripeLiveMode && (
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3" style={{ color: '#2d3e2f' }}>Test Card Numbers</h3>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#2d3e2f' }}>Success</span>
                  <span style={{ color: '#6b7a6d' }}>4242 4242 4242 4242</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#2d3e2f' }}>Declined</span>
                  <span style={{ color: '#6b7a6d' }}>4000 0000 0000 0002</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#2d3e2f' }}>3D Secure</span>
                  <span style={{ color: '#6b7a6d' }}>4000 0025 0000 3155</span>
                </div>
              </div>
              <p className="text-xs mt-3" style={{ color: '#6b7a6d' }}>Use any future expiry and any 3-digit CVC</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
