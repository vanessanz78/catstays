import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BookingWithDetails {
  id: string;
  check_in: string;
  check_out: string;
  status: string;
  payment_status: string;
  total_amount: number | null;
  notes: string | null;
  created_at: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  room: {
    id: string;
    name: string;
    type: string;
    price_per_night: number;
  } | null;
  booking_cats: {
    cat: {
      id: string;
      name: string;
      breed: string | null;
    };
  }[];
}

export function useBookings() {
  const { cattery } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!cattery?.id) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(id, name, email, phone),
        room:rooms(id, name, type, price_per_night),
        booking_cats(cat:cats(id, name, breed))
      `)
      .eq('cattery_id', cattery.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setBookings((data as unknown as BookingWithDetails[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [cattery?.id]);

  const createBooking = async (booking: {
    customer_id: string;
    room_id: string;
    check_in: string;
    check_out: string;
    total_amount: number;
    payment_status?: string;
    notes?: string;
  }) => {
    if (!cattery?.id) return { error: 'No cattery found' };

    const { data, error } = await supabase
      .from('bookings')
      .insert({ ...booking, cattery_id: cattery.id })
      .select()
      .single();

    if (!error) await fetchBookings();
    return { data, error };
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);
    if (!error) await fetchBookings();
    return { error };
  };

  const updatePaymentStatus = async (id: string, payment_status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status })
      .eq('id', id);
    if (!error) await fetchBookings();
    return { error };
  };

  return { bookings, loading, error, createBooking, updateBookingStatus, updatePaymentStatus, refetch: fetchBookings };
}
