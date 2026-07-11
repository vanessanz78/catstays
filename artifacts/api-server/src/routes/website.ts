import { Router, type IRouter } from 'express';
import {
  fetchSourceWebsitePreviewAsset,
  fetchSourceWebsitePreviewHtml,
  scrapeCatteryWebsite,
} from '../lib/catteryWebsiteScraper';

const router: IRouter = Router();

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

router.get('/website/source-preview', async (req, res) => {
  const url = typeof req.query.url === 'string' ? req.query.url : '';

  if (!url) {
    res.status(400).send('url is required');
    return;
  }

  try {
    const result = await fetchSourceWebsitePreviewHtml(url);
    res
      .status(200)
      .set('Content-Type', 'text/html; charset=utf-8')
      .set('Cache-Control', 'no-store')
      .send(result.html);
  } catch {
    res.status(422).send('Unable to load the source website preview.');
  }
});

router.get('/website/source-asset', async (req, res) => {
  const url = typeof req.query.url === 'string' ? req.query.url : '';

  if (!url) {
    res.status(400).send('url is required');
    return;
  }

  try {
    const result = await fetchSourceWebsitePreviewAsset(url);
    res
      .status(200)
      .set('Content-Type', result.contentType || 'application/octet-stream')
      .set('Access-Control-Allow-Origin', '*')
      .set('Cache-Control', 'public, max-age=300')
      .send(result.body);
  } catch {
    res.status(404).send('Asset not available.');
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
