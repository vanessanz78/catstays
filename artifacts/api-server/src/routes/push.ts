import { createClient } from '@supabase/supabase-js';
import { Router, type IRouter, type Request } from 'express';
import { getPushConfiguration, sendPushToUser } from '../push/pushSender.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const admin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

const router: IRouter = Router();

async function authenticatedUser(req: Request) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token || !admin) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error ? null : data.user;
}

async function ownedCattery(userId: string, catteryId: string) {
  if (!admin || !catteryId) return false;
  const { data } = await admin
    .from('catteries')
    .select('id')
    .eq('id', catteryId)
    .eq('owner_id', userId)
    .maybeSingle();
  return Boolean(data?.id);
}

router.get('/push/status', async (req, res) => {
  const user = await authenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Please sign in to manage phone notifications.' });
    return;
  }
  const config = getPushConfiguration();
  let subscribed = false;
  if (admin) {
    const { count } = await admin
      .from('catstays_push_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true);
    subscribed = Number(count || 0) > 0;
  }
  res.json({ ...config, subscribed });
});

router.post('/push/subscribe', async (req, res) => {
  const user = await authenticatedUser(req);
  if (!user || !admin) {
    res.status(401).json({ error: 'Please sign in to enable phone notifications.' });
    return;
  }

  const catteryId = String(req.body?.catteryId || '').trim();
  const subscription = req.body?.subscription;
  const endpoint = String(subscription?.endpoint || '').trim();
  const p256dh = String(subscription?.keys?.p256dh || '').trim();
  const authKey = String(subscription?.keys?.auth || '').trim();
  if (
    !endpoint.startsWith('https://')
    || endpoint.length > 2048
    || !p256dh
    || !authKey
    || !(await ownedCattery(user.id, catteryId))
  ) {
    res.status(400).json({ error: 'The phone subscription or cattery account is invalid.' });
    return;
  }

  const { error } = await admin.from('catstays_push_subscriptions').upsert({
    user_id: user.id,
    cattery_id: catteryId,
    endpoint,
    p256dh,
    auth_key: authKey,
    platform: String(req.body?.platform || 'pwa').slice(0, 40),
    is_active: true,
    last_seen_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'endpoint' });

  if (error) {
    console.error('[push] Could not save subscription:', error.message);
    res.status(500).json({ error: 'CatStays could not save this phone subscription.' });
    return;
  }
  res.json({ success: true });
});

router.post('/push/test', async (req, res) => {
  const user = await authenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Please sign in to send a test notification.' });
    return;
  }
  const result = await sendPushToUser(user.id, {
    title: 'CatStays test notification',
    body: 'Native phone notifications are connected to this cattery account.',
    url: '/admin/settings/notifications',
    tag: `catstays-test-${Date.now()}`,
  });
  if (result.sent === 0) {
    res.status(503).json({ error: result.failed > 0 ? 'The phone rejected the test notification. Re-enable notifications and try again.' : 'No active phone subscription was found.' });
    return;
  }
  res.json({ success: true, ...result });
});

export default router;
