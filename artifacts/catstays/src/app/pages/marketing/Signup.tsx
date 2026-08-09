import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { PREVIEW_SOURCE_TOKEN_STORAGE_KEY } from '../../lib/deloraineDemo';

const logoIcon = '/assets/b463d12091f20e48be52186dedd2a0f6707d0b66.png';
const logoText = '/assets/9900b394e20a5e059447324d58daad1b1bf43ed6.png';

const signupImportStateKeys = [
  'businessName',
  'location',
  'websiteUrl',
  'importSourceUrl',
  'sourceUrl',
  'sourceHost',
  'selectedTemplate',
  'liveTemplate',
  'previewImportRecordId',
  'contentSourceId',
  'contentSourceHash',
  'contentSourceImportVersion',
  'previewRecordStatus',
  'previewSourceId',
  'previewSourceToken',
  'previewSourceExpiresAt',
  'importComplete',
  'primaryColor',
  'accentColor',
  'backgroundColor',
  'typography',
  'headingFont',
  'subheadingFont',
  'bodyFont',
  'logo',
  'logoImage',
  'heroImage',
  'heroHeading',
  'heroSubheading',
  'heroPrimaryCtaText',
  'heroPrimaryCtaHref',
  'heroSecondaryCtaText',
  'heroSecondaryCtaHref',
  'aboutText',
  'aboutHeading',
  'aboutImage',
  'whyChooseUsData',
  'whyChooseUsHeading',
  'whyChooseUsText',
  'whyChooseUsFeatures',
  'facilitiesData',
  'facilitiesHeading',
  'facilitiesText',
  'facilitiesImage',
  'facilityFeatures',
  'suitesData',
  'suitesHeading',
  'suites',
  'servicesData',
  'additionalServicesHeading',
  'additionalServices',
  'galleryData',
  'galleryHeading',
  'galleryImages',
  'testimonialsData',
  'testimonialsHeading',
  'testimonials',
  'faqData',
  'faqHeading',
  'faqs',
  'commitmentData',
  'ownerData',
  'locationData',
  'contactData',
  'socialLinks',
  'virtualTourUrl',
  'footerAbout',
  'siteContentLibrary',
  'contentLibrary',
  'sectionsOrder',
] as const;

function readSavedOnboardingData(): Record<string, any> {
  try {
    const saved = localStorage.getItem('catstays_onboarding');
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return parsed?.data && typeof parsed.data === 'object' && !Array.isArray(parsed.data)
      ? parsed.data
      : {};
  } catch {
    return {};
  }
}

function compactSignupImportState(data: Record<string, any>) {
  return signupImportStateKeys.reduce<Record<string, any>>((state, key) => {
    if (data[key] !== undefined) state[key] = data[key];
    return state;
  }, {});
}

function readPreviewSourceToken() {
  return localStorage.getItem(PREVIEW_SOURCE_TOKEN_STORAGE_KEY) ||
    sessionStorage.getItem(PREVIEW_SOURCE_TOKEN_STORAGE_KEY) ||
    '';
}

function clearPreviewSourceToken() {
  localStorage.removeItem(PREVIEW_SOURCE_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(PREVIEW_SOURCE_TOKEN_STORAGE_KEY);
}

export function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedData = readSavedOnboardingData();
    setFormData((current) => ({
      ...current,
      businessName: typeof savedData.businessName === 'string' ? savedData.businessName : current.businessName,
      ownerName: typeof savedData.name === 'string' ? savedData.name : current.ownerName,
      email: typeof savedData.email === 'string' ? savedData.email : current.email,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    const savedOnboardingData = compactSignupImportState(readSavedOnboardingData());
    const onboardingData: Record<string, any> = {
      ...savedOnboardingData,
      previewSourceToken: savedOnboardingData.previewSourceToken || readPreviewSourceToken(),
      businessName: formData.businessName.trim() || savedOnboardingData.businessName,
      name: formData.ownerName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      emailConfirmed: false,
      liveTemplate: savedOnboardingData.liveTemplate || savedOnboardingData.selectedTemplate,
    };

    try {
      const response = await fetch('/api/cattery/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: onboardingData, plan: 'professional' }),
      });

      const rawPayload = await response.text();
      let payload: {
        error?: string;
        catteryId?: string;
        onboardingDraftToken?: string;
        slug?: string;
        contentSourceId?: string | null;
      } = {};

      try {
        payload = rawPayload ? JSON.parse(rawPayload) : {};
      } catch {
        payload = {};
      }

      if (!response.ok) {
        const fallbackMessage = rawPayload && rawPayload.length < 200 && !rawPayload.trim().startsWith('<')
          ? rawPayload
          : `Failed to create account (${response.status})`;
        setError(payload.error || fallbackMessage);
        setIsLoading(false);
        return;
      }

      const savedData: Record<string, any> = {
        ...onboardingData,
        password: '',
        provisionedCatteryId: payload.catteryId || '',
        onboardingDraftToken: payload.onboardingDraftToken || '',
        subdomain: payload.slug || '',
        contentSourceId: payload.contentSourceId || onboardingData.contentSourceId || '',
        previewImportRecordId: payload.contentSourceId || onboardingData.previewImportRecordId || '',
      };
      if (payload.contentSourceId) clearPreviewSourceToken();

      localStorage.setItem('catstays_account', JSON.stringify({
        name: savedData.name,
        email: savedData.email,
        businessName: savedData.businessName,
        catteryId: savedData.provisionedCatteryId,
        slug: savedData.subdomain,
        createdAt: new Date().toISOString(),
        emailConfirmed: false,
        status: 'confirmation_sent',
      }));
      localStorage.setItem('catstays_onboarding', JSON.stringify({
        step: 2,
        data: savedData,
        accountCreated: true,
      }));

      navigate('/onboarding');
    } catch {
      setError('The signup service is not available in this preview. Please restart the preview and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#0A1128]/10">
        <CardHeader className="text-center">
          <Link to="/" className="flex flex-col items-center gap-3 mb-4">
            <img src={logoIcon} alt="CatStays" className="h-14 w-14" />
            <img src={logoText} alt="CatStays" className="h-10" />
          </Link>
          <CardTitle className="text-2xl font-serif text-[#0A1128]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Start your free trial
          </CardTitle>
          <CardDescription className="text-[#0A1128]/60">
            No credit card required · 14 days free
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Deloraine Cattery"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Your Name</Label>
              <Input
                id="ownerName"
                placeholder="Vanessa Smith"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C46A3A] hover:bg-[#B55A2A] text-white py-3 rounded-full text-base font-medium"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account…</>
              ) : (
                <>Start Free Trial <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </Button>

            <p className="text-center text-sm text-[#0A1128]/60">
              Already have an account?{' '}
              <Link to="/login" className="text-[#C46A3A] hover:underline font-medium">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
