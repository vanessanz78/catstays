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
    description: 'A quiet private room with soft bedding, daily playtime, and photo updates.',
    price_per_night: 35,
    capacity: 1,
    amenities: ['Private room', 'Daily care notes', 'Photo updates'],
    is_active: true
  },
  {
    id: 'demo-premium-suite',
    name: 'Sunny Window Suite',
    type: 'suite',
    description: 'Extra space, a sunny resting shelf, and more room for confident cats to stretch out.',
    price_per_night: 55,
    capacity: 2,
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
    amenities: ['Garden outlook', 'Premium bedding', 'Enrichment time'],
    is_active: true
  }
];

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

    const resolvedId = catteryId ?? authCattery?.id;
    if (!resolvedId) {
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

      if (catteryId) {
        const { data, error: fetchError } = await supabase
          .from('catteries')
          .select('id, name, slug, email, phone, address, city, logo_url, website_settings, custom_domain, payment_settings')
          .eq('id', catteryId)
          .single();
        if (fetchError || !data) {
          setError('Cattery not found');
          setLoading(false);
          return;
        }
        setCattery(data as TenantCattery);
      } else if (authCattery) {
        setCattery(authCattery as unknown as TenantCattery);
      }

      const { data: roomData } = await supabase
        .from('rooms')
        .select('id, name, type, description, price_per_night, capacity, amenities, is_active')
        .eq('cattery_id', resolvedId)
        .eq('is_active', true)
        .order('price_per_night', { ascending: true });

      setRooms((roomData as TenantRoom[]) || []);
      setLoading(false);
    };

    fetchData();
  }, [catteryId, authCattery?.id, authLoading, useSubdomainData, subdomainCtx.cattery, subdomainCtx.rooms, subdomainCtx.loading]);

  return { cattery, rooms, loading, error };
}
