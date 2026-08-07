import crypto from 'crypto';
import { lookup } from 'dns/promises';
import net from 'net';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CatteryWebsiteScrapeResult } from './catteryWebsiteScraper';

const DEFAULT_BUCKET = 'catstays-media';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_IMAGE_IMPORTS = 64;
const MAX_IMAGE_REDIRECTS = 4;

type StoredAsset = {
  originalUrl: string;
  storedUrl: string;
  path: string;
  contentType: string;
};

type ImageFetchResult = {
  body: Buffer;
  contentType: string;
};

export async function persistScrapedImages(
  scrape: CatteryWebsiteScrapeResult,
): Promise<CatteryWebsiteScrapeResult> {
  const supabase = createStorageClient();
  if (!supabase) return scrape;

  const urls = imageUrlsFromScrape(scrape).slice(0, MAX_IMAGE_IMPORTS);
  if (!urls.length) return scrape;

  const storedAssets: StoredAsset[] = [];

  for (const originalUrl of urls) {
    try {
      const asset = await fetchImage(originalUrl);
      const path = storagePathFor(scrape, originalUrl, asset.contentType);
      const { error } = await supabase.storage
        .from(storageBucket())
        .upload(path, asset.body, {
          contentType: asset.contentType,
          upsert: true,
          cacheControl: '31536000',
        });

      if (error) throw error;

      const { data } = supabase.storage.from(storageBucket()).getPublicUrl(path);
      if (!data.publicUrl) continue;

      storedAssets.push({
        originalUrl,
        storedUrl: data.publicUrl,
        path,
        contentType: asset.contentType,
      });
    } catch {
      // A single blocked, private, unsupported, or oversized image should not fail the import.
    }
  }

  if (!storedAssets.length) return scrape;

  const urlMap = new Map(storedAssets.map((asset) => [asset.originalUrl, asset.storedUrl]));
  const transformed = replaceImageUrls(scrape, urlMap) as CatteryWebsiteScrapeResult;
  transformed.websiteSettings = {
    ...(transformed.websiteSettings ?? {}),
    importedImageAssets: storedAssets,
  };
  transformed.demoCattery = {
    ...(transformed.demoCattery ?? {}),
    website_settings: transformed.websiteSettings,
  };

  return transformed;
}

function createStorageClient(): SupabaseClient | null {
  const supabaseUrl = readEnvValue('VITE_SUPABASE_URL', 'SUPABASE_URL', 'SUPABASE_PROJECT_URL');
  const serviceKey = readEnvValue(
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SERVICE_KEY',
    'SUPABASE_SECRET_KEY',
  );
  if (!supabaseUrl || !serviceKey) return null;

  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function readEnvValue(...keys: string[]) {
  for (const key of keys) {
    const raw = process.env[key];
    if (!raw) continue;
    const value = raw.trim();
    if (!value || /^\$[A-Z0-9_]+$/i.test(value)) continue;
    return value;
  }
  return undefined;
}

function storageBucket() {
  return readEnvValue('CATSTAYS_MEDIA_BUCKET') || DEFAULT_BUCKET;
}

function imageUrlsFromScrape(scrape: CatteryWebsiteScrapeResult): string[] {
  const urls = new Set<string>();

  const visit = (value: unknown, path: string[]) => {
    if (!value) return;
    if (typeof value === 'string') {
      if (isLikelyImportImageUrl(value, path)) urls.add(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, [...path, String(index)]));
      return;
    }
    if (typeof value === 'object') {
      Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
        visit(child, [...path, key]);
      });
    }
  };

  visit(scrape, []);
  return [...urls];
}

