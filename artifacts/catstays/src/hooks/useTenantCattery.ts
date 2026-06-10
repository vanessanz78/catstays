import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubdomainCattery } from '@/contexts/SubdomainContext';
import type { TenantCattery, TenantRoom } from '@/types/cattery';

export type { TenantCattery, TenantRoom };

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
