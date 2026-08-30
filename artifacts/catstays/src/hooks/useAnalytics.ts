import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';

export interface WeeklyStats {
  revenue: number;
  bookings: number;
  occupancyRate: number;
  avgStayLength: number;
}

export interface NextWeekOccupancy {
  booked: number;
  total: number;
  cats: number;
  percentage: number;
  status: 'low' | 'moderate' | 'high';
}

export interface OutstandingPayment {
  id: string;
  owner: string;
  cat: string;
  amount: number;
  arrivalDate: string;
  type: string;
}

export interface MonthlyStats {
  revenue: number;
  totalBookings: number;
  avgBookingValue: number;
  occupancyRate: number;
  monthName: string;
}

function bookingDate(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`);
}

function bookingCatCount(booking: any) {
  const linkedCats = booking.booking_cats?.length || 0;
  return linkedCats || Number(booking.number_of_cats) || 1;
}

function bookingAmount(booking: any) {
  const amount = Number(booking.total_amount);
  return Number.isFinite(amount) ? amount : 0;
}

function stayOverlaps(booking: any, rangeStart: Date, rangeEnd: Date) {
  return bookingDate(booking.check_in) <= rangeEnd && bookingDate(booking.check_out) >= rangeStart;
}

function inclusiveStayDays(booking: any) {
  const milliseconds = bookingDate(booking.check_out).getTime() - bookingDate(booking.check_in).getTime();
  return Math.max(1, Math.round(milliseconds / 86_400_000) + 1);
}

function occupiedCatDays(booking: any, rangeStart: Date, rangeEnd: Date) {
  const overlapStart = Math.max(bookingDate(booking.check_in).getTime(), rangeStart.getTime());
  const overlapEnd = Math.min(bookingDate(booking.check_out).getTime(), rangeEnd.getTime());
  if (overlapEnd < overlapStart) return 0;
  const days = Math.round((overlapEnd - overlapStart) / 86_400_000) + 1;
  return days * bookingCatCount(booking);
}

export function useAnalytics() {
  const { cattery, loading: authLoading } = useAuth();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({ revenue: 0, bookings: 0, occupancyRate: 0, avgStayLength: 0 });
  const [nextWeekOccupancy, setNextWeekOccupancy] = useState<NextWeekOccupancy>({ booked: 0, total: 0, cats: 0, percentage: 0, status: 'low' });
  const [outstandingPayments, setOutstandingPayments] = useState<OutstandingPayment[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({ revenue: 0, totalBookings: 0, avgBookingValue: 0, occupancyRate: 0, monthName: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve
    if (!cattery?.id) {
      setLoading(false);
      return;
    }
    void fetchAnalytics();
  }, [cattery?.id, authLoading]);

  const fetchAnalytics = async () => {
    if (!cattery?.id) return;
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const nextWeekStart = new Date(weekEnd.getTime() + 1);
      const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const [bookingsResult, roomsResult] = await Promise.all([
        supabase
          .from('bookings')
          .select(`
            id, check_in, check_out, status, payment_status, total_amount, notes, number_of_cats,
            customer:customers(id, name),
            booking_cats(cat:cats(name))
          `)
          .eq('cattery_id', cattery.id)
          .order('check_in', { ascending: false }),
        supabase
          .from('rooms')
          .select('id, capacity, room_count, is_active')
          .eq('cattery_id', cattery.id)
          .eq('is_active', true),
      ]);

      if (bookingsResult.error) throw bookingsResult.error;
      if (roomsResult.error) throw roomsResult.error;

      const bookings = bookingsResult.data || [];
      const rooms = roomsResult.data || [];
      const totalCapacity = rooms.reduce((sum, room) => (
        sum + (Number(room.capacity) || 0) * Math.max(1, Number(room.room_count) || 1)
      ), 0);
      const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled');

      const weeklyBookings = activeBookings.filter((booking) => stayOverlaps(booking, weekStart, weekEnd));
      const weeklyRevenue = weeklyBookings.reduce((sum, booking) => sum + bookingAmount(booking), 0);
      const weeklyCatDays = weeklyBookings.reduce((sum, booking) => sum + occupiedCatDays(booking, weekStart, weekEnd), 0);
      const avgStayLength = weeklyBookings.length > 0
        ? weeklyBookings.reduce((sum, booking) => sum + inclusiveStayDays(booking), 0) / weeklyBookings.length
        : 0;

      setWeeklyStats({
        revenue: weeklyRevenue,
        bookings: weeklyBookings.length,
        occupancyRate: totalCapacity > 0 ? Math.round((weeklyCatDays / (totalCapacity * 7)) * 100) : 0,
        avgStayLength: Math.round(avgStayLength * 10) / 10,
      });

      const nextWeekBookings = activeBookings.filter((booking) => stayOverlaps(booking, nextWeekStart, nextWeekEnd));
      const nextWeekCats = nextWeekBookings.reduce((sum, booking) => sum + bookingCatCount(booking), 0);
      const nextWeekCatDays = nextWeekBookings.reduce((sum, booking) => sum + occupiedCatDays(booking, nextWeekStart, nextWeekEnd), 0);
      const nextWeekPct = totalCapacity > 0 ? Math.round((nextWeekCatDays / (totalCapacity * 7)) * 100) : 0;

      setNextWeekOccupancy({
        booked: nextWeekCats,
        total: totalCapacity,
        cats: nextWeekCats,
        percentage: nextWeekPct,
        status: nextWeekPct < 40 ? 'low' : nextWeekPct < 70 ? 'moderate' : 'high',
      });

      const unpaidBookings = activeBookings.filter((booking) =>
        ['unpaid', 'partial', 'pending'].includes(String(booking.payment_status || '').toLowerCase())
      );

      setOutstandingPayments(
        unpaidBookings.map((booking) => {
          const cats = booking.booking_cats?.map((entry: any) => entry.cat?.name).filter(Boolean) || [];
          const arrival = bookingDate(booking.check_in);
          const today = bookingDate(now.toISOString());
          const daysUntil = Math.round((arrival.getTime() - today.getTime()) / 86_400_000);
          let arrivalDate = 'Upcoming';
          if (daysUntil === 0) arrivalDate = 'Today';
          else if (daysUntil === 1) arrivalDate = 'Tomorrow';
          else if (daysUntil > 0) arrivalDate = arrival.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
          else arrivalDate = 'Past';

          return {
            id: booking.id,
            owner: (booking.customer as any)?.name || 'Unknown customer',
            cat: cats.join(' & ') || `${bookingCatCount(booking)} cat${bookingCatCount(booking) === 1 ? '' : 's'}`,
            amount: bookingAmount(booking),
            arrivalDate,
            type: String(booking.payment_status || 'unpaid'),
          };
        })
      );

      const monthlyBookings = activeBookings.filter((booking) => stayOverlaps(booking, monthStart, monthEnd));
      const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + bookingAmount(booking), 0);
      const monthlyCatDays = monthlyBookings.reduce((sum, booking) => sum + occupiedCatDays(booking, monthStart, monthEnd), 0);

      setMonthlyStats({
        revenue: monthlyRevenue,
        totalBookings: monthlyBookings.length,
        avgBookingValue: monthlyBookings.length > 0 ? Math.round(monthlyRevenue / monthlyBookings.length) : 0,
        occupancyRate: totalCapacity > 0
          ? Math.round((monthlyCatDays / (totalCapacity * getDaysInMonth(now))) * 100)
          : 0,
        monthName: now.toLocaleString('en-NZ', { month: 'long' }),
      });
    } catch (analyticsError) {
      console.error('[CatStays] Failed to load staff insights', analyticsError);
      setError('Insights could not be loaded. Refresh the page to try again.');
    } finally {
      setLoading(false);
    }
  };

  return { weeklyStats, nextWeekOccupancy, outstandingPayments, monthlyStats, loading, error, refetch: fetchAnalytics };
}