function isLikelyImportImageUrl(value: string, path: string[]) {
  if (!isHttpUrl(value) || isCatstaysStorageUrl(value)) return false;

  const joinedPath = path.join('.').toLowerCase();
  const lowerValue = value.toLowerCase();
  if (
    joinedPath.endsWith('sourceurl') ||
    joinedPath.endsWith('source_url') ||
    joinedPath.includes('bookingurl') ||
    joinedPath.includes('booking_url') ||
    joinedPath.includes('social') ||
    lowerValue.includes('google.com/maps') ||
    lowerValue.includes('facebook.com') ||
    lowerValue.includes('instagram.com')
  ) {
    return false;
  }

  return (
    isImportImagePath(path) ||
    /\.(png|jpe?g|webp|gif|avif)(?:[?#/]|$)/i.test(value) ||
    /static\.wixstatic\.com\/media|\/cdn-cgi\/image\/|\/_next\/image|\/images?\/|\/photos?\/|\/uploads?\/|\/media\//i.test(
      lowerValue,
    )
  );
}

function isImportImagePath(path: string[]) {
  const joined = path.join('.').toLowerCase();
  return (
    joined.includes('image') ||
    joined.includes('gallery') ||
    joined.includes('photo') ||
    joined.includes('logo') ||
    joined.includes('thumbnail') ||
    joined.includes('picture') ||
    joined.includes('media') ||
    joined.includes('asset')
  );
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isCatstaysStorageUrl(value: string) {
  try {
    const url = new URL(value);
    return /\.supabase\.co$/i.test(url.hostname) &&
      /\/storage\/v1\/object\/public\//i.test(url.pathname);
  } catch {
    return false;
  }
}

async function fetchImage(rawUrl: string): Promise<ImageFetchResult> {
  let currentUrl = new URL(rawUrl);

  for (let redirectCount = 0; redirectCount <= MAX_IMAGE_REDIRECTS; redirectCount += 1) {
    if (currentUrl.protocol !== 'http:' && currentUrl.protocol !== 'https:') {
      throw new TypeError('BAD_IMAGE_URL');
    }
    if (net.isIP(currentUrl.hostname)) throw new TypeError('DIRECT_IMAGE_IP');

    await assertSafePublicHost(currentUrl.hostname);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(currentUrl, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CatStays-image-import/1.0; +https://catstays.app)',
          Accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif,*/*;q=0.5',
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) {
      currentUrl = new URL(location, currentUrl.href);
      continue;
    }

    if (!response.ok) throw new TypeError(`IMAGE_HTTP_${response.status}`);

    const contentType = String(response.headers.get('content-type') ?? '')
      .split(';')[0]
      .trim()
      .toLowerCase();
    if (!isAllowedImageType(contentType)) throw new TypeError('UNSUPPORTED_IMAGE_TYPE');

    const contentLength = Number(response.headers.get('content-length') ?? 0);
    if (contentLength > MAX_IMAGE_BYTES) throw new TypeError('IMAGE_TOO_LARGE');

    const body = Buffer.from(await response.arrayBuffer());
    if (body.byteLength > MAX_IMAGE_BYTES) throw new TypeError('IMAGE_TOO_LARGE');

    return { body, contentType };
  }

  throw new TypeError('TOO_MANY_IMAGE_REDIRECTS');
}

async function assertSafePublicHost(hostname: string): Promise<void> {
  const results = await lookup(hostname, { all: true });
  if (!results.length) throw new TypeError('IMAGE_HOST_NOT_FOUND');
  if (results.some((result) => isPrivateIp(result.address))) {
    throw new TypeError('PRIVATE_IMAGE_IP');
  }
}

function isPrivateIp(ip: string): boolean {
  const kind = net.isIP(ip);
  if (!kind) return true;

  if (kind === 6) {
    const value = ip.toLowerCase();
    return (
      value === '::' ||
      value === '::1' ||
      value.startsWith('fc') ||
      value.startsWith('fd') ||
      value.startsWith('fe80:') ||
      value.startsWith('ff') ||
      value.startsWith('::ffff:10.') ||
      value.startsWith('::ffff:127.') ||
      value.startsWith('::ffff:192.168.')
    );
  }

  const [a, b, c] = ip.split('.').map(Number);
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    a === 0 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isAllowedImageType(contentType: string) {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'].includes(contentType);
}

function storagePathFor(scrape: CatteryWebsiteScrapeResult, imageUrl: string, contentType: string) {
  const sourceHost = (scrape.sourceHost || 'source')
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  const importHash = hash(scrape.sourceUrl).slice(0, 16);
  const imageHash = hash(imageUrl).slice(0, 24);
  return `imports/${sourceHost}/${importHash}/${imageHash}${extensionFor(contentType)}`;
}

function extensionFor(contentType: string) {
  const extensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/avif': '.avif',
    'image/gif': '.gif',
  };
  return extensions[contentType] ?? '.jpg';
}

function hash(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function replaceImageUrls(value: unknown, urlMap: Map<string, string>): unknown {
  if (typeof value === 'string') return urlMap.get(value) ?? value;
  if (Array.isArray(value)) return value.map((item) => replaceImageUrls(item, urlMap));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [
        key,
        replaceImageUrls(child, urlMap),
      ]),
    );
  }
  return value;
}
