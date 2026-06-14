const configuredAppUrl = import.meta.env.VITE_PUBLIC_APP_URL as string | undefined;

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, '');
}

export function getPublicAppUrl() {
  if (configuredAppUrl && configuredAppUrl.trim().length > 0) {
    return trimTrailingSlash(configuredAppUrl.trim());
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return 'https://catstays.app';
}

export function getConfirmEmailUrl() {
  return `${getPublicAppUrl()}/confirm-email`;
}
