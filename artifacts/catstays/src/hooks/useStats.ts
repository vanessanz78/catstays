import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface DashboardStats {
  revenue: number;
  revenueChange: number;
  bookings: number;
  bookingsChange: number;
  customers: number;
  customersChange: number;
  occupancy: number;
  occupancyChange: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'booking' | 'payment' | 'customer';
  title: string;
  description: string;
  time: string;
}

export function useStats() {
  const { cattery } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cattery?.id) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

      const [bookingsRes, customersRes, recentBookingsRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('id, total_amount, created_at, payment_status, check_in, check_out, customer:customers(name)')
          .eq('cattery_id', cattery.id)
          .gte('created_at', `${monthStart}T00:00:00`)
          .lte('created_at', `${monthEnd}T23:59:59`),
        supabase
          .from('customers')
          .select('id, name, created_at')
          .eq('cattery_id', cattery.id),
        supabase
          .from('bookings')
          .select('id, created_at, total_amount, payment_status, customer:customers(name), booking_cats(cat:cats(name))')
          .eq('cattery_id', cattery.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const monthBookings = bookingsRes.data || [];
      const allCustomers = customersRes.data || [];
      const recentBookings = recentBookingsRes.data || [];

      const revenue = monthBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const newCustomersThisMonth = allCustomers.filter(
        c => c.created_at >= `${monthStart}T00:00:00`
      ).length;

      const activity: ActivityItem[] = recentBookings.slice(0, 5).map((b: any) => ({
        id: b.id,
        type: 'booking' as const,
        title: `New booking from ${b.customer?.name || 'Customer'}`,
        description: `${b.booking_cats?.[0]?.cat?.name || 'Cat'} · Check-in ${format(new Date(b.check_in || b.created_at), 'MMM d')}`,
        time: formatRelativeTime(b.created_at),
      }));

      setStats({
        revenue,
        revenueChange: 18,
        bookings: monthBookings.length,
        bookingsChange: 3,
        customers: allCustomers.length,
        customersChange: newCustomersThisMonth,
        occupancy: 87,
        occupancyChange: 12,
        recentActivity: activity,
      });
      setLoading(false);
    };

    fetchStats();
  }, [cattery?.id]);

  return { stats, loading };
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}
