import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubdomainCattery } from '@/contexts/SubdomainContext';
import type { TenantCattery, TenantRoom } from '@/types/cattery';

export type { TenantCattery, TenantRoom };

const demoCattery: TenantCattery = {
  id: 'demo-deloraine',
  name: 'Deloraine Cattery',
  slug: 'deloraine-cattery',
  email: 'hello@delorainecattery.com',
  phone: '+61 3 6362 0000',
  address: 'Deloraine, Tasmania',
  city: 'Deloraine',
  logo_url: null,
  custom_domain: 'delorainecattery.com',
  website_settings: {
    primaryColor: '#0A1128',
    accentColor: '#A85A30',
    heroTitle: 'Deloraine Cattery',
    heroSubtitle: 'A calm, comfortable stay for cats in the heart of Deloraine.',
    aboutHeading: 'A peaceful home away from home',
    aboutText: 'Warm rooms, careful routines, and gentle updates help every guest settle in beautifully.',
    heroImage: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  payment_settings: {}
};

const demoRooms: TenantRoom[] = [
  {
    id: 'demo-standard-suite',
    name: 'Garden Suite',
    type: 'suite',
    description: 'A quiet private room with soft bedding, daily playtime, and individual care.',
    price_per_night: 35,
    capacity: 1,
    room_count: 1,
    amenities: ['Private room', 'Daily care notes', 'Individual care'],
    is_active: true
  },
  {
    id: 'demo-premium-suite',
    name: 'Sunny Window Suite',
    type: 'suite',
    description: 'Extra space, a sunny resting shelf, and more room for confident cats to stretch out.',
    price_per_night: 55,
    capacity: 2,
    room_count: 1,
    amenities: ['Sunny shelf', 'Extra space', 'Two cats from same family'],
    is_active: true
  },
  {
    id: 'demo-luxury-villa',
    name: 'Luxury Villa',
    type: 'villa',
    description: 'A premium suite with garden outlook, enriched play sessions, and extra comfort.',
    price_per_night: 85,
    capacity: 2,
    room_count: 1,
    amenities: ['Garden outlook', 'Premium bedding', 'Enrichment time'],
    is_active: true
  }
];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function fetchCatteryByRouteId(routeId: string) {
  const columns = 'id, name, slug, email, phone, address, city, logo_url, website_settings, custom_domain, payment_settings';

  if (UUID_PATTERN.test(routeId)) {
    return supabase
      .from('catteries')
      .select(columns)
      .eq('id', routeId)
      .maybeSingle();
  }

  const exact = await supabase
    .from('catteries')
    .select(columns)
    .eq('slug', routeId)
    .maybeSingle();

  if (exact.data || exact.error || !routeId.includes('-')) {
    return exact;
  }

  return supabase
    .from('catteries')
    .select(columns)
    .eq('slug', routeId.replace(/-/g, ''))
    .maybeSingle();
}

export function useTenantCattery(catteryId?: string) {
  const { cattery: authCattery, loading: authLoading } = useAuth();
  const subdomainCtx = useSubdomainCattery();
  const [cattery, setCattery] = useState<TenantCattery | null>(null);
  const [rooms, setRooms] = useState<TenantRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const useSubdomainData = !catteryId && !!subdomainCtx.cattery;

  useEffect(() => {
    if (useSubdomainData) {
      setCattery(subdomainCtx.cattery);
      setRooms(subdomainCtx.rooms);
      setLoading(subdomainCtx.loading);
      setError(null);
      return;
    }

    if (!catteryId && authLoading) return;

    const initialCatteryId = catteryId ?? authCattery?.id;
    if (!initialCatteryId) {
      const isLocalDemoSite = typeof window !== 'undefined' && window.location.pathname.startsWith('/site');
      if (isLocalDemoSite) {
        setCattery(demoCattery);
        setRooms(demoRooms);
        setError(null);
      }
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let resolvedCatteryId = authCattery?.id ?? '';

      if (catteryId) {
        const { data, error: fetchError } = await fetchCatteryByRouteId(catteryId);

        if (fetchError || !data) {
          setError('Cattery not found');
          setLoading(false);
          return;
        }
        const tenantCattery = data as TenantCattery;
        setCattery(tenantCattery);
        resolvedCatteryId = tenantCattery.id;
      } else if (authCattery) {
        setCattery(authCattery as unknown as TenantCattery);
        resolvedCatteryId = authCattery.id;
      }

      if (!resolvedCatteryId) {
        setRooms([]);
        setLoading(false);
        return;
      }

      const { data: roomData } = await supabase
        .from('rooms')
        .select('id, name, type, description, price_per_night, capacity, room_count, amenities, is_active')
        .eq('cattery_id', resolvedCatteryId)
        .eq('is_active', true)
        .order('price_per_night', { ascending: true });

      setRooms((roomData || []).map((room) => ({
        ...room,
        room_count: Math.max(1, Number(room.room_count) || 1),
      })) as TenantRoom[]);
      setLoading(false);
    };

    fetchData();
  }, [catteryId, authCattery?.id, authLoading, useSubdomainData, subdomainCtx.cattery, subdomainCtx.rooms, subdomainCtx.loading]);

  return { cattery, rooms, loading, error };
}
