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
