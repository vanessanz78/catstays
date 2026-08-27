import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Send,
  Shield,
  Unplug,
  Webhook
} from 'lucide-react';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { sendTestEmail } from '@/utils/email';
import {
  connectCatteryStripe,
  disconnectCatteryStripe,
  getCatteryPaymentStatus,
  testCatteryStripe,
  type CatteryPaymentStatus
} from '@/utils/catteryPayments';

type StripeMode = 'test' | 'live';

function SetupStep({ number, title, detail, complete = false }: { number: number; title: string; detail: string; complete?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          complete ? 'bg-green-100 text-green-700' : 'bg-[#F6ECE6] text-[#C46A3A]'
        }`}
      >
        {complete ? <CheckCircle className="h-4 w-4" /> : number}
      </div>
      <div>
        <p className="font-semibold text-[#2d3e2f]">{title}</p>
        <p className="text-sm text-[#6b7a6d]">{detail}</p>
      </div>
    </div>
  );
}

export function PaymentIntegration() {
  const { cattery } = useAuth();
  const [status, setStatus] = useState<CatteryPaymentStatus>({
    connected: false
  });
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [selectedMode, setSelectedMode] = useState<StripeMode>('test');
  const [showKeyForm, setShowKeyForm] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [message, setMessage] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<'sent' | 'error' | null>(null);

  useEffect(() => {
    if (!cattery?.id) return;
    setLoadingStatus(true);
    getCatteryPaymentStatus(cattery.id)
      .then((nextStatus) => {
        setStatus(nextStatus);
        setShowKeyForm(!nextStatus.connected);
        if (nextStatus.mode) setSelectedMode(nextStatus.mode);
      })
      .catch((error) => setMessage({ kind: 'error', text: error.message }))
      .finally(() => setLoadingStatus(false));
  }, [cattery?.id]);

  const handlePublishableKeyChange = (value: string) => {
    setPublishableKey(value);
    if (value.trim().startsWith('pk_live_')) setSelectedMode('live');
    if (value.trim().startsWith('pk_test_')) setSelectedMode('test');
  };

  const handleConnect = async () => {
    if (!cattery?.id) return;
    const expectedPublishablePrefix = `pk_${selectedMode}_`;
    const expectedSecretPrefix = `sk_${selectedMode}_`;
    if (!publishableKey.trim().startsWith(expectedPublishablePrefix) || !secretKey.trim().startsWith(expectedSecretPrefix)) {
      setMessage({
        kind: 'error',
        text: `Use matching ${selectedMode} mode keys beginning with ${expectedPublishablePrefix} and ${expectedSecretPrefix}.`
      });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const nextStatus = await connectCatteryStripe(cattery.id, publishableKey.trim(), secretKey.trim());
      setStatus(nextStatus);
      setPublishableKey('');
      setSecretKey('');
      setShowKeyForm(false);
      setMessage({
        kind: 'success',
        text: 'Stripe is connected and validated for this cattery.'
      });
    } catch (error: any) {
      setMessage({
        kind: 'error',
        text: error.message || 'Stripe could not validate these keys.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!cattery?.id) return;
    setTesting(true);
    setMessage(null);
    try {
      const nextStatus = await testCatteryStripe(cattery.id);
      setStatus(nextStatus);
      setMessage({
        kind: 'success',
        text: 'Connection passed. CatStays can securely reach this Stripe account.'
      });
    } catch (error: any) {
      setMessage({
        kind: 'error',
        text: error.message || 'Stripe connection test failed.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!cattery?.id) return;
    if (!window.confirm('Disconnect Stripe from this cattery? Existing Stripe payments are not deleted.')) return;
    setDisconnecting(true);
    setMessage(null);
    try {
      const nextStatus = await disconnectCatteryStripe(cattery.id);
      setStatus(nextStatus);
      setShowKeyForm(true);
      setSelectedMode('test');
      setMessage({
        kind: 'success',
        text: 'Stripe has been disconnected from this cattery.'
      });
    } catch (error: any) {
      setMessage({
        kind: 'error',
        text: error.message || 'Stripe could not be disconnected.'
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleTestEmail = async () => {
    const to = cattery?.email || 'support@catstays.app';
    setEmailTesting(true);
    setEmailTestResult(null);
    const result = await sendTestEmail(to);
    setEmailTesting(false);
    setEmailTestResult(result.success ? 'sent' : 'error');
    window.setTimeout(() => setEmailTestResult(null), 5000);
  };

  const connected = status.connected;
  const liveMode = status.mode === 'live';
  const modeLabel = liveMode ? 'Live Mode' : 'Test Mode';

  return (
    <div className="min-h-screen bg-[#F6F4EF]">
      <div className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/staff-dashboard" className="rounded-lg p-2 transition-colors hover:bg-[#F6F4EF]" aria-label="Back to dashboard">
              <ArrowLeft className="h-5 w-5 text-[#2d3e2f]" />
            </Link>
            <div>
              <h1 className="font-serif text-xl font-semibold text-[#2d3e2f]">Payment Setup</h1>
              <p className="text-sm text-[#6b7a6d]">Connect this cattery's Stripe account</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <RightMenu />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl space-y-6 p-4 pb-24 md:p-6">
        <Card className="overflow-hidden border-2" style={{ borderColor: connected ? '#7DAF7B' : '#C46A3A' }}>
          <CardContent className="p-0">
            <div className="flex flex-col gap-4 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#635BFF] to-[#0A2540]">
                  <CreditCard className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-xl font-semibold text-[#2d3e2f]">Stripe</h2>
                    {loadingStatus ? (
                      <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">Checking…</Badge>
                    ) : (
                      <Badge className={connected ? 'bg-[#7DAF7B] hover:bg-[#7DAF7B]' : 'bg-[#C46A3A] hover:bg-[#C46A3A]'}>
                        {connected ? modeLabel : 'Setup required'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#6b7a6d]">
                    {connected
                      ? `Connected to Stripe account ${status.accountId || ''}`
                      : 'Add this cattery’s own keys to accept booking deposits and full payments.'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                className="border-[#635BFF] text-[#635BFF]"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Stripe
              </Button>
            </div>

            <div className="grid gap-3 border-t bg-[#FBFAF8] p-5 sm:grid-cols-2 sm:p-6">
              {[
                'Direct booking payments',
                'Deposit and full-balance links',
                'Automatic payment confirmation',
                'Test and live Stripe modes'
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-[#2d3e2f]">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-[#7DAF7B]" />
                  {feature}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {message && (
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              message.kind === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'
            }`}
            role="status"
          >
            {message.kind === 'success' ? (
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {!loadingStatus && !connected && (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl text-[#2d3e2f]">Stripe setup progress</CardTitle>
              <p className="text-sm text-[#6b7a6d]">Follow these four steps before requesting customer payments.</p>
            </CardHeader>
            <CardContent className="grid gap-5 p-6 pt-0 sm:grid-cols-2">
              <SetupStep
                number={1}
                title="Open or create a Stripe account"
                detail="Use the Stripe account that should receive this cattery’s customer payments."
              />
              <SetupStep
                number={2}
                title="Choose test or live mode"
                detail="Start in test mode, then replace the keys with live keys when you are ready."
              />
              <SetupStep
                number={3}
                title="Add both API keys"
                detail="Copy the matching publishable and secret keys from Stripe’s API keys page."
              />
              <SetupStep
                number={4}
                title="Connect and validate"
                detail="CatStays validates the account and creates the payment webhook automatically."
              />
            </CardContent>
          </Card>
        )}

        {!loadingStatus && (showKeyForm || !connected) && (
          <Card className="border-2 border-[#635BFF]/30">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-serif text-xl text-[#2d3e2f]">
                    <KeyRound className="h-5 w-5 text-[#635BFF]" />
                    {connected ? 'Replace Stripe keys' : 'Add your Stripe keys'}
                  </CardTitle>
                  <p className="mt-1 text-sm text-[#6b7a6d]">Keys are validated before the connection is saved.</p>
                </div>
                <div className="flex rounded-lg bg-[#F1F0EC] p-1" aria-label="Stripe mode">
                  {(['test', 'live'] as StripeMode[]).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      aria-pressed={selectedMode === mode}
                      className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                        selectedMode === mode ? 'bg-white text-[#2d3e2f] shadow-sm' : 'text-[#6b7a6d]'
                      }`}
                    >
                      {mode === 'test' ? 'Test Mode' : 'Live Mode'}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6 pt-0">
              {selectedMode === 'live' && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Live mode processes real money.</strong> Test the booking and payment flow with test keys first.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="stripe-publishable-key" className="text-sm font-semibold text-[#2d3e2f]">
                  Publishable key
                </label>
                <input
                  id="stripe-publishable-key"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={publishableKey}
                  onChange={(event) => handlePublishableKeyChange(event.target.value)}
                  placeholder={`pk_${selectedMode}_...`}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="stripe-secret-key" className="text-sm font-semibold text-[#2d3e2f]">
                    Secret key
                  </label>
                  <span className="flex items-center gap-1 text-xs text-[#6b7a6d]">
                    <Lock className="h-3 w-3" /> Encrypted after save
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="stripe-secret-key"
                    type={showSecretKey ? 'text' : 'password'}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={secretKey}
                    onChange={(event) => setSecretKey(event.target.value)}
                    placeholder={`sk_${selectedMode}_...`}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
                    aria-label={showSecretKey ? 'Hide secret key' : 'Show secret key'}
                  >
                    {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[#F8F7F5] p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7DAF7B]" />
                  <div className="space-y-1 text-sm text-[#5c6b5e]">
                    <p>
                      <strong className="text-[#2d3e2f]">Each cattery connects its own Stripe account.</strong>
                    </p>
                    <p>
                      The secret key is sent once to the CatStays server, encrypted in Supabase Vault, and never returned to the browser.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  onClick={handleConnect}
                  disabled={saving || !publishableKey.trim() || !secretKey.trim()}
                  className="bg-[#635BFF] text-white hover:bg-[#0A2540]"
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                  {saving ? 'Validating…' : 'Connect and validate Stripe'}
                </Button>
                <Button variant="outline" onClick={() => window.open('https://dashboard.stripe.com/apikeys', '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Stripe API keys
                </Button>
                {connected && (
                  <Button variant="ghost" onClick={() => setShowKeyForm(false)} className="sm:ml-auto">
                    Cancel
                  </Button>
                )}
              </div>

              <div className="flex items-start gap-3 border-t pt-4 text-sm text-[#6b7a6d]">
                <Webhook className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C46A3A]" />
                <p>
                  CatStays creates and manages the Stripe webhook automatically after the keys validate. You do not need to paste a webhook
                  secret.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loadingStatus && connected && !showKeyForm && (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="font-serif text-xl text-[#2d3e2f]">Connection details</CardTitle>
                <Badge
                  className={liveMode ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-blue-100 text-blue-800 hover:bg-blue-100'}
                >
                  {modeLabel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6 pt-0">
              <div className="grid gap-4 rounded-xl bg-[#F8F7F5] p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a6d]">Publishable key</p>
                  <p className="mt-1 break-all font-mono text-sm text-[#2d3e2f]">{status.maskedPublishableKey || 'Configured'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a6d]">Last validated</p>
                  <p className="mt-1 text-sm text-[#2d3e2f]">
                    {status.lastValidatedAt ? new Date(status.lastValidatedAt).toLocaleString() : 'Connected successfully'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button onClick={handleTestConnection} disabled={testing} className="bg-[#2d3e2f] text-white hover:bg-[#1a2b1c]">
                  {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  {testing ? 'Testing…' : 'Test connection'}
                </Button>
                <Button variant="outline" onClick={() => setShowKeyForm(true)}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Replace keys
                </Button>
                <Button variant="outline" onClick={() => window.open('https://dashboard.stripe.com', '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Stripe dashboard
                </Button>
                <Button variant="ghost" onClick={handleDisconnect} disabled={disconnecting} className="text-red-700 sm:ml-auto">
                  {disconnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unplug className="mr-2 h-4 w-4" />}
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!loadingStatus && connected && !liveMode && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-[#2d3e2f]">Test a booking payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 pt-0">
              <p className="text-sm text-[#6b7a6d]">Confirm a test booking, request payment, and use Stripe’s test card:</p>
              <div className="flex flex-col gap-2 rounded-xl bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-blue-900">Successful payment</span>
                <code className="font-mono text-blue-800">4242 4242 4242 4242</code>
              </div>
              <p className="text-xs text-[#6b7a6d]">Use any future expiry date and any three-digit CVC.</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-[#7DAF7B]/20">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 font-serif text-xl text-[#2d3e2f]">
                <Mail className="h-5 w-5 text-[#C46A3A]" />
                Email receipts and requests
              </CardTitle>
              <Badge className="bg-[#7DAF7B] hover:bg-[#7DAF7B]">
                <CheckCircle className="mr-1 h-3 w-3" />
                Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <p className="text-sm text-[#5c6b5e]">
              CatStays sends booking and payment messages through the configured email service. Test delivery to this cattery’s email
              address.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button onClick={handleTestEmail} disabled={emailTesting} className="bg-[#2d3e2f] text-white hover:bg-[#1a2b1c]">
                {emailTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {emailTesting ? 'Sending…' : 'Send test email'}
              </Button>
              {emailTestResult === 'sent' && (
                <span className="flex items-center gap-1 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Sent to {cattery?.email || 'support@catstays.app'}
                </span>
              )}
              {emailTestResult === 'error' && (
                <span className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Delivery failed — check email configuration
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
