import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

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

export function useAnalytics() {
  const { cattery, loading: authLoading } = useAuth();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({ revenue: 0, bookings: 0, occupancyRate: 0, avgStayLength: 0 });
  const [nextWeekOccupancy, setNextWeekOccupancy] = useState<NextWeekOccupancy>({ booked: 0, total: 0, cats: 0, percentage: 0, status: 'low' });
  const [outstandingPayments, setOutstandingPayments] = useState<OutstandingPayment[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({ revenue: 0, totalBookings: 0, avgBookingValue: 0, occupancyRate: 0, monthName: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve
    if (!cattery?.id) {
      setLoading(false);
      return;
    }
    fetchAnalytics();
  }, [cattery?.id, authLoading]);

  const fetchAnalytics = async () => {
    if (!cattery?.id) return;
    setLoading(true);

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const nextWeekStart = new Date(weekEnd.getTime() + 1);
    const nextWeekEnd = new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Fetch all bookings for this cattery with customer and cat info
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        id, check_in, check_out, status, payment_status, total_amount, notes,
        customer:customers(id, name),
        booking_cats(cat:cats(name))
      `)
      .eq('cattery_id', cattery.id)
      .order('check_in', { ascending: false });

    // Fetch total room capacity
    const { data: rooms } = await supabase
      .from('rooms')
      .select('id, capacity, is_active')
      .eq('cattery_id', cattery.id)
      .eq('is_active', true);

    const totalCapacity = rooms?.reduce((sum, r) => sum + r.capacity, 0) || 0;

    if (!bookings) {
      setLoading(false);
      return;
    }

    // Weekly stats (this week's confirmed/completed bookings)
    const weeklyBookings = bookings.filter(b => {
      const checkIn = new Date(b.check_in);
      return checkIn >= weekStart && checkIn <= weekEnd && b.status !== 'cancelled';
    });

    const weeklyRevenue = weeklyBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const avgStayLength = weeklyBookings.length > 0
      ? weeklyBookings.reduce((sum, b) => sum + differenceInDays(new Date(b.check_out), new Date(b.check_in)), 0) / weeklyBookings.length
      : 0;

    setWeeklyStats({
      revenue: weeklyRevenue,
      bookings: weeklyBookings.length,
      occupancyRate: totalCapacity > 0 ? Math.round((weeklyBookings.length / totalCapacity) * 100) : 0,
      avgStayLength: Math.round(avgStayLength * 10) / 10,
    });

    // Next week occupancy
    const nextWeekBookings = bookings.filter(b => {
      const checkIn = new Date(b.check_in);
      return checkIn >= nextWeekStart && checkIn <= nextWeekEnd && b.status !== 'cancelled';
    });
    const nextWeekCats = nextWeekBookings.reduce((sum, b) => sum + (b.booking_cats?.length || 0), 0);
    const nextWeekPct = totalCapacity > 0 ? Math.round((nextWeekBookings.length / totalCapacity) * 100) : 0;

    setNextWeekOccupancy({
      booked: nextWeekBookings.length,
      total: totalCapacity,
      cats: nextWeekCats,
      percentage: nextWeekPct,
      status: nextWeekPct < 40 ? 'low' : nextWeekPct < 70 ? 'moderate' : 'high',
    });

    // Outstanding payments (unpaid bookings)
    const unpaidBookings = bookings.filter(b =>
      b.payment_status === 'unpaid' && b.status !== 'cancelled'
    );

    setOutstandingPayments(
      unpaidBookings.map(b => {
        const cats = b.booking_cats?.map((bc: any) => bc.cat?.name).filter(Boolean) || [];
        const daysUntil = differenceInDays(new Date(b.check_in), now);
        let arrivalDate = 'Upcoming';
        if (daysUntil === 0) arrivalDate = 'Today';
        else if (daysUntil === 1) arrivalDate = 'Tomorrow';
        else if (daysUntil > 0) arrivalDate = new Date(b.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        else arrivalDate = 'Past';

        return {
          id: b.id,
          owner: (b.customer as any)?.name || 'Unknown',
          cat: cats.join(' & ') || 'Unknown',
          amount: b.total_amount || 0,
          arrivalDate,
          type: 'balance',
        };
      })
    );

    // Monthly stats
    const monthlyBookings = bookings.filter(b => {
      const checkIn = new Date(b.check_in);
      return checkIn >= monthStart && checkIn <= monthEnd && b.status !== 'cancelled';
    });
    const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

    setMonthlyStats({
      revenue: monthlyRevenue,
      totalBookings: monthlyBookings.length,
      avgBookingValue: monthlyBookings.length > 0 ? Math.round(monthlyRevenue / monthlyBookings.length) : 0,
      occupancyRate: totalCapacity > 0 ? Math.round((monthlyBookings.length / (totalCapacity * 4)) * 100) : 0,
      monthName: now.toLocaleString('default', { month: 'long' }),
    });

    setLoading(false);
  };

  return { weeklyStats, nextWeekOccupancy, outstandingPayments, monthlyStats, loading, refetch: fetchAnalytics };
}
