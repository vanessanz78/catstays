import { Router, type IRouter } from 'express';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { scrapeCatteryWebsite, type CatteryWebsiteScrapeResult } from '../lib/catteryWebsiteScraper';

const router: IRouter = Router();
const WEBSITE_MEDIA_BUCKET = 'catstays-media';
const MAX_REMOTE_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_SCRAPE_IMAGE_COPIES = 48;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
type StorageServiceClient = NonNullable<ReturnType<typeof createStorageServiceClient>>;

class ImageCopyError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, code: string, detail?: string) {
    super(code);
    this.status = status;
    this.detail = detail;
  }
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

const supabaseUrl = readEnvValue('VITE_SUPABASE_URL');
const supabaseServiceKey = readEnvValue('SUPABASE_SERVICE_ROLE_KEY');

router.post('/website/scrape', async (req, res) => {
  const { url } = req.body as { url?: string };

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'url is required' });
    return;
  }

  try {
    const scraped = await scrapeCatteryWebsite(url);
    const serviceClient = createStorageServiceClient();
    const result = serviceClient ? await copyScrapeImagesToStorage(scraped, serviceClient) : scraped;
    res.json(result);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === 'URL_REQUIRED' || msg === 'INVALID_URL') {
      res.status(400).json({ error: 'Invalid URL' });
    } else if (msg === 'BAD_SCHEME') {
      res.status(400).json({ error: 'Only http and https URLs are supported' });
    } else if (msg === 'DIRECT_IP' || msg === 'PRIVATE_IP') {
      res.status(400).json({ error: 'That URL is not accessible' });
    } else if (msg === 'DNS_FAILED') {
      res.status(422).json({
        error: "We couldn't reach that site — the domain could not be resolved.",
      });
    } else if (msg === 'TIMEOUT') {
      res.status(422).json({
        error: "We couldn't reach that site — it took too long to respond.",
      });
    } else if (msg.startsWith('HTTP_')) {
      res.status(422).json({
        error: `We couldn't reach that site — it returned an error (${msg.replace('HTTP_', 'HTTP ')}).`,
      });
    } else if (msg === 'NOT_HTML') {
      res.status(422).json({
        error: 'That URL does not point to a web page we can read.',
      });
    } else if (msg === 'NO_USEFUL_CONTENT') {
      res.status(422).json({
        error:
          "We couldn't extract useful content from that site — you can start from scratch instead.",
      });
    } else {
      res.status(422).json({
        error: "We couldn't reach that site — you can start from scratch instead.",
      });
    }
    return;
  }
});

router.post('/website/copy-image', async (req, res) => {
  const { imageUrl } = req.body as { imageUrl?: string };
  const serviceClient = createStorageServiceClient();

  if (!serviceClient) {
    res.status(503).json({ error: 'SUPABASE_STORAGE_NOT_CONFIGURED' });
    return;
  }

  try {
    const copied = await copyRemoteImageToStorage(serviceClient, imageUrl);
    res.json(copied);
  } catch (error) {
    const failure = imageCopyErrorResponse(error);
    res.status(failure.status).json(failure.body);
  }
});

router.post('/website/chat', async (req, res) => {
  const { question, businessName, knowledge, history } = req.body as {
    question?: string;
    businessName?: string;
    knowledge?: unknown;
    history?: Array<{ sender?: 'user' | 'bot'; text?: string }>;
  };

  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: 'question is required' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'OPENAI_NOT_CONFIGURED' });
    return;
  }

  const model = process.env.OPENAI_CHAT_MODEL || 'gpt-4.1-mini';
  const compactKnowledge = buildCompactKnowledge(knowledge);
  const recentHistory = Array.isArray(history)
    ? history
        .filter((message) => message?.text && (message.sender === 'user' || message.sender === 'bot'))
        .slice(-6)
        .map((message) => ({
          role: message.sender === 'user' ? 'user' : 'assistant',
          content: message.text,
        }))
    : [];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are the website chat assistant for a cat boarding business. Answer warmly and clearly using only the supplied site content. If the site content does not contain enough information, do not guess. Instead, ask the customer for their email so the owner can reply within 24 hours. Return strict JSON with keys: answer (string), ownerFollowUp (boolean). Keep answers under 140 words unless listing room or service options.',
          },
          {
            role: 'system',
            content: `Business: ${String(businessName || 'CatStays')}\nSite content:\n${JSON.stringify(compactKnowledge)}`,
          },
          ...recentHistory,
          {
            role: 'user',
            content: question,
          },
        ],
      }),
    });

    if (!response.ok) {
      const payload = await response.text();
      res.status(502).json({ error: 'OPENAI_REQUEST_FAILED', detail: payload.slice(0, 500) });
      return;
    }

    const payload = await response.json() as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      res.status(502).json({ error: 'OPENAI_EMPTY_RESPONSE' });
      return;
    }

    const parsed = JSON.parse(content) as { answer?: string; ownerFollowUp?: boolean };
    res.json({
      answer: typeof parsed.answer === 'string' ? parsed.answer : '',
      ownerFollowUp: Boolean(parsed.ownerFollowUp),
    });
  } catch (error) {
    res.status(502).json({ error: 'OPENAI_CHAT_ERROR', detail: (error as Error).message });
  }
});

