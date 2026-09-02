import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { bookingRoomUnitKeys, roomUnitHasConflict } from '@/app/lib/roomInventory';
import { announceCatStaysBookingsChanged } from '@/app/lib/bookingAlerts';
import { fetchAllRows, fetchRowsByIds } from '@/app/lib/fetchAllRows';

export interface BookingWithDetails {
  id: string;
  external_source?: string | null;
  external_id?: string | null;
  legacy_reference?: string | null;
  legacy_customer_name?: string | null;
  legacy_pet_names?: string | null;
  legacy_run_name?: string | null;
  legacy_monies_received?: number | string | null;
  legacy_outstanding?: number | string | null;
  check_in: string;
  check_out: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  payment_status: string;
  total_amount: number | null;
  notes: string | null;
  customer_note_visible: boolean;
  cancellation_reason: string | null;
  cancellation_note: string | null;
  cancelled_at: string | null;
  cancellation_credit_amount: number;
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  cat_names: string | null;
  number_of_cats: number | null;
  room_arrangement: 'shared' | 'separate';
  room_unit_number: number | null;
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
    room_unit_number: number | null;
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
  booking_room_segments: {
    id: string;
    starts_on: string;
    ends_on: string;
    room_unit_number: number;
    cat: { id: string; name: string } | null;
    room: {
      id: string;
      name: string;
      type: string;
      price_per_night: number;
    };
  }[];
  booking_adjustments: { id: string; amount: number }[];
  payments: {
    id: string;
    amount: number;
    status: string;
    type: string;
    payment_method: string | null;
    paid_on: string | null;
  }[];
}

