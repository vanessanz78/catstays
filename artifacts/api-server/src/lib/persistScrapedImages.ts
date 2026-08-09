import crypto from 'crypto';
import { lookup } from 'dns/promises';
import net from 'net';
import { createClient } from '@supabase/supabase-js';
import type { CatteryWebsiteScrapeResult } from './catteryWebsiteScraper';

const DEFAULT_BUCKET = 'catstays-media';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_IMAGE_IMPORTS = 64;
const MAX_IMAGE_REDIRECTS = 4;
const PUBLIC_URL_VERIFY_TIMEOUT_MS = 6_000;

export type StoredImageAsset = {
  originalUrl: string;
  storedUrl: string;
  path: string;
  storagePath: string;
  bucket: string;
  contentType: string;
  fileSizeBytes: number;
  sha256: string;
  deliveryStatus?: number;
  deliveryContentType?: string;
  deliveryBytes?: number;
  sourcePageUrl?: string;
  altText?: string;
  caption?: string;
};

export type MediaImportFailure = {
  url: string;
  stage: 'configuration' | 'download' | 'upload' | 'public_url';
  reason: string;
  status?: number;
  contentType?: string;
  bytes?: number;
  maxBytes?: number;
};

export type MediaImportDiagnostics = {
  status: 'stored' | 'partial' | 'no_images' | 'configuration_error' | 'failed';
  mediaPersistenceEnabled: boolean;
  storageBucket: string;
  supabaseProjectRef?: string;
  maxImageBytes: number;
  imagesFound: number;
  imagesCandidates: number;
  imagesDownloadAttempted: number;
  imagesDownloaded: number;
  imagesUploadAttempted: number;
  imagesUploaded: number;
  imagesStored: number;
  imagesBrowserLoadable: number;
  mediaRecordsAttempted: number;
  mediaRecordsCreated: number;
  mediaRecordsFailed: number;
  imagesFailed: number;
  imagesSkipped: number;
  failures: MediaImportFailure[];
  storedAssets: StoredImageAsset[];
};

export type PersistScrapedImagesOptions = {
  catteryId?: string;
  contentSourceId?: string;
  importId?: string;
  requireStorage?: boolean;
  supabase?: MediaStorageClient;
  skipHostSafetyCheck?: boolean;
};

type MediaStorageClient = {
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        body: Buffer,
        options: { contentType: string; upsert: boolean; cacheControl: string },
      ): Promise<{ error: unknown | null }>;
      getPublicUrl(path: string): { data: { publicUrl?: string } };
    };
  };
};

type ImageImportCandidate = {
  originalUrl: string;
  sourcePageUrl?: string;
  altText?: string;
  caption?: string;
};

type ImageFetchResult = {
  body: Buffer;
  contentType: string;
  finalUrl: string;
  fileSizeBytes: number;
  sha256: string;
};

type ImageDeliveryVerification = {
  status: number;
  contentType: string;
  bytes: number;
};

class ImageImportError extends Error {
  constructor(
    message: string,
    readonly details: Omit<MediaImportFailure, 'url' | 'stage'> = { reason: message },
  ) {
    super(message);
  }
}

export class MediaImportConfigurationError extends Error {
  readonly code = 'MEDIA_IMPORT_NOT_CONFIGURED';

  constructor(readonly diagnostics: MediaImportDiagnostics) {
    super('MEDIA_IMPORT_NOT_CONFIGURED');
  }
}

