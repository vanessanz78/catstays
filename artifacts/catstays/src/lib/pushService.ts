import { supabase } from '@/utils/supabase/client';

export type PhoneNotificationState = {
  supported: boolean;
  configured: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
};

type PushStatus = { configured: boolean; publicKey: string; subscribed: boolean };

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

function bytesToBase64Url(value: ArrayBuffer | null): string {
  if (!value) return '';
  let binary = '';
  new Uint8Array(value).forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function token(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = await token();
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || 'Phone notification request failed.');
  return payload;
}

async function registration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing?.active) return existing;
  const ready = navigator.serviceWorker.ready;
  const timeout = new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('The CatStays app update is still installing. Close and reopen the app, then try again.')), 12000));
  return Promise.race([ready, timeout]);
}

async function serverStatus(): Promise<PushStatus> {
  return api<PushStatus>('/api/push/status');
}

export async function getPhoneNotificationState(): Promise<PhoneNotificationState> {
  const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (!supported) return { supported: false, configured: false, permission: 'default', subscribed: false };
  const status = await serverStatus();
  const current = await navigator.serviceWorker.getRegistration().then((item) => item?.pushManager.getSubscription()).catch(() => null);
  return { supported: true, configured: status.configured, permission: Notification.permission, subscribed: Boolean(status.subscribed && current) };
}

export async function enablePhoneNotifications(catteryId: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    throw new Error('This browser does not support installed-app phone notifications.');
  }
  if (!catteryId) throw new Error('Your cattery account is still loading. Please try again.');

  const status = await serverStatus();
  if (!status.configured || !status.publicKey) throw new Error('CatStays phone notifications have not been configured yet.');
  const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Allow notifications in your phone settings, then try again.');

  const serviceWorker = await registration();
  let subscription = await serviceWorker.pushManager.getSubscription();
  const currentKey = bytesToBase64Url(subscription?.options.applicationServerKey || null);
  if (subscription && currentKey !== status.publicKey) {
    await subscription.unsubscribe();
    subscription = null;
  }
  subscription ||= await serviceWorker.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToBytes(status.publicKey) as BufferSource,
  });
  await api('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({ catteryId, subscription: subscription.toJSON(), platform: navigator.userAgent }),
  });
}

export async function restorePhoneNotifications(catteryId: string): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const serviceWorker = await navigator.serviceWorker.ready;
    if (await serviceWorker.pushManager.getSubscription()) await enablePhoneNotifications(catteryId);
  } catch (error) {
    console.warn('CatStays phone notification recovery failed:', error);
  }
}

export async function sendTestPhoneNotification(catteryId: string): Promise<void> {
  await enablePhoneNotifications(catteryId);
  await api('/api/push/test', { method: 'POST', body: '{}' });
}