export function useBookings(_options?: { allPages?: boolean }) {
  const { cattery, user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestGeneration = useRef(0);
  const fetchBookings = async () => {
    const generation = ++requestGeneration.current;
    if (!cattery?.id) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error } = await fetchRowsByIds<BookingWithDetails>(
      () => fetchAllRows<{ id: string }>((from, to) => supabase
        .from('bookings')
        .select('id')
        .eq('cattery_id', cattery.id)
        .order('created_at', { ascending: false })
        .order('id')
        .range(from, to), {
          pageSize: 500, concurrency: 2,
          count: () => supabase.from('bookings')
            .select('id', { count: 'exact', head: true })
            .eq('cattery_id', cattery.id),
        }),
      (ids) => supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(id, name, email, phone),
        room:rooms(id, name, type, price_per_night),
        booking_cats(cat:cats(id, name, breed)),
        booking_cat_rooms(
          room_unit_number,
          cat:cats(id, name),
          room:rooms(id, name, type, price_per_night)
        ),
        booking_room_segments(
          id,
          starts_on,
          ends_on,
          room_unit_number,
          cat:cats(id, name),
          room:rooms(id, name, type, price_per_night)
        ),
        booking_adjustments(id, amount),
        payments(id, amount, status, type, payment_method, paid_on)
      `)
      .eq('cattery_id', cattery.id)
      .in('id', ids));

    if (generation !== requestGeneration.current) return;

    if (error) {
      setError(error.message);
    } else {
      setBookings((data as unknown as BookingWithDetails[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
    return () => { requestGeneration.current++; };
  }, [cattery?.id]);

  const createBooking = async (booking: {
    customer_id: string;
    room_id: string;
    room_unit_number: number;
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
    room_assignments?: Array<{ cat_id: string; room_id: string; room_unit_number: number }>;
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
          room_unit_number: assignment.room_unit_number,
        })));
      if (roomsError) {
        await supabase.from('bookings').delete().eq('id', data.id);
        return { data: null, error: roomsError };
      }
    }

    if (!error && data) {
      await supabase.from('booking_events').insert({
        cattery_id: cattery.id,
        booking_id: data.id,
        event_type: 'booking_created',
        summary: 'Booking created by staff',
        metadata: {},
        created_by: user?.id || null,
      });
      await fetchBookings();
      announceCatStaysBookingsChanged();
    }
    return { data, error };
  };

  const updateBookingStatus = async (id: string, status: string) => {
    if (!cattery?.id) return { error: 'No cattery found' };

    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .eq('cattery_id', cattery.id);
    if (!error) {
      await supabase.from('booking_events').insert({
        cattery_id: cattery.id,
        booking_id: id,
        event_type: 'status_changed',
        summary: `Booking status changed to ${status.replaceAll('_', ' ')}`,
        metadata: { status },
        created_by: user?.id || null,
      });
      await fetchBookings();
      announceCatStaysBookingsChanged();
    }
    return { error };
  };

  const updatePaymentStatus = async (id: string, payment_status: string) => {
    if (!cattery?.id) return { error: 'No cattery found' };

    const { error } = await supabase
      .from('bookings')
      .update({ payment_status })
      .eq('id', id)
      .eq('cattery_id', cattery.id);
    if (!error) await fetchBookings();
    return { error };
  };

  const cancelBooking = async (input: {
    id: string;
    reason: string;
    note?: string;
    customerCreditAmount?: number;
  }) => {
    const { data, error } = await supabase.rpc('catstays_cancel_booking', {
      target_booking_id: input.id,
      cancellation_reason: input.reason,
      cancellation_note: input.note?.trim() || null,
      customer_credit_amount: input.customerCreditAmount || 0,
    });
    if (!error) {
      await fetchBookings();
      announceCatStaysBookingsChanged();
    }
    return { data, error };
  };

  const deleteErroneousBooking = async (id: string, reason: string) => {
    const { data, error } = await supabase.rpc('catstays_delete_erroneous_booking', {
      target_booking_id: id,
      deletion_reason: reason.trim(),
    });
    if (!error) {
      await fetchBookings();
      announceCatStaysBookingsChanged();
    }
    return { data, error };
  };

  const moveBooking = async (
    id: string,
    move: { roomId: string; roomUnitNumber: number; checkIn: string; checkOut: string },
  ) => {
    if (!cattery?.id) return { error: 'No cattery found' };
    const booking = bookings.find((candidate) => candidate.id === id);
    if (!booking) return { error: 'Booking not found' };
    if (!move.checkIn || !move.checkOut || move.checkOut < move.checkIn) {
      return { error: 'Choose a valid arrival and departure date.' };
    }

    const assignedRoomUnits = bookingRoomUnitKeys(booking);
    if (booking.booking_room_segments.length > 0) {
      return { error: 'This is a split stay. Open the full booking to change its room plan.' };
    }
    if (assignedRoomUnits.length > 1) {
      return { error: 'This booking uses more than one room. Open the full booking to change its assignments.' };
    }

    const { data: targetRoom, error: roomError } = await supabase
      .from('rooms')
      .select('id, is_active, capacity, room_count')
      .eq('id', move.roomId)
      .eq('cattery_id', cattery.id)
      .maybeSingle();
    if (roomError || !targetRoom || !targetRoom.is_active) {
      return { error: roomError || 'That room is not available for bookings.' };
    }
    if (
      !Number.isInteger(move.roomUnitNumber)
      || move.roomUnitNumber < 1
      || move.roomUnitNumber > Math.max(1, Number(targetRoom.room_count) || 1)
    ) {
      return { error: 'That physical room number is outside the configured inventory.' };
    }
    const catCount = Math.max(
      booking.booking_cats?.length || 0,
      booking.booking_cat_rooms?.length || 0,
      booking.number_of_cats || 0,
      1,
    );
    if (targetRoom.capacity < catCount) {
      return { error: `That room can hold ${targetRoom.capacity} cat${targetRoom.capacity === 1 ? '' : 's'}, but this booking has ${catCount}.` };
    }

    const { data: overlappingBookings, error: overlapError } = await supabase
      .from('bookings')
      .select(`
        id,
        room_id,
        room_unit_number,
        check_in,
        check_out,
        status,
        booking_cat_rooms(room_id, room_unit_number),
        booking_room_segments(room_id, room_unit_number, starts_on, ends_on)
      `)
      .eq('cattery_id', cattery.id)
      .neq('id', id)
      .neq('status', 'cancelled')
      .lte('check_in', move.checkOut)
      .gte('check_out', move.checkIn);
    if (overlapError) return { error: overlapError };

    const roomConflict = (overlappingBookings || []).some((candidate: any) => {
      const splitSegments = candidate.booking_room_segments || [];
      if (splitSegments.length > 0) {
        return splitSegments.some((segment: any) => (
          segment.room_id === move.roomId
          && segment.room_unit_number === move.roomUnitNumber
          && segment.starts_on <= move.checkOut
          && segment.ends_on >= move.checkIn
        ));
      }
      return (
        (candidate.room_id === move.roomId && candidate.room_unit_number === move.roomUnitNumber)
        || (candidate.booking_cat_rooms || []).some((assignment: any) => (
          assignment.room_id === move.roomId && assignment.room_unit_number === move.roomUnitNumber
        ))
      );
    });
    if (roomConflict) return { error: 'That room is already booked for one or more of the selected days.' };

    const previousBooking = {
      room_id: booking.room?.id || null,
      room_unit_number: booking.room_unit_number,
      check_in: booking.check_in,
      check_out: booking.check_out,
    };
    const { data: updatedRows, error: bookingError } = await supabase
      .from('bookings')
      .update({
        room_id: move.roomId,
        room_unit_number: move.roomUnitNumber,
        check_in: move.checkIn,
        check_out: move.checkOut,
      })
      .eq('id', id)
      .eq('cattery_id', cattery.id)
      .select('id');
    if (bookingError || !updatedRows?.length) {
      return { error: bookingError || 'The booking could not be updated.' };
    }

    const { error: assignmentError } = await supabase
      .from('booking_cat_rooms')
      .update({ room_id: move.roomId, room_unit_number: move.roomUnitNumber })
      .eq('booking_id', id);
    if (assignmentError) {
      const { error: rollbackError } = await supabase
        .from('bookings')
        .update(previousBooking)
        .eq('id', id)
        .eq('cattery_id', cattery.id);
      return {
        error: rollbackError
          ? 'The room assignment failed and the original dates could not be restored. Open the booking before making another change.'
          : assignmentError,
      };
    }

    await supabase.from('booking_events').insert({
      cattery_id: cattery.id,
      booking_id: id,
      event_type: 'room_moved',
      summary: 'Booking room or dates changed on the calendar',
      metadata: move,
      created_by: user?.id || null,
    });
    await fetchBookings();
    return { error: null };
  };

  const splitBooking = async (id: string, segments: Array<{
    cat_id?: string | null;
    room_id: string;
    room_unit_number: number;
    starts_on: string;
    ends_on: string;
  }>) => {
    if (!cattery?.id) return { error: 'No cattery found' };
    const booking = bookings.find((candidate) => candidate.id === id);
    if (!booking) return { error: 'Booking not found' };
    if (segments.length < 2) return { error: 'A split stay needs at least two room sections.' };

    for (const segment of segments) {
      if (segment.starts_on < booking.check_in || segment.ends_on > booking.check_out || segment.ends_on < segment.starts_on) {
        return { error: 'Each room section must stay inside the booking dates.' };
      }
      const overlap = roomUnitHasConflict(
        bookings,
        segment.room_id,
        segment.room_unit_number,
        segment.starts_on,
        segment.ends_on,
        id,
      );
      if (overlap) return { error: 'One of those rooms is already booked during the selected dates.' };
    }

    const { error } = await supabase.rpc('catstays_replace_booking_room_segments', {
      target_booking_id: id,
      new_segments: segments,
    });
    if (!error) await fetchBookings();
    return { error };
  };

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBookingStatus,
    updatePaymentStatus,
    cancelBooking,
    deleteErroneousBooking,
    moveBooking,
    splitBooking,
    refetch: fetchBookings,
  };
}
