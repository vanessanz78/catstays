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

export function getPublicAppUrl() {
  if (configuredAppUrl && configuredAppUrl.trim().length > 0) {
    const trimmed = configuredAppUrl.trim();
    if (!isPlaceholderValue(trimmed) && !isLocalhostUrl(trimmed)) {
      return trimTrailingSlash(trimmed);
    }
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return 'https://catstays.app';
}

export function getConfirmEmailUrl() {
  return `${getPublicAppUrl()}/confirm-email`;
}

function isDevelopmentPreviewHost(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('replit.dev') ||
    hostname.includes('replit.app') ||
    hostname.includes('kirk.replit')
  );
}

function safeTenantSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
}

export function getTenantWebsiteUrl(subdomain: string) {
  const slug = safeTenantSlug(subdomain);
  if (!slug) return getPublicAppUrl();

  if (typeof window !== 'undefined' && window.location?.origin && isDevelopmentPreviewHost(window.location.hostname)) {
    return `${trimTrailingSlash(window.location.origin)}/tenant/${slug}`;
  }

  return `https://${slug}.catstays.app`;
}

export function getTenantWebsiteDisplayUrl(subdomain: string) {
  const url = getTenantWebsiteUrl(subdomain);
  return url.replace(/^https?:\/\//, '');
}
