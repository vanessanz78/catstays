import { restorePhoneNotifications } from './pushService';

export async function registerCatStaysServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    void registration.update().catch(() => undefined);
    return registration;
  } catch (error) {
    console.warn('CatStays service worker registration failed:', error);
    return null;
  }
}

export function recoverCatStaysPhoneNotifications(catteryId: string) {
  void restorePhoneNotifications(catteryId);
}
