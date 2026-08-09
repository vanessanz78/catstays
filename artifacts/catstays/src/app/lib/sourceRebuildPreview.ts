export function sourceRebuildHtmlFromData(data: Record<string, any> | null | undefined): string {
  const candidates = [
    data?.sourceArchive?.rebuild?.html,
    data?.websiteSettings?.sourceArchive?.rebuild?.html,
    data?.previewImportRecord?.source?.sourceArchive?.rebuild?.html,
    data?.previewImportRecord?.normalizedPreviewData?.sourceArchive?.rebuild?.html,
    data?.normalizedPreviewData?.sourceArchive?.rebuild?.html,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
  }
  return '';
}

export function sourcePreviewUrlFromData(data: Record<string, any> | null | undefined): string {
  const rawUrl =
    data?.previewImportRecord?.source?.url ||
    data?.importSourceUrl ||
    data?.sourceUrl ||
    data?.websiteUrl ||
    '';
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  try {
    const url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.toString();
  } catch {
    return '';
  }
}

export function sourcePreviewProxyUrl(sourceUrl: string): string {
  return sourceUrl ? `/api/website/source-preview?url=${encodeURIComponent(sourceUrl)}` : '';
}
