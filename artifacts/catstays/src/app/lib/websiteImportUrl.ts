const HTTP_SCHEME_PATTERN = /^https?:\/\//i;

export function normalizeWebsiteImportUrl(rawUrl: string, fallbackUrl = ''): string {
  const trimmedUrl = rawUrl.trim();
  const fallback = fallbackUrl.trim();
  const candidateUrl = trimmedUrl || fallback;

  if (!candidateUrl) return '';

  const absoluteUrl = HTTP_SCHEME_PATTERN.test(candidateUrl) ? candidateUrl : `https://${candidateUrl}`;

  try {
    return new URL(absoluteUrl).toString();
  } catch {
    return absoluteUrl;
  }
}
