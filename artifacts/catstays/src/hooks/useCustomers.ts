import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomerWithCats {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  cats: {
    id: string;
    name: string;
    breed: string | null;
    age: string | null;
  }[];
  customer_credit_ledger: {
    amount: number | string;
  }[];
  booking_count?: number;
}

export type MergeCustomersInput = {
  primaryCustomerId: string;
  secondaryCustomerId: string;
  profile: Pick<CustomerWithCats, 'name' | 'email' | 'phone' | 'address' | 'notes'>;
  keepPortalFrom: 'primary' | 'secondary';
};

export type DeleteEmptyCustomerInput = {
  customerId: string;
  reason: string;
};

export function useCustomers() {
  const { cattery } = useAuth();
  const [customers, setCustomers] = useState<CustomerWithCats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    if (!cattery?.id) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        cats(id, name, breed, age),
        customer_credit_ledger(amount)
      `)
      .eq('cattery_id', cattery.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setCustomers((data as unknown as CustomerWithCats[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [cattery?.id]);

  const createCustomer = async (customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) => {
    if (!cattery?.id) return { error: 'No cattery found' };

    const { data, error } = await supabase
      .from('customers')
      .insert({ ...customer, cattery_id: cattery.id })
      .select()
      .single();

    if (!error) await fetchCustomers();
    return { data, error };
  };

  const updateCustomer = async (id: string, updates: Partial<CustomerWithCats>) => {
    if (!cattery?.id) return { error: 'No cattery found' };

    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .eq('cattery_id', cattery.id);
    if (!error) await fetchCustomers();
    return { error };
  };

  const addCat = async (customerId: string, cat: {
    name: string;
    breed?: string;
    age?: string;
    medical_notes?: string;
    dietary_requirements?: string;
  }) => {
    if (!cattery?.id) return { error: 'No cattery found' };

    const { data, error } = await supabase
      .from('cats')
      .insert({ ...cat, customer_id: customerId, cattery_id: cattery.id })
      .select()
      .single();

    if (!error) await fetchCustomers();
    return { data, error };
  };

  const mergeCustomers = async ({
    primaryCustomerId,
    secondaryCustomerId,
    profile,
    keepPortalFrom,
  }: MergeCustomersInput) => {
    if (!cattery?.id) return { data: null, error: 'No cattery found' };

    const { data, error } = await supabase.rpc('catstays_merge_customers', {
      primary_customer_id: primaryCustomerId,
      secondary_customer_id: secondaryCustomerId,
      merged_profile: profile,
      keep_portal_from: keepPortalFrom,
    });

    if (!error) await fetchCustomers();
    return { data, error };
  };

  const deleteEmptyCustomer = async ({ customerId, reason }: DeleteEmptyCustomerInput) => {
    if (!cattery?.id) return { data: null, error: 'No cattery found' };

    const { data, error } = await supabase.rpc('catstays_delete_empty_customer', {
      target_customer_id: customerId,
      deletion_reason: reason.trim(),
    });

    if (!error) await fetchCustomers();
    return { data, error };
  };

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    addCat,
    mergeCustomers,
    deleteEmptyCustomer,
    refetch: fetchCustomers,
  };
}
