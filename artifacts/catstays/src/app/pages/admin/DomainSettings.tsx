import { useState, useEffect } from 'react';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  ArrowLeft,
  Globe,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Link2,
} from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';

const ROOT_DOMAIN = 'catstays.app';

export function DomainSettings() {
  const { cattery } = useAuth();

  const [customDomain, setCustomDomain] = useState('');
  const [savedDomain, setSavedDomain] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ verified: boolean; message: string; resolvedTo?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const subdomainUrl = cattery?.slug ? `${cattery.slug}.${ROOT_DOMAIN}` : null;

  useEffect(() => {
    if (!cattery?.id) return;
    const fetchDomain = async () => {
      const { data } = await supabase
        .from('catteries')
        .select('custom_domain')
        .eq('id', cattery.id)
        .single();
      if (data?.custom_domain) {
        setSavedDomain(data.custom_domain);
        setCustomDomain(data.custom_domain);
      }
    };
    fetchDomain();
  }, [cattery?.id]);

  const copySubdomain = async () => {
    if (!subdomainUrl) return;
    await navigator.clipboard.writeText(`https://${subdomainUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDomain = async () => {
    if (!cattery?.id || !customDomain.trim()) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const domain = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '');
    const { error } = await supabase
      .from('catteries')
      .update({ custom_domain: domain })
      .eq('id', cattery.id);

    if (error) {
      setSaveError(error.message.includes('unique') ? 'This domain is already used by another cattery.' : error.message);
    } else {
      setSavedDomain(domain);
      setCustomDomain(domain);
      setSaveSuccess(true);
      setVerifyResult(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setSaving(false);
  };

  const handleRemoveDomain = async () => {
    if (!cattery?.id) return;
    setRemoving(true);
    const { error } = await supabase
      .from('catteries')
      .update({ custom_domain: null })
      .eq('id', cattery.id);
    if (!error) {
      setSavedDomain(null);
      setCustomDomain('');
      setVerifyResult(null);
    }
    setRemoving(false);
  };

  const handleVerify = async () => {
    const domain = savedDomain || customDomain.trim();
    if (!domain) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(`/api/cattery/verify-domain?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();
      setVerifyResult(data);
    } catch {
      setVerifyResult({ verified: false, message: 'Verification failed — check your internet connection.' });
    }
    setVerifying(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F4EF' }}>
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="p-2 hover:bg-[#F6F4EF] rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" style={{ color: '#2d3e2f' }} />
            </Link>
            <div>
              <h1 className="text-xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                Domain Settings
              </h1>
              <p className="text-sm" style={{ color: '#6b7a6d' }}>
                Manage your cattery's public web address
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

        {/* Free Subdomain */}
        <Card className="border-2" style={{ borderColor: '#7DAF7B' }}>
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2" style={{ color: '#2d3e2f' }}>
              <Globe className="w-5 h-5 text-[#7DAF7B]" />
              Your CatStays URL
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <p className="text-sm" style={{ color: '#6b7a6d' }}>
              Every cattery gets a free subdomain on CatStays. This is your public website address — share it with customers straight away.
            </p>

            {subdomainUrl ? (
              <div className="flex items-center gap-3 p-4 bg-[#F8F7F5] rounded-xl">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1" style={{ color: '#6b7a6d' }}>Your subdomain</p>
                  <p className="font-mono text-lg font-semibold" style={{ color: '#2d3e2f' }}>
                    https://{subdomainUrl}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copySubdomain}
                    className="border-[#7DAF7B] text-[#2d3e2f]"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-[#7DAF7B]" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://${subdomainUrl}`, '_blank')}
                    className="border-[#7DAF7B] text-[#2d3e2f]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 mb-1">Slug not set</p>
                    <p className="text-sm text-amber-800">
                      Set a slug for your cattery in{' '}
                      <Link to="/admin/settings" className="underline font-medium">Settings</Link>
                      {' '}to get your free subdomain URL.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-900">
                <strong>DNS setup for *.catstays.app:</strong> Add a wildcard CNAME in Cloudflare:{' '}
                <code className="font-mono bg-blue-100 px-1 rounded">* → catstays.app</code>{' '}
                pointing to your Replit deployment domain.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Custom Domain */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-serif flex items-center gap-2" style={{ color: '#2d3e2f' }}>
                <Link2 className="w-5 h-5 text-[#C46A3A]" />
                Custom Domain
              </CardTitle>
              <Badge className={savedDomain ? 'bg-[#7DAF7B] hover:bg-[#7DAF7B]' : 'bg-gray-200 text-gray-700 hover:bg-gray-200'}>
                {savedDomain
                  ? (verifyResult?.verified ? 'Verified' : 'Saved')
                  : 'Not configured'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-5">
            <p className="text-sm" style={{ color: '#6b7a6d' }}>
              Point your own domain (e.g. <code className="font-mono bg-[#F0EEE9] px-1 rounded">www.delorainecattery.co.nz</code>) to your CatStays website. Available on paid plans.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: '#2d3e2f' }}>
                Your domain
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDomain}
                  onChange={e => setCustomDomain(e.target.value)}
                  placeholder="www.yourdomain.co.nz"
                  className="flex-1 px-4 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7DAF7B]"
                  style={{ borderColor: '#d1d5db' }}
                />
                <Button
                  onClick={handleSaveDomain}
                  disabled={saving || !customDomain.trim() || customDomain.trim() === savedDomain}
                  className="bg-[#2d3e2f] hover:bg-[#1a2b1c] text-white"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
                {savedDomain && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveDomain}
                    disabled={removing}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Remove'}
                  </Button>
                )}
              </div>
              {saveError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {saveError}
                </p>
              )}
              {saveSuccess && (
                <p className="text-sm text-green-700 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Domain saved.
                </p>
              )}
            </div>

            {/* CNAME instructions */}
            <div className="p-4 bg-[#F8F7F5] rounded-xl space-y-3">
              <p className="text-sm font-semibold" style={{ color: '#2d3e2f' }}>
                How to connect your domain:
              </p>
              <ol className="space-y-2 text-sm" style={{ color: '#5c6b5e' }}>
                <li className="flex gap-2">
                  <span className="font-bold text-[#C46A3A] flex-shrink-0">1.</span>
                  Log into your domain registrar or DNS provider (e.g. Cloudflare, GoDaddy, Namecheap)
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-[#C46A3A] flex-shrink-0">2.</span>
                  <span>
                    Add a <strong>CNAME record</strong>:
                    <div className="mt-1 font-mono bg-white border rounded p-2 text-xs space-y-1">
                      <div><span className="text-gray-500">Name:</span> <span className="text-[#2d3e2f]">www</span></div>
                      <div><span className="text-gray-500">Target:</span> <span className="text-[#2d3e2f]">{ROOT_DOMAIN}</span></div>
                      <div><span className="text-gray-500">TTL:</span> <span className="text-[#2d3e2f]">Auto</span></div>
                    </div>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-[#C46A3A] flex-shrink-0">3.</span>
                  Save the domain above and click Verify below (DNS changes can take up to 24 hours)
                </li>
              </ol>
            </div>

            {/* Verify button */}
            {(savedDomain || customDomain.trim()) && (
              <div className="space-y-3">
                <Button
                  onClick={handleVerify}
                  disabled={verifying}
                  variant="outline"
                  className="border-[#7DAF7B] text-[#2d3e2f]"
                >
                  {verifying ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Checking DNS…</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" />Verify Domain</>
                  )}
                </Button>

                {verifyResult && (
                  <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                    verifyResult.verified
                      ? 'bg-green-50 border-green-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    {verifyResult.verified
                      ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      : <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    }
                    <div>
                      <p className={`font-semibold text-sm mb-0.5 ${verifyResult.verified ? 'text-green-900' : 'text-amber-900'}`}>
                        {verifyResult.verified ? 'Domain verified!' : 'Not yet pointing to CatStays'}
                      </p>
                      <p className={`text-sm ${verifyResult.verified ? 'text-green-800' : 'text-amber-800'}`}>
                        {verifyResult.message}
                      </p>
                      {verifyResult.resolvedTo && (
                        <p className="text-xs mt-1 font-mono" style={{ color: '#6b7a6d' }}>
                          Resolves to: {verifyResult.resolvedTo}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
