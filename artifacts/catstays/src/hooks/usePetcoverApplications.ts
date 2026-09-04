import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { PetcoverDeclarations, PetcoverSex, PetcoverAcquisition } from '@/app/lib/petcover';

export type PetcoverApplicationStatus = 'ready_to_submit' | 'submitted' | 'active' | 'declined' | 'ineligible';

export type PetcoverApplication = {
  id: string;
  booking_id: string;
  customer_id: string;
  cat_id: string;
  cattery_id: string;
  offer_code: string;
  status: PetcoverApplicationStatus;
  eligibility_reason: string | null;
  cat_date_of_birth: string | null;
  cat_sex: PetcoverSex | null;
  acquisition_type: PetcoverAcquisition | null;
  purchase_price: number | string | null;
  microchip_number: string | null;
  declarations: PetcoverDeclarations;
  policy_number: string | null;
  policy_url: string | null;
  submitted_at: string | null;
  activated_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  booking: { id: string; check_in: string; check_out: string; status: string } | null;
  customer: { id: string; name: string; email: string; phone: string | null } | null;
  cat: { id: string; name: string; breed: string | null } | null;
};

export function usePetcoverApplications(enabled = true) {
  const { cattery } = useAuth();
  const [applications, setApplications] = useState<PetcoverApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!cattery?.id || !enabled) {
      setApplications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('petcover_applications')
      .select(`
        id, booking_id, customer_id, cat_id, cattery_id, offer_code, status,
        eligibility_reason, cat_date_of_birth, cat_sex, acquisition_type, purchase_price,
        microchip_number, declarations, policy_number, policy_url, submitted_at,
        activated_at, notes, created_at, updated_at,
        booking:bookings(id, check_in, check_out, status),
        customer:customers(id, name, email, phone),
        cat:cats(id, name, breed)
      `)
      .eq('cattery_id', cattery.id)
      .order('created_at', { ascending: false });
    if (queryError) setError(queryError.message);
    else {
      setError(null);
      setApplications((data || []).map((row: any) => ({
        ...row,
        booking: Array.isArray(row.booking) ? row.booking[0] || null : row.booking || null,
        customer: Array.isArray(row.customer) ? row.customer[0] || null : row.customer || null,
        cat: Array.isArray(row.cat) ? row.cat[0] || null : row.cat || null,
      })) as PetcoverApplication[]);
    }
    setLoading(false);
  }, [cattery?.id, enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const updateApplication = async (id: string, updates: Partial<Pick<PetcoverApplication, 'status' | 'policy_number' | 'policy_url' | 'notes'>>) => {
    if (!cattery?.id) return { error: new Error('No cattery found') };
    const payload = {
      ...updates,
      ...(updates.status === 'submitted' ? { submitted_at: new Date().toISOString() } : {}),
      ...(updates.status === 'active' ? { activated_at: new Date().toISOString() } : {}),
    };
    const { error: updateError } = await supabase
      .from('petcover_applications')
      .update(payload)
      .eq('id', id)
      .eq('cattery_id', cattery.id);
    if (!updateError) await refetch();
    return { error: updateError };
  };

  return { applications, loading, error, refetch, updateApplication };
}