export async function persistScrapedImages(
  scrape: CatteryWebsiteScrapeResult,
  options: PersistScrapedImagesOptions = {},
): Promise<CatteryWebsiteScrapeResult> {
  const bucket = storageBucket();
  const candidates = imageCandidatesFromScrape(scrape).slice(0, MAX_IMAGE_IMPORTS);
  const diagnostics = createDiagnostics(scrape, bucket, candidates.length);
  const supabase = options.supabase ?? createStorageClient();

  if (!supabase) {
    diagnostics.mediaPersistenceEnabled = false;
    diagnostics.status = diagnostics.imagesFound > 0 ? 'configuration_error' : 'no_images';
    diagnostics.failures.push({
      url: scrape.sourceUrl,
      stage: 'configuration',
      reason: 'missing_supabase_service_role_key',
    });
    diagnostics.imagesFailed = diagnostics.failures.length;

    const result = attachMediaImportDiagnostics(scrape, diagnostics);
    if (options.requireStorage && diagnostics.imagesFound > 0) {
      throw new MediaImportConfigurationError(diagnostics);
    }
    return result;
  }

  if (!candidates.length) {
    diagnostics.status = 'no_images';
    return attachMediaImportDiagnostics(scrape, diagnostics);
  }

  const storedAssets: StoredImageAsset[] = [];

  for (const candidate of candidates) {
    diagnostics.imagesDownloadAttempted += 1;

    let fetched: ImageFetchResult;
    try {
      fetched = await fetchImage(candidate.originalUrl, {
        skipHostSafetyCheck: options.skipHostSafetyCheck,
      });
      diagnostics.imagesDownloaded += 1;
    } catch (error) {
      diagnostics.failures.push(failureFromError(candidate.originalUrl, 'download', error));
      continue;
    }

    const path = storagePathFor(scrape, candidate.originalUrl, fetched, options);
    diagnostics.imagesUploadAttempted += 1;

    try {
      const { error } = await supabase.storage.from(bucket).upload(path, fetched.body, {
        contentType: fetched.contentType,
        upsert: true,
        cacheControl: '31536000',
      });

      if (error) throw error;
      diagnostics.imagesUploaded += 1;
    } catch (error) {
      diagnostics.failures.push(failureFromError(candidate.originalUrl, 'upload', error, {
        contentType: fetched.contentType,
        bytes: fetched.fileSizeBytes,
      }));
      continue;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    if (!data.publicUrl) {
      diagnostics.failures.push({
        url: candidate.originalUrl,
        stage: 'public_url',
        reason: 'missing_public_url',
        contentType: fetched.contentType,
        bytes: fetched.fileSizeBytes,
      });
      continue;
    }

    let delivery: ImageDeliveryVerification;
    try {
      delivery = await verifyStoredImageUrl(data.publicUrl);
      diagnostics.imagesBrowserLoadable += 1;
    } catch (error) {
      diagnostics.failures.push(failureFromError(candidate.originalUrl, 'public_url', error, {
        contentType: fetched.contentType,
        bytes: fetched.fileSizeBytes,
      }));
      continue;
    }

    storedAssets.push({
      originalUrl: candidate.originalUrl,
      storedUrl: data.publicUrl,
      path,
      storagePath: path,
      bucket,
      contentType: fetched.contentType,
      fileSizeBytes: fetched.fileSizeBytes,
      sha256: fetched.sha256,
      deliveryStatus: delivery.status,
      deliveryContentType: delivery.contentType,
      deliveryBytes: delivery.bytes,
      sourcePageUrl: candidate.sourcePageUrl,
      altText: candidate.altText,
      caption: candidate.caption,
    });
  }

  diagnostics.imagesStored = storedAssets.length;
  diagnostics.imagesFailed = diagnostics.failures.length;
  diagnostics.imagesSkipped = Math.max(0, candidates.length - storedAssets.length - diagnostics.imagesFailed);
  diagnostics.status =
    storedAssets.length === candidates.length
      ? 'stored'
      : storedAssets.length > 0
        ? 'partial'
        : 'failed';
  diagnostics.storedAssets = storedAssets;

  const transformed = storedAssets.length
    ? (replaceImageUrls(
        scrape,
        new Map(storedAssets.map((asset) => [asset.originalUrl, asset.storedUrl])),
      ) as CatteryWebsiteScrapeResult)
    : scrape;

  return attachMediaImportDiagnostics(transformed, diagnostics, storedAssets);
}

function createStorageClient(): MediaStorageClient | null {
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

function createDiagnostics(
  scrape: CatteryWebsiteScrapeResult,
  bucket: string,
  candidateCount: number,
): MediaImportDiagnostics {
  return {
    status: 'failed',
    mediaPersistenceEnabled: true,
    storageBucket: bucket,
    supabaseProjectRef: supabaseProjectRef(),
    maxImageBytes: MAX_IMAGE_BYTES,
    imagesFound: scrape.crawl?.imagesFound ?? scrape.images?.length ?? candidateCount,
    imagesCandidates: candidateCount,
    imagesDownloadAttempted: 0,
    imagesDownloaded: 0,
    imagesUploadAttempted: 0,
    imagesUploaded: 0,
    imagesStored: 0,
    imagesBrowserLoadable: 0,
    mediaRecordsAttempted: 0,
    mediaRecordsCreated: 0,
    mediaRecordsFailed: 0,
    imagesFailed: 0,
    imagesSkipped: 0,
    failures: [],
    storedAssets: [],
  };
}

async function verifyStoredImageUrl(rawUrl: string): Promise<ImageDeliveryVerification> {
  const head = await fetchPublicImage(rawUrl, 'HEAD').catch((error) => {
    if (error instanceof ImageImportError) return null;
    throw error;
  });

  if (head?.ok) {
    const contentType = contentTypeFromResponse(head);
    const bytes = Number(head.headers.get('content-length') ?? 0);
    if (isAllowedImageType(contentType) && bytes > 0 && bytes <= MAX_IMAGE_BYTES) {
      return { status: head.status, contentType, bytes };
    }
  }

  const response = await fetchPublicImage(rawUrl, 'GET');
  if (!response.ok) {
    throw new ImageImportError(`PUBLIC_IMAGE_HTTP_${response.status}`, {
      reason: `http_${response.status}`,
      status: response.status,
      contentType: contentTypeFromResponse(response),
    });
  }

  const contentType = contentTypeFromResponse(response);
  if (!isAllowedImageType(contentType)) {
    throw new ImageImportError('PUBLIC_IMAGE_UNSUPPORTED_TYPE', {
      reason: 'unsupported_image_type',
      status: response.status,
      contentType,
    });
  }

  const contentLength = Number(response.headers.get('content-length') ?? 0);
  if (contentLength > MAX_IMAGE_BYTES) {
    throw new ImageImportError('PUBLIC_IMAGE_TOO_LARGE', {
      reason: 'image_too_large',
      status: response.status,
      contentType,
      bytes: contentLength,
      maxBytes: MAX_IMAGE_BYTES,
    });
  }

  const body = Buffer.from(await response.arrayBuffer());
  if (!body.byteLength || !looksLikeImageBytes(contentType, body)) {
    throw new ImageImportError('PUBLIC_IMAGE_INVALID_BODY', {
      reason: 'invalid_image_body',
      status: response.status,
      contentType,
      bytes: body.byteLength,
    });
  }

  return { status: response.status, contentType, bytes: body.byteLength };
}

async function fetchPublicImage(rawUrl: string, method: 'HEAD' | 'GET') {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PUBLIC_URL_VERIFY_TIMEOUT_MS);
  try {
    return await fetch(rawUrl, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif,*/*;q=0.5',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function contentTypeFromResponse(response: Response) {
  return String(response.headers.get('content-type') ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase();
}

function supabaseProjectRef() {
  const supabaseUrl = readEnvValue('VITE_SUPABASE_URL', 'SUPABASE_URL', 'SUPABASE_PROJECT_URL');
  if (!supabaseUrl) return undefined;
  try {
    const hostname = new URL(supabaseUrl).hostname;
    return hostname.endsWith('.supabase.co') ? hostname.split('.')[0] : undefined;
  } catch {
    return undefined;
  }
}

function imageCandidatesFromScrape(scrape: CatteryWebsiteScrapeResult): ImageImportCandidate[] {
  const candidates = new Map<string, ImageImportCandidate>();
  const metadata = pageImageMetadataByUrl(scrape);

  const add = (url: string, candidate: Partial<ImageImportCandidate> = {}) => {
    if (!isLikelyImportImageUrl(url, [])) return;
    const existing = candidates.get(url);
    const known = metadata.get(url);
    candidates.set(url, {
      originalUrl: url,
      sourcePageUrl: existing?.sourcePageUrl ?? candidate.sourcePageUrl ?? known?.sourcePageUrl,
      altText: existing?.altText ?? candidate.altText ?? known?.altText,
      caption: existing?.caption ?? candidate.caption ?? known?.caption,
    });
  };

  const visit = (value: unknown, path: string[]) => {
    if (!value) return;
    if (typeof value === 'string') {
      if (isLikelyImportImageUrl(value, path)) add(value);
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

  for (const page of scrape.crawl?.pages ?? []) {
    for (const image of page.images ?? []) {
      add(image.url, {
        sourcePageUrl: image.sourcePageUrl ?? page.url,
        altText: image.altText,
        caption: image.caption,
      });
    }
  }

  for (const block of scrape.siteContentLibrary?.blocks ?? []) {
    for (const image of block.images ?? []) {
      add(image.url, { sourcePageUrl: block.sourceUrl, caption: image.caption });
    }
    for (const item of block.items ?? []) {
      if (item.image) add(item.image, { sourcePageUrl: block.sourceUrl });
    }
  }

  return [...candidates.values()];
}

function pageImageMetadataByUrl(scrape: CatteryWebsiteScrapeResult) {
  const metadata = new Map<string, { altText?: string; caption?: string; sourcePageUrl?: string }>();
  for (const page of scrape.crawl?.pages ?? []) {
    for (const image of page.images ?? []) {
      metadata.set(image.url, {
        altText: image.altText,
        caption: image.caption,
        sourcePageUrl: image.sourcePageUrl ?? page.url,
      });
    }
  }
  return metadata;
}

function isLikelyImportImageUrl(value: string, path: string[]) {
  if (!isHttpUrl(value) || isCatstaysStorageUrl(value)) return false;

  const joinedPath = path.join('.').toLowerCase();
  const lowerValue = value.toLowerCase();
  if (
    joinedPath.endsWith('sourceurl') ||
    joinedPath.endsWith('source_url') ||
    joinedPath.endsWith('sourcepageurl') ||
    joinedPath.endsWith('source_page_url') ||
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
    path.length === 0 ||
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

async function fetchImage(
  rawUrl: string,
  options: { skipHostSafetyCheck?: boolean } = {},
): Promise<ImageFetchResult> {
  let currentUrl = new URL(rawUrl);

  for (let redirectCount = 0; redirectCount <= MAX_IMAGE_REDIRECTS; redirectCount += 1) {
    if (currentUrl.protocol !== 'http:' && currentUrl.protocol !== 'https:') {
      throw new ImageImportError('BAD_IMAGE_URL', { reason: 'bad_image_url' });
    }
    if (net.isIP(currentUrl.hostname)) {
      throw new ImageImportError('DIRECT_IMAGE_IP', { reason: 'direct_image_ip' });
    }

    if (!options.skipHostSafetyCheck) await assertSafePublicHost(currentUrl.hostname);

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

    if (!response.ok) {
      throw new ImageImportError(`IMAGE_HTTP_${response.status}`, {
        reason: `http_${response.status}`,
        status: response.status,
      });
    }

    const contentType = String(response.headers.get('content-type') ?? '')
      .split(';')[0]
      .trim()
      .toLowerCase();
    if (!isAllowedImageType(contentType)) {
      throw new ImageImportError('UNSUPPORTED_IMAGE_TYPE', {
        reason: 'unsupported_image_type',
        status: response.status,
        contentType,
      });
    }

    const contentLength = Number(response.headers.get('content-length') ?? 0);
    if (contentLength > MAX_IMAGE_BYTES) {
      throw new ImageImportError('IMAGE_TOO_LARGE', {
        reason: 'image_too_large',
        status: response.status,
        contentType,
        bytes: contentLength,
        maxBytes: MAX_IMAGE_BYTES,
      });
    }

    const body = Buffer.from(await response.arrayBuffer());
    if (body.byteLength > MAX_IMAGE_BYTES) {
      throw new ImageImportError('IMAGE_TOO_LARGE', {
        reason: 'image_too_large',
        status: response.status,
        contentType,
        bytes: body.byteLength,
        maxBytes: MAX_IMAGE_BYTES,
      });
    }
    if (!looksLikeImageBytes(contentType, body)) {
      throw new ImageImportError('INVALID_IMAGE_BODY', {
        reason: 'invalid_image_body',
        status: response.status,
        contentType,
        bytes: body.byteLength,
      });
    }

    const sha256 = hashBuffer(body);
    return {
      body,
      contentType,
      finalUrl: currentUrl.href,
      fileSizeBytes: body.byteLength,
      sha256,
    };
  }

  throw new ImageImportError('TOO_MANY_IMAGE_REDIRECTS', {
    reason: 'too_many_image_redirects',
  });
}

async function assertSafePublicHost(hostname: string): Promise<void> {
  const results = await lookup(hostname, { all: true });
  if (!results.length) throw new ImageImportError('IMAGE_HOST_NOT_FOUND', { reason: 'host_not_found' });
  if (results.some((result) => isPrivateIp(result.address))) {
    throw new ImageImportError('PRIVATE_IMAGE_IP', { reason: 'private_image_ip' });
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

function looksLikeImageBytes(contentType: string, body: Buffer) {
  const head = body.subarray(0, 16);
  const textHead = head.toString('utf8').trimStart().toLowerCase();
  if (textHead.startsWith('<!doctype') || textHead.startsWith('<html') || textHead.startsWith('<?xml')) {
    return false;
  }
  if (contentType === 'image/jpeg') return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  if (contentType === 'image/png') return head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (contentType === 'image/gif') return head.subarray(0, 4).toString('ascii') === 'GIF8';
  if (contentType === 'image/webp') return head.subarray(0, 4).toString('ascii') === 'RIFF' && head.subarray(8, 12).toString('ascii') === 'WEBP';
  if (contentType === 'image/avif') return head.subarray(4, 8).toString('ascii') === 'ftyp';
  return false;
}

function storagePathFor(
  scrape: CatteryWebsiteScrapeResult,
  imageUrl: string,
  fetched: ImageFetchResult,
  options: PersistScrapedImagesOptions,
) {
  const sourceHost = safePathSegment(scrape.sourceHost || hostFromUrl(scrape.sourceUrl) || 'source');
  const catteryId = safePathSegment(options.catteryId || 'unassigned');
  const importKey = safePathSegment(
    options.contentSourceId || options.importId || hash(scrape.sourceUrl).slice(0, 16),
  );
  const imageName = safeImageName(imageUrl);
  return `website-imports/${catteryId}/${importKey}/${sourceHost}/${fetched.sha256.slice(0, 24)}-${imageName}${extensionFor(fetched.contentType)}`;
}

function safePathSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'source';
}

function safeImageName(imageUrl: string) {
  try {
    const pathname = new URL(imageUrl).pathname;
    const base = pathname.split('/').filter(Boolean).pop() || 'image';
    return safePathSegment(base.replace(/\.[a-z0-9]+$/i, '')) || 'image';
  } catch {
    return 'image';
  }
}

function hostFromUrl(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return '';
  }
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

function hashBuffer(value: Buffer) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function failureFromError(
  url: string,
  stage: MediaImportFailure['stage'],
  error: unknown,
  fallback: Partial<MediaImportFailure> = {},
): MediaImportFailure {
  if (error instanceof ImageImportError) {
    return {
      url,
      stage,
      ...fallback,
      ...error.details,
      reason: error.details.reason || error.message,
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  return {
    url,
    stage,
    ...fallback,
    reason: normalizeReason(message),
  };
}

function normalizeReason(message: string) {
  return message
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'unknown_error';
}

function attachMediaImportDiagnostics(
  scrape: CatteryWebsiteScrapeResult,
  diagnostics: MediaImportDiagnostics,
  storedAssets: StoredImageAsset[] = diagnostics.storedAssets,
) {
  const previousSettings = scrape.websiteSettings ?? {};
  const previousReport = previousSettings['importReport'] as Record<string, unknown> | undefined;
  const importReport = {
    ...previousReport,
    pagesFound: scrape.crawl?.pagesFound ?? previousReport?.pagesFound ?? 1,
    pagesProcessed: scrape.crawl?.pagesProcessed ?? previousReport?.pagesProcessed ?? 1,
    pagesFailed: scrape.crawl?.pagesFailed ?? previousReport?.pagesFailed ?? 0,
    imagesFound: diagnostics.imagesFound,
    imagesCandidates: diagnostics.imagesCandidates,
    imagesDownloadAttempted: diagnostics.imagesDownloadAttempted,
    imagesDownloaded: diagnostics.imagesDownloaded,
    imagesUploadAttempted: diagnostics.imagesUploadAttempted,
    imagesUploaded: diagnostics.imagesUploaded,
    imagesStored: diagnostics.imagesStored,
    imagesImported: diagnostics.imagesStored,
    imagesBrowserLoadable: diagnostics.imagesBrowserLoadable,
    mediaRecordsAttempted: diagnostics.mediaRecordsAttempted,
    mediaRecordsCreated: diagnostics.mediaRecordsCreated,
    mediaRecordsFailed: diagnostics.mediaRecordsFailed,
    imagesFailed: diagnostics.imagesFailed,
    mediaImportStatus: diagnostics.status,
    contentBlocks: scrape.siteContentLibrary?.blocks?.length ?? previousReport?.contentBlocks ?? 0,
  };
  const websiteSettings = {
    ...previousSettings,
    importedImageAssets: storedAssets,
    mediaImport: diagnostics,
    importReport,
  };

  return {
    ...scrape,
    websiteSettings,
    demoCattery: {
      ...((scrape as unknown as { demoCattery?: Record<string, unknown> }).demoCattery ?? {}),
      website_settings: websiteSettings,
    },
    mediaImport: diagnostics,
  } as CatteryWebsiteScrapeResult;
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
