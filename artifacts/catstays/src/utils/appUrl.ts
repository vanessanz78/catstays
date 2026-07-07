const configuredAppUrl = import.meta.env.VITE_PUBLIC_APP_URL as string | undefined;

function isPlaceholderValue(value: string) {
  return /^\$[A-Z0-9_]+$/i.test(value.trim());
}

function isLocalhostUrl(value: string) {
  return /^https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?(?:\/|$)/i.test(value.trim());
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, '');
}

function usablePublicUrl(value: string | undefined) {
  if (!value || value.trim().length === 0) return null;
  const trimmed = value.trim();
  if (isPlaceholderValue(trimmed) || isLocalhostUrl(trimmed)) return null;
  return trimTrailingSlash(trimmed);
}

export function getPublicAppUrl() {
  const configured = usablePublicUrl(configuredAppUrl);
  if (configured) return configured;

  if (typeof window !== 'undefined') {
    const origin = usablePublicUrl(window.location?.origin);
    if (origin) return origin;
  }

  return 'https://catstays.app';
}

export function getConfirmEmailUrl() {
  return `${getPublicAppUrl()}/confirm-email`;
}
