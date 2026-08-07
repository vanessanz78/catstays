import crypto from 'crypto';
import { lookup } from 'dns/promises';
import http from 'http';
import https from 'https';
import net from 'net';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CatteryWebsiteScrapeResult } from './catteryWebsiteScraper';

const DEFAULT_BUCKET = 'catstays-media';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_IMAGE_IMPORTS = 32;
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

type ImageFetchResponse = ImageFetchResult | { redirectUrl: string };

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
      // A single blocked or oversized image should not fail the entire website import.
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
      if (isImportImagePath(path) && isHttpUrl(value) && !isCatstaysStorageUrl(value)) {
        urls.add(value);
      }
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

function isImportImagePath(path: string[]) {
  const joined = path.join('.').toLowerCase();
  return (
    joined.includes('image') ||
    joined.includes('gallery') ||
    joined.includes('photo') ||
    joined.includes('logo') ||
    joined.includes('thumbnail')
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

    const address = await resolveSafeIp(currentUrl.hostname);
    const response = await fetchImageOnce(currentUrl, address);
    if ('redirectUrl' in response) {
      currentUrl = new URL(response.redirectUrl, currentUrl.href);
      continue;
    }
    return response;
  }

  throw new TypeError('TOO_MANY_IMAGE_REDIRECTS');
}

async function resolveSafeIp(hostname: string): Promise<string> {
  const result = await lookup(hostname, { family: 4 });
  if (isPrivateIp(result.address)) throw new TypeError('PRIVATE_IMAGE_IP');
  return result.address;
}

function isPrivateIp(ip: string): boolean {
  if (!net.isIPv4(ip)) return true;

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

function fetchImageOnce(targetUrl: URL, resolvedIp: string): Promise<ImageFetchResponse> {
  return new Promise((resolve, reject) => {
    const isHttps = targetUrl.protocol === 'https:';
    const port = targetUrl.port ? Number(targetUrl.port) : isHttps ? 443 : 80;
    const chunks: Buffer[] = [];
    let byteLength = 0;
    let settled = false;

    const settle = (callback: typeof resolve | typeof reject, value: ImageFetchResponse | Error) => {
      if (settled) return;
      settled = true;
      callback(value as never);
    };

    const requestOptions: https.RequestOptions = {
      hostname: resolvedIp,
      port,
      path: targetUrl.pathname + targetUrl.search,
      method: 'GET',
      headers: {
        Host: targetUrl.hostname,
        'User-Agent': 'Mozilla/5.0 (compatible; CatStays-image-import/1.0; +https://catstays.app)',
        Accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif,*/*;q=0.5',
        Connection: 'close',
      },
      servername: targetUrl.hostname,
      timeout: FETCH_TIMEOUT_MS,
    };

    const handleResponse = (res: http.IncomingMessage) => {
      const status = res.statusCode ?? 0;
      const location = typeof res.headers.location === 'string' ? res.headers.location : '';
      const contentType = String(res.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();

      if (status >= 300 && status < 400 && location) {
        settle(resolve, { redirectUrl: location });
        return;
      }

      if (status < 200 || status >= 300) {
        settle(reject, new TypeError(`IMAGE_HTTP_${status}`));
        return;
      }

      if (!isAllowedImageType(contentType)) {
        settle(reject, new TypeError('UNSUPPORTED_IMAGE_TYPE'));
        return;
      }

      res.on('data', (chunk: Buffer) => {
        byteLength += chunk.length;
        if (byteLength > MAX_IMAGE_BYTES) {
          req.destroy();
          settle(reject, new TypeError('IMAGE_TOO_LARGE'));
          return;
        }
        chunks.push(chunk);
      });
      res.on('end', () => settle(resolve, { body: Buffer.concat(chunks), contentType }));
    };

    const req = isHttps
      ? https.request(requestOptions, handleResponse)
      : http.request(requestOptions, handleResponse);

    req.on('timeout', () => {
      req.destroy();
      settle(reject, new TypeError('IMAGE_TIMEOUT'));
    });
    req.on('error', (error) => settle(reject, error));
    req.end();
  });
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
