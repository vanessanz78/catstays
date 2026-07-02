import { Router, type IRouter } from 'express';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { scrapeCatteryWebsite } from '../lib/catteryWebsiteScraper';

const router: IRouter = Router();
const WEBSITE_MEDIA_BUCKET = 'catstays-media';
const MAX_REMOTE_IMAGE_BYTES = 8 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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
    const result = await scrapeCatteryWebsite(url);
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

  let remoteUrl: URL;
  try {
    remoteUrl = parseRemoteImageUrl(imageUrl);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(remoteUrl.href, {
      headers: {
        'User-Agent': 'CatStaysImageImporter/1.0',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      res.status(422).json({ error: `IMAGE_FETCH_FAILED_${response.status}` });
      return;
    }

    const contentType = contentTypeFromResponse(response);
    if (!SUPPORTED_IMAGE_TYPES.includes(contentType)) {
      res.status(415).json({ error: 'UNSUPPORTED_IMAGE_TYPE' });
      return;
    }

    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_REMOTE_IMAGE_BYTES) {
      res.status(413).json({ error: 'IMAGE_TOO_LARGE' });
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.byteLength || buffer.byteLength > MAX_REMOTE_IMAGE_BYTES) {
      res.status(buffer.byteLength ? 413 : 422).json({ error: buffer.byteLength ? 'IMAGE_TOO_LARGE' : 'EMPTY_IMAGE' });
      return;
    }

    await ensureWebsiteMediaBucket(serviceClient);

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
      res.status(502).json({ error: 'IMAGE_UPLOAD_FAILED', detail: uploadError.message });
      return;
    }

    const { data } = serviceClient.storage.from(WEBSITE_MEDIA_BUCKET).getPublicUrl(path);
    res.json({
      url: data.publicUrl,
      path,
      sourceUrl: remoteUrl.href,
      owned: true,
    });
  } catch (error) {
    const message = (error as Error).name === 'AbortError' ? 'IMAGE_FETCH_TIMEOUT' : 'IMAGE_COPY_FAILED';
    res.status(422).json({ error: message, detail: (error as Error).message });
  } finally {
    clearTimeout(timeout);
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

function contentTypeFromResponse(response: { headers: { get(name: string): string | null } }) {
  return (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
}

function extensionForImageType(contentType: string) {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
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
