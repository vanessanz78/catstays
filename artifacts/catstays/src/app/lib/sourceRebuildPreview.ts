export function sourceRebuildHtmlFromData(data: Record<string, any> | null | undefined): string {
  const candidates = [
    data?.sourceArchive?.rebuild?.html,
    data?.websiteSettings?.sourceArchive?.rebuild?.html,
    data?.previewImportRecord?.source?.sourceArchive?.rebuild?.html,
    data?.previewImportRecord?.normalizedPreviewData?.sourceArchive?.rebuild?.html,
    data?.normalizedPreviewData?.sourceArchive?.rebuild?.html,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return normalizePublishedSourceHtml(candidate);
  }
  return '';
}

export function normalizePublishedSourceHtml(html: string): string {
  let normalized = html
    .replace(/\bBook\s*\/\s*Enquire\b/gi, 'Book Now')
    .replace(/\bBook or enquire about your cat(?:'|’)?s stay\.?/gi, "Book your cat's stay.");

  normalized = rewriteLoginLinks(normalized);
  normalized = rewriteHeaderClientAction(normalized);
  return normalized;
}

function rewriteLoginLinks(html: string) {
  return html.replace(/<footer\b([^>]*)>([\s\S]*?)<\/footer>/gi, (footer, attributes, contents) => {
    let nextContents = contents.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (anchor, anchorAttributes, innerHtml) => {
      const label = readableHtmlText(innerHtml);
      if (/^client\s+(?:login|portal)$/i.test(label)) return '';
      if (/^host\s+login$/i.test(label)) {
        return `<a${withHref(anchorAttributes, '/staff-login')}>${innerHtml.replace(/host\s+login/gi, 'Staff Login')}</a>`;
      }
      if (/^staff\s+login$/i.test(label)) {
        return `<a${withHref(anchorAttributes, '/staff-login')}>${innerHtml}</a>`;
      }
      return anchor;
    });

    return `<footer${attributes}>${nextContents}</footer>`;
  });
}

function rewriteHeaderClientAction(html: string) {
  let changed = false;
  return html.replace(/<(header|nav)\b([^>]*)>([\s\S]*?)<\/\1>/gi, (container, tag, attributes, contents) => {
    if (changed) return container;

    const nextContents = contents.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (anchor, anchorAttributes, innerHtml) => {
      if (changed || !/^book\s+now$/i.test(readableHtmlText(innerHtml))) return anchor;
      changed = true;
      return `<a${withHref(anchorAttributes, '/client-portal')}>${innerHtml.replace(/book\s+now/gi, 'Client Login')}</a>`;
    });

    return changed ? `<${tag}${attributes}>${nextContents}</${tag}>` : container;
  });
}

function readableHtmlText(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function withHref(attributes: string, href: string) {
  if (/\bhref\s*=/i.test(attributes)) {
    return attributes.replace(/\bhref\s*=\s*(["'])[^"']*\1/i, `href="${href}"`);
  }
  return `${attributes} href="${href}"`;
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
