import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomerWithCats {
  id: string;
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
  booking_count?: number;
}

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
        cats(id, name, breed, age)
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
    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id);
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

  return { customers, loading, error, createCustomer, updateCustomer, addCat, refetch: fetchCustomers };
}
