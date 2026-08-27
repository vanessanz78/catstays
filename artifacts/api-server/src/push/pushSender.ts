import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { getVapidCredentials } from './vapidCredentials.js';

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
};

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const credentials = getVapidCredentials();
const admin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

if (credentials) {
  webpush.setVapidDetails('mailto:support@catstays.app', credentials.publicKey, credentials.privateKey);
}

export function getPushConfiguration() {
  return {
    configured: Boolean(credentials && admin),
    publicKey: credentials?.publicKey || '',
  };
}

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<{ sent: number; failed: number }> {
  if (!credentials || !admin || !userId) return { sent: 0, failed: 0 };

  const { data, error } = await admin
    .from('catstays_push_subscriptions')
    .select('id,endpoint,p256dh,auth_key')
    .eq('user_id', userId)
    .eq('is_active', true);
  if (error) {
    console.warn('[push] Could not load subscriptions:', error.message);
    return { sent: 0, failed: 0 };
  }

  const subscriptions = (data || []) as SubscriptionRow[];
  let sent = 0;
  let failed = 0;
  await Promise.all(subscriptions.map(async (row) => {
    try {
      await webpush.sendNotification(
        { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth_key } },
        JSON.stringify({ ...payload, icon: '/icons/icon-192.png', badge: '/icons/icon-maskable-192.png' }),
      );
      sent += 1;
      await admin.from('catstays_push_subscriptions').update({ last_seen_at: new Date().toISOString() }).eq('id', row.id);
    } catch (deliveryError) {
      failed += 1;
      const statusCode = Number((deliveryError as { statusCode?: number })?.statusCode || 0);
      if (statusCode === 404 || statusCode === 410) {
        await admin
          .from('catstays_push_subscriptions')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', row.id);
      } else {
        console.warn('[push] Delivery failed:', deliveryError instanceof Error ? deliveryError.message : deliveryError);
      }
    }
  }));

  return { sent, failed };
}

export async function sendPushToCatteryOwner(catteryId: string, payload: PushPayload) {
  if (!admin || !catteryId) return { sent: 0, failed: 0 };
  const { data, error } = await admin.from('catteries').select('owner_id').eq('id', catteryId).maybeSingle();
  if (error || !data?.owner_id) {
    if (error) console.warn('[push] Could not resolve cattery owner:', error.message);
    return { sent: 0, failed: 0 };
  }
  return sendPushToUser(String(data.owner_id), payload);
}
