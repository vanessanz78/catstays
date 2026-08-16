import { useEffect, useMemo, useState } from 'react';
import { InlineWebsiteEditor } from '../../components/InlineWebsiteEditor';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { useTenantCattery } from '@/hooks/useTenantCattery';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';
import type { TenantCattery } from '@/types/cattery';

const fallbackWebsiteData = {
  businessName: 'Purrfect Haven Cattery',
  location: 'Auckland, New Zealand',
  subdomain: 'purrfecthaven',
  primaryColor: '#0A1128',
  accentColor: '#C46A3A',
  backgroundColor: '#F8F7F5',
  heroHeading: 'Premium Cat Boarding in Auckland',
  heroSubheading: 'Luxurious suites, daily updates, and personalized care for your feline family',
  aboutText: 'Welcome to our boutique cattery, where your cats enjoy spacious suites, daily photo updates, and loving attention.',
  phone: '021 123 4567',
  email: 'hello@purrfecthaven.catstays.nz',
  address: '123 Cat Street, Auckland',
  pricePerNight: '45',
  heroImage: '',
  headingFont: 'Playfair Display',
  subheadingFont: 'Inter',
  selectedTemplate: 'modern',
};

function getLocalDraftFallback() {
  try {
    const saved = localStorage.getItem('catteryData');
    if (saved) return { ...fallbackWebsiteData, ...JSON.parse(saved) };
  } catch {
    localStorage.removeItem('catteryData');
  }
  return fallbackWebsiteData;
}

function editorDataFromCattery(cattery: TenantCattery) {
  const settings = cattery.website_settings ?? {};

  return {
    ...settings,
    businessName: settings.businessName || cattery.name,
    location: settings.location || cattery.city || '',
    subdomain: settings.subdomain || cattery.slug || '',
    phone: settings.phone || cattery.phone || '',
    email: settings.email || cattery.email || '',
    address: settings.address || cattery.address || '',
    selectedTemplate: settings.liveTemplate || settings.selectedTemplate || 'conversion-focus',
    liveTemplate: settings.liveTemplate || settings.selectedTemplate || 'conversion-focus',
  };
}

export function DashboardWebsiteEditor() {
  const { cattery, loading } = useTenantCattery();
  const { refreshCattery } = useAuth();
  const [data, setData] = useState<Record<string, any>>(getLocalDraftFallback);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadedWebsiteData = useMemo(() => (cattery ? editorDataFromCattery(cattery) : null), [cattery]);

  useEffect(() => {
    if (loadedWebsiteData) {
      setData(loadedWebsiteData);
    }
  }, [loadedWebsiteData]);

  const handleSave = async () => {
    setSaveError('');
    setIsSaving(true);

    try {
      localStorage.setItem('catteryData', JSON.stringify(data));

      if (!cattery) {
        alert('Website changes saved locally.');
        return;
      }

      const websiteSettings = {
        ...(cattery.website_settings ?? {}),
        ...data,
        businessName: data.businessName || cattery.name,
        location: data.location || cattery.city || '',
        subdomain: data.subdomain || cattery.slug || '',
        phone: data.phone || cattery.phone || '',
        email: data.email || cattery.email || '',
        address: data.address || cattery.address || '',
      };

      const { error } = await supabase
        .from('catteries')
        .update({
          name: data.businessName || cattery.name,
          phone: data.phone || cattery.phone,
          email: data.email || cattery.email,
          address: data.address || cattery.address,
          city: data.location || cattery.city,
          slug: data.subdomain || cattery.slug,
          website_settings: websiteSettings,
        })
        .eq('id', cattery.id);

      if (error) throw error;
      await refreshCattery();
      alert('Website changes saved successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Website changes could not be saved.';
      setSaveError(message);
      console.error('[WebsiteEditor] save failed', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen lg:flex" style={{ backgroundColor: '#F6F4EF' }}>
      <RightMenu mode="sidebar" />
      <div className="min-w-0 flex-1">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/staff-dashboard" className="p-2 hover:bg-[#F6F4EF] rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" style={{ color: '#2d3e2f' }} />
            </Link>
            <div>
              <h1 className="text-xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                Website Editor
              </h1>
              <p className="text-sm" style={{ color: '#6b7a6d' }}>
                Customize your public website
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="lg:hidden">
              <RightMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full">
        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#C46A3A' }} />
          </div>
        ) : (
          <InlineWebsiteEditor
            data={data}
            setData={setData}
            onSave={handleSave}
            onBack={() => window.history.back()}
            isSaving={isSaving}
            saveError={saveError}
          />
        )}
      </div>
      </div>
    </div>
  );
}
