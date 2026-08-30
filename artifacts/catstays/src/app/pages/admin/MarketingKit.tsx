import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/hooks/useRooms';
import { supabase } from '@/utils/supabase/client';
import { MarketingStudio, type MarketingPromotion } from '../../components/MarketingStudio';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { Card, CardContent } from '../../components/ui/card';

function asObject(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, any>
    : {};
}

export function MarketingKit() {
  const { cattery } = useAuth();
  const { rooms, loading: roomsLoading } = useRooms();
  const [promotions, setPromotions] = useState<MarketingPromotion[]>([]);
  const [promotionsLoading, setPromotionsLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!cattery?.id) {
      setPromotions([]);
      setPromotionsLoading(false);
      return;
    }
    setPromotionsLoading(true);
    void supabase
      .from('cattery_promotions')
      .select('id,name,code,discount_type,discount_value,terms,status')
      .eq('cattery_id', cattery.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setPromotions([]);
          setNotice({ tone: 'error', text: `Saved promotions could not be loaded. ${error.message}` });
        } else {
          setPromotions((data || []).map((promotion) => ({
            id: promotion.id,
            name: promotion.name,
            code: promotion.code,
            detail: promotion.terms || (promotion.discount_type === 'percentage'
              ? `${Number(promotion.discount_value)}% off eligible stays.`
              : `$${Number(promotion.discount_value).toFixed(2)} off eligible stays.`),
            cta: 'Book Now',
          })));
        }
        setPromotionsLoading(false);
      });
  }, [cattery?.id]);

  const businessData = useMemo(() => {
    const settings = asObject(cattery?.website_settings);
    const location = settings.location || cattery?.city || cattery?.address || '';
    const galleryImages = settings.galleryImages || settings.gallery || [];
    return {
      catteryId: cattery?.id || 'preview',
      businessName: cattery?.name || 'Your cattery',
      location,
      subdomain: cattery?.slug || '',
      primaryColor: settings.primaryColor || '#0A1128',
      accentColor: settings.accentColor || '#C46A3A',
      backgroundColor: settings.backgroundColor || '#F8F7F5',
      heroHeading: settings.heroTitle || settings.heroHeading || cattery?.name || 'Now Taking Bookings',
      heroSubheading: settings.heroSubtitle || settings.heroSubheading || 'Calm, comfortable care for your cat',
      aboutText: settings.aboutText || '',
      phone: cattery?.phone || '',
      email: cattery?.email || '',
      address: cattery?.address || '',
      heroImage: settings.heroImage || settings.heroImageUrl || '',
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      headingFont: settings.headingFont || '',
      subheadingFont: settings.subheadingFont || '',
      roomTypes: rooms.map((room) => ({
        name: room.name,
        numberOfRooms: '1',
        maxCatsPerRoom: String(room.capacity),
      })),
    };
  }, [cattery, rooms]);

  const loading = !cattery || roomsLoading || promotionsLoading;

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#0A1128] lg:flex">
      <RightMenu mode="sidebar" />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-[#E8DED4] bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-[1680px] items-center justify-between px-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="lg:hidden"><RightMenu /></div>
              <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Staff dashboard</p><h1 className="truncate text-xl font-semibold">{cattery?.name || 'Your cattery'}</h1></div>
            </div>
            <NotificationBell />
          </div>
        </header>

        <main className="mx-auto max-w-[1680px] space-y-5 px-4 py-6 pb-24">
          {notice && <div role="status" className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${notice.tone === 'success' ? 'border-[#7DAF7B] bg-[#EDF6EC] text-[#2D5830]' : 'border-red-200 bg-red-50 text-red-700'}`}>{notice.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}<p>{notice.text}</p></div>}
          {loading ? (
            <Card className="border-[#E8DED4] bg-white"><CardContent className="flex items-center justify-center gap-3 p-12 text-[#4E5871]"><Loader2 className="h-5 w-5 animate-spin" />Loading this cattery’s brand, photos, rooms, and promotions…</CardContent></Card>
          ) : (
            <MarketingStudio businessData={businessData} promotions={promotions} />
          )}
        </main>
      </div>
    </div>
  );
}