async function copyScrapeImagesToStorage(result: CatteryWebsiteScrapeResult, serviceClient: StorageServiceClient): Promise<CatteryWebsiteScrapeResult> {
  const imageUrls = collectScrapeImageUrls(result).slice(0, MAX_SCRAPE_IMAGE_COPIES);
  if (!imageUrls.length) return result;

  const replacements = new Map<string, string>();
  try {
    await ensureWebsiteMediaBucket(serviceClient);
  } catch {
    return result;
  }

  for (const imageUrl of imageUrls) {
    try {
      const copied = await copyRemoteImageToStorage(serviceClient, imageUrl, false);
      replacements.set(imageUrl, copied.url);
    } catch {
      // Keep the rest of the import usable if a single owner-site image blocks hotlinking.
    }
  }

  if (!replacements.size) return result;
  return replaceStoredImageReferences(result, replacements) as CatteryWebsiteScrapeResult;
}

async function copyRemoteImageToStorage(serviceClient: StorageServiceClient, imageUrl: unknown, ensureBucket = true) {
  let remoteUrl: URL;
  try {
    remoteUrl = parseRemoteImageUrl(imageUrl);
  } catch (error) {
    throw new ImageCopyError(400, (error as Error).message);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(remoteUrl.href, {
      headers: {
        'User-Agent': 'CatStaysImageImporter/1.0',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ImageCopyError(422, `IMAGE_FETCH_FAILED_${response.status}`);
    }

    const contentType = contentTypeFromResponse(response);
    if (!SUPPORTED_IMAGE_TYPES.includes(contentType)) {
      throw new ImageCopyError(415, 'UNSUPPORTED_IMAGE_TYPE');
    }

    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_REMOTE_IMAGE_BYTES) {
      throw new ImageCopyError(413, 'IMAGE_TOO_LARGE');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.byteLength) {
      throw new ImageCopyError(422, 'EMPTY_IMAGE');
    }
    if (buffer.byteLength > MAX_REMOTE_IMAGE_BYTES) {
      throw new ImageCopyError(413, 'IMAGE_TOO_LARGE');
    }

    if (ensureBucket) await ensureWebsiteMediaBucket(serviceClient);

    const extension = extensionForImageType(contentType);
    const path = `website-imports/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    const { error: uploadError } = await serviceClient.storage
      .from(WEBSITE_MEDIA_BUCKET)
      .upload(path, buffer, {
        contentType,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      throw new ImageCopyError(502, 'IMAGE_UPLOAD_FAILED', uploadError.message);
    }

    return {
      url: publicWebsiteImageUrl(serviceClient, path, contentType),
      path,
      sourceUrl: remoteUrl.href,
      owned: true,
    };
  } catch (error) {
    if (error instanceof ImageCopyError) throw error;
    const message = (error as Error).name === 'AbortError' ? 'IMAGE_FETCH_TIMEOUT' : 'IMAGE_COPY_FAILED';
    throw new ImageCopyError(422, message, (error as Error).message);
  } finally {
    clearTimeout(timeout);
  }
}

function imageCopyErrorResponse(error: unknown) {
  if (error instanceof ImageCopyError) {
    return {
      status: error.status,
      body: error.detail ? { error: error.message, detail: error.detail } : { error: error.message },
    };
  }

  return {
    status: 422,
    body: { error: 'IMAGE_COPY_FAILED', detail: (error as Error).message },
  };
}

function publicWebsiteImageUrl(serviceClient: StorageServiceClient, path: string, contentType: string) {
  if (contentType === 'image/gif' || contentType === 'image/avif') {
    const { data } = serviceClient.storage.from(WEBSITE_MEDIA_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  const { data } = serviceClient.storage.from(WEBSITE_MEDIA_BUCKET).getPublicUrl(path, {
    transform: {
      width: 1600,
      quality: 82,
      resize: 'contain',
    },
  });
  return data.publicUrl;
}

function createStorageServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function parseRemoteImageUrl(rawUrl: unknown) {
  if (!rawUrl || typeof rawUrl !== 'string') throw new Error('IMAGE_URL_REQUIRED');

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error('INVALID_IMAGE_URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('UNSUPPORTED_IMAGE_URL');
  if (isBlockedRemoteHost(parsed.hostname)) throw new Error('IMAGE_URL_NOT_ACCESSIBLE');
  return parsed;
}

function isBlockedRemoteHost(hostname: string) {
  const host = hostname.toLowerCase();
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host === '0.0.0.0' ||
    host === '::1' ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  );
}

function collectScrapeImageUrls(value: unknown, urls = new Set<string>()): string[] {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (isCopyableScrapeImageUrl(trimmed)) urls.add(trimmed);
    return Array.from(urls);
  }

  if (Array.isArray(value)) {
    for (const item of value) collectScrapeImageUrls(item, urls);
    return Array.from(urls);
  }

  if (value && typeof value === 'object') {
    for (const item of Object.values(value as Record<string, unknown>)) {
      collectScrapeImageUrls(item, urls);
    }
  }

  return Array.from(urls);
}

function isCopyableScrapeImageUrl(rawUrl: string) {
  if (!rawUrl || /^data:/i.test(rawUrl)) return false;

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) return false;
  if (isBlockedRemoteHost(parsed.hostname) || isStoredWebsiteImageUrl(parsed)) return false;

  const urlText = `${parsed.hostname}${parsed.pathname}${parsed.search}`;
  const decoded = safeDecodeURIComponent(urlText).toLowerCase();
  if (/\.svg(?:$|[?#/])|favicon|apple-touch-icon/i.test(decoded)) return false;
  if (/\.(?:jpe?g|png|webp|gif)(?:$|[?#/])/.test(decoded)) return true;
  return /static\.wixstatic\.com|squarespace-cdn\.com|cloudinary\.com|wp-content|uploads|\/media\/|\/images?\//i.test(decoded);
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isStoredWebsiteImageUrl(parsedUrl: URL) {
  if (!supabaseUrl) return false;

  try {
    const storageHost = new URL(supabaseUrl).hostname;
    return (
      parsedUrl.hostname === storageHost &&
      (parsedUrl.pathname.includes('/storage/v1/') || parsedUrl.pathname.includes('/render/image/')) &&
      parsedUrl.pathname.includes(`/${WEBSITE_MEDIA_BUCKET}/`)
    );
  } catch {
    return false;
  }
}

function replaceStoredImageReferences(value: unknown, replacements: Map<string, string>): unknown {
  if (typeof value === 'string') return replacements.get(value) ?? value;
  if (Array.isArray(value)) return value.map((item) => replaceStoredImageReferences(item, replacements));
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      replaceStoredImageReferences(item, replacements),
    ]),
  );
}

function contentTypeFromResponse(response: { headers: { get(name: string): string | null } }) {
  return (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
}

function extensionForImageType(contentType: string) {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/avif') return 'avif';
  if (contentType === 'image/gif') return 'gif';
  return 'jpg';
}

async function ensureWebsiteMediaBucket(serviceClient: ReturnType<typeof createClient>) {
  const { error } = await serviceClient.storage.createBucket(WEBSITE_MEDIA_BUCKET, {
    public: true,
    allowedMimeTypes: SUPPORTED_IMAGE_TYPES,
    fileSizeLimit: MAX_REMOTE_IMAGE_BYTES,
  });

  if (error && !/already exists|duplicate|resource already exists/i.test(error.message)) {
    throw error;
  }
}

function buildCompactKnowledge(knowledge: unknown) {
  if (!knowledge || typeof knowledge !== 'object') return {};

  const input = knowledge as Record<string, any>;
  return {
    business: input.business,
    footer: input.footer,
    booking: input.booking,
    about: input.about,
    whyChoose: input.whyChoose,
    facilities: input.facilities,
    owner: input.owner,
    suites: Array.isArray(input.suites) ? input.suites.slice(0, 8) : [],
    services: Array.isArray(input.services) ? input.services.slice(0, 8) : [],
    testimonials: Array.isArray(input.testimonials) ? input.testimonials.slice(0, 6) : [],
    faqs: Array.isArray(input.faqs) ? input.faqs.slice(0, 12) : [],
    locationDetails: input.locationDetails,
    contentLibrary: input.contentLibrary,
  };
}

export default router;
