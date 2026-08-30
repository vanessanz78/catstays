import { Router, type IRouter, type Request } from 'express';
import { createClient } from '@supabase/supabase-js';

const router: IRouter = Router();
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const admin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

function bearerToken(req: Request) {
  return String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
}

async function authenticatedUser(req: Request) {
  const token = bearerToken(req);
  if (!token || !admin) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error ? null : data.user;
}

async function platformAdminRole(userId: string) {
  if (!admin) return null;
  const { data, error } = await admin
    .from('platform_admins')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  return error ? null : data?.role || null;
}

type CountMap = Record<string, number>;

export function hasPublicWebsiteAddress(cattery: {
  slug: string | null;
  custom_domain: string | null;
  current_published_version_id: string | null;
}) {
  return Boolean(cattery.slug || cattery.custom_domain || cattery.current_published_version_id);
}

function countByCattery(rows: Array<{ cattery_id: string | null }> | null | undefined): CountMap {
  return (rows || []).reduce<CountMap>((counts, row) => {
    if (row.cattery_id) counts[row.cattery_id] = (counts[row.cattery_id] || 0) + 1;
    return counts;
  }, {});
}

router.get('/platform/overview', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!admin) {
    res.status(503).json({ error: 'Platform administration is not configured.' });
    return;
  }

  const user = await authenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Sign in with a CatStays platform administrator account.' });
    return;
  }

  const role = await platformAdminRole(user.id);
  if (!role) {
    res.status(403).json({ error: 'This account does not have CatStays platform administration access.' });
    return;
  }

  const [catteriesResult, bookingsResult, customersResult, roomsResult, paymentsResult] = await Promise.all([
    admin
      .from('catteries')
      .select('id,name,slug,email,city,custom_domain,subscription_status,current_published_version_id,created_at,updated_at')
      .order('created_at', { ascending: false }),
    admin.from('bookings').select('cattery_id,status,payment_status,check_in'),
    admin.from('customers').select('cattery_id'),
    admin.from('rooms').select('cattery_id,is_active'),
    admin.from('cattery_payment_accounts').select('cattery_id,status,mode,last_validated_at'),
  ]);

  const firstError = [catteriesResult, bookingsResult, customersResult, roomsResult, paymentsResult]
    .find((result) => result.error)?.error;
  if (firstError) {
    console.error('[platform] Could not load overview:', firstError.message);
    res.status(500).json({ error: 'The platform overview could not be loaded.' });
    return;
  }

  const bookingCounts = countByCattery(bookingsResult.data);
  const customerCounts = countByCattery(customersResult.data);
  const activeRooms = countByCattery((roomsResult.data || []).filter((room) => room.is_active));
  const paymentAccounts = new Map((paymentsResult.data || []).map((account) => [account.cattery_id, account]));
  const today = new Date().toISOString().slice(0, 10);

  const catteries = (catteriesResult.data || []).map((cattery) => {
    const catteryBookings = (bookingsResult.data || []).filter((booking) => booking.cattery_id === cattery.id);
    const payment = paymentAccounts.get(cattery.id);
    return {
      ...cattery,
      bookingsCount: bookingCounts[cattery.id] || 0,
      customersCount: customerCounts[cattery.id] || 0,
      activeRoomsCount: activeRooms[cattery.id] || 0,
      pendingBookingsCount: catteryBookings.filter((booking) => booking.status === 'pending').length,
      upcomingBookingsCount: catteryBookings.filter((booking) => booking.status !== 'cancelled' && booking.check_in >= today).length,
      websiteAvailable: hasPublicWebsiteAddress(cattery),
      published: Boolean(cattery.current_published_version_id),
      payment: payment ? {
        connected: payment.status === 'active',
        mode: payment.mode,
        lastValidatedAt: payment.last_validated_at,
      } : { connected: false, mode: null, lastValidatedAt: null },
    };
  });

  res.json({
    administrator: { email: user.email || null, role },
    summary: {
      catteries: catteries.length,
      websiteAddresses: catteries.filter((cattery) => cattery.websiteAvailable).length,
      publishedWebsites: catteries.filter((cattery) => cattery.published).length,
      bookings: bookingsResult.data?.length || 0,
      customers: customersResult.data?.length || 0,
      pendingBookings: (bookingsResult.data || []).filter((booking) => booking.status === 'pending').length,
      connectedPayments: catteries.filter((cattery) => cattery.payment.connected).length,
    },
    catteries,
    generatedAt: new Date().toISOString(),
  });
});

export default router;
