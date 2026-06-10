import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/utils/supabase/client';
import type { TenantCattery, TenantRoom } from '@/types/cattery';

const ROOT_DOMAIN = 'catstays.app';

interface SubdomainState {
  cattery: TenantCattery | null;
  rooms: TenantRoom[];
  loading: boolean;
  slug: string | null;
  customDomain: string | null;
}

const SubdomainContext = createContext<SubdomainState>({
  cattery: null,
  rooms: [],
  loading: false,
  slug: null,
  customDomain: null,
});

export function useSubdomainCattery() {
  return useContext(SubdomainContext);
}

export function detectSubdomainSlug(): string | null {
  const hostname = window.location.hostname;
  if (!hostname) return null;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return null;
  if (hostname.includes('replit.dev') || hostname.includes('replit.app') || hostname.includes('kirk.replit')) return null;
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) return null;
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = hostname.slice(0, -(ROOT_DOMAIN.length + 1));
    return slug && slug !== 'www' ? slug : null;
  }
  return null;
}

export function detectCustomDomain(): string | null {
  const hostname = window.location.hostname;
  if (!hostname) return null;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return null;
  if (hostname.includes('replit.dev') || hostname.includes('replit.app') || hostname.includes('kirk.replit')) return null;
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) return null;
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) return null;
  return hostname;
}

export function isSubdomainOrCustomDomain(): boolean {
  return !!(detectSubdomainSlug() || detectCustomDomain());
}

export function SubdomainProvider({ children }: { children: ReactNode }) {
  const slug = detectSubdomainSlug();
  const customDomain = detectCustomDomain();

  const [cattery, setCattery] = useState<TenantCattery | null>(null);
  const [rooms, setRooms] = useState<TenantRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug && !customDomain) {
      setLoading(false);
      return;
    }

    const fetchCattery = async () => {
      setLoading(true);

      let catteryData: TenantCattery | null = null;

      if (slug) {
        const { data } = await supabase
          .from('catteries')
          .select('id, name, slug, email, phone, address, city, logo_url, website_settings, custom_domain, payment_settings')
          .eq('slug', slug)
          .single();
        catteryData = data as TenantCattery | null;
      } else if (customDomain) {
        const { data } = await supabase
          .from('catteries')
          .select('id, name, slug, email, phone, address, city, logo_url, website_settings, custom_domain, payment_settings')
          .eq('custom_domain', customDomain)
          .single();
        catteryData = data as TenantCattery | null;
      }

      if (catteryData) {
        setCattery(catteryData);
        const { data: roomData } = await supabase
          .from('rooms')
          .select('id, name, type, description, price_per_night, capacity, amenities, is_active')
          .eq('cattery_id', catteryData.id)
          .eq('is_active', true)
          .order('price_per_night', { ascending: true });
        setRooms((roomData as TenantRoom[]) || []);
      }

      setLoading(false);
    };

    fetchCattery();
  }, [slug, customDomain]);

  return (
    <SubdomainContext.Provider value={{ cattery, rooms, loading, slug, customDomain }}>
      {children}
    </SubdomainContext.Provider>
  );
}
