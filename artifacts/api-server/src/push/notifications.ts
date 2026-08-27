import { createClient } from '@supabase/supabase-js';
import { sendPushToUser, type PushPayload } from './pushSender.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const admin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

export type NotificationPayload = PushPayload & {
  type: string;
  metadata?: Record<string, unknown>;
};

export async function notifyUsers(userIds: string[], catteryId: string, payload: NotificationPayload) {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
  if (!admin || !catteryId || uniqueUserIds.length === 0) return { notified: 0, sent: 0, failed: 0 };

  const { error } = await admin.from('catstays_notifications').insert(uniqueUserIds.map((userId) => ({
    user_id: userId,
    cattery_id: catteryId,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    url: payload.url || '/app',
    metadata: payload.metadata || {},
  })));
  if (error) console.warn('[notifications] Could not save in-app notification:', error.message);

  const deliveries = await Promise.all(uniqueUserIds.map((userId) => sendPushToUser(userId, payload)));
  const totals = deliveries.reduce((total, delivery) => ({
    sent: total.sent + delivery.sent,
    failed: total.failed + delivery.failed,
  }), { sent: 0, failed: 0 });
  return { notified: uniqueUserIds.length, ...totals };
}

export async function notifyCatteryStaff(catteryId: string, payload: NotificationPayload) {
  if (!admin || !catteryId) return { notified: 0, sent: 0, failed: 0 };
  const [{ data: cattery }, { data: memberships }] = await Promise.all([
    admin.from('catteries').select('owner_id').eq('id', catteryId).maybeSingle(),
    admin.from('staff_memberships').select('user_id').eq('cattery_id', catteryId).eq('status', 'active').not('user_id', 'is', null),
  ]);
  return notifyUsers([
    String(cattery?.owner_id || ''),
    ...((memberships || []).map((membership) => String(membership.user_id || ''))),
  ], catteryId, payload);
}

export async function notifyCustomer(customerId: string, catteryId: string, payload: NotificationPayload) {
  if (!admin || !customerId) return { notified: 0, sent: 0, failed: 0 };
  const { data } = await admin.from('customers').select('user_id').eq('id', customerId).maybeSingle();
  return notifyUsers(data?.user_id ? [String(data.user_id)] : [], catteryId, payload);
}
