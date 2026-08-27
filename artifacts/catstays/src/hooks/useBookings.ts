import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BookingWithDetails {
  id: string;
  check_in: string;
  check_out: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  payment_status: string;
  total_amount: number | null;
  notes: string | null;
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  cat_names: string | null;
  number_of_cats: number | null;
  room_arrangement: 'shared' | 'separate';
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
  booking_cat_rooms: {
    cat: {
      id: string;
      name: string;
    };
    room: {
      id: string;
      name: string;
      type: string;
      price_per_night: number;
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
        booking_cats(cat:cats(id, name, breed)),
        booking_cat_rooms(
          cat:cats(id, name),
          room:rooms(id, name, type, price_per_night)
        )
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
    check_in_time: string;
    check_out_time: string;
    total_amount: number;
    payment_status?: string;
    status?: string;
    room_arrangement?: 'shared' | 'separate';
    notes?: string;
    cat_ids?: string[];
    room_assignments?: Array<{ cat_id: string; room_id: string }>;
  }) => {
    if (!cattery?.id) return { error: 'No cattery found' };

    const { cat_ids = [], room_assignments = [], ...bookingRow } = booking;

    const { data, error } = await supabase
      .from('bookings')
      .insert({ ...bookingRow, cattery_id: cattery.id })
      .select()
      .single();

    if (!error && data && cat_ids.length > 0) {
      const { error: catsError } = await supabase
        .from('booking_cats')
        .insert(cat_ids.map((cat_id) => ({ booking_id: data.id, cat_id })));
      if (catsError) {
        await supabase.from('bookings').delete().eq('id', data.id);
        return { data: null, error: catsError };
      }
    }

    if (!error && data && room_assignments.length > 0) {
      const { error: roomsError } = await supabase
        .from('booking_cat_rooms')
        .insert(room_assignments.map((assignment) => ({
          booking_id: data.id,
          cat_id: assignment.cat_id,
          room_id: assignment.room_id,
        })));
      if (roomsError) {
        await supabase.from('bookings').delete().eq('id', data.id);
        return { data: null, error: roomsError };
      }
    }

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
