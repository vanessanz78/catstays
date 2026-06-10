import { Router, type IRouter } from 'express';
import { parse } from 'node-html-parser';
import https from 'https';
import http from 'http';
import dns from 'dns';
import net from 'net';

const router: IRouter = Router();

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 1_000_000; // 1 MB cap

/**
 * Returns true if the given IPv4/IPv6 address is in a private, loopback,
 * link-local, or otherwise reserved range that must not be reached via SSRF.
 */
function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    return (
      a === 10 ||                                      // 10.0.0.0/8
      a === 127 ||                                     // 127.0.0.0/8 loopback
      (a === 172 && b >= 16 && b <= 31) ||             // 172.16.0.0/12
      (a === 192 && b === 168) ||                      // 192.168.0.0/16
      (a === 169 && b === 254) ||                      // 169.254.0.0/16 link-local / metadata
      a === 0 ||                                       // 0.0.0.0/8
      a === 100 && b >= 64 && b <= 127 ||              // 100.64.0.0/10 shared address space
      a === 192 && b === 0 && parts[2] === 0 ||        // 192.0.0.0/24 IETF protocol
      a === 198 && (b === 18 || b === 19) ||           // 198.18.0.0/15 benchmarking
      a === 240                                        // 240.0.0.0/4 reserved
    );
  }

  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    return (
      lower === '::1' ||           // loopback
      lower.startsWith('fc') ||    // unique local
      lower.startsWith('fd') ||    // unique local
      lower.startsWith('fe80') ||  // link-local
      lower === '::' ||
      lower.startsWith('::ffff:')  // IPv4-mapped — block these too; recheck payload if needed
    );
  }

  return false;
}

/**
 * Resolves the hostname and rejects if it maps to a private/reserved address.
 * This prevents SSRF via DNS rebinding or misleading hostnames.
 */
function resolveSafeIp(hostname: string): Promise<string> {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, { family: 4 }, (err, address) => {
      if (err) {
        reject(new Error('DNS_FAILED'));
        return;
      }
      if (isPrivateIp(address)) {
        reject(new Error('PRIVATE_IP'));
        return;
      }
      resolve(address);
    });
  });
}

const MAX_REDIRECTS = 5;

function fetchOnce(targetUrl: URL, resolvedIp: string): Promise<{ status: number; contentType: string; location: string; body: string }> {
  return new Promise((resolve, reject) => {
    const isHttps = targetUrl.protocol === 'https:';
    const port = targetUrl.port ? Number(targetUrl.port) : isHttps ? 443 : 80;
    const module_ = isHttps ? https : http;

    const options = {
      hostname: resolvedIp,
      port,
      path: targetUrl.pathname + targetUrl.search,
      method: 'GET' as const,
      headers: {
        Host: targetUrl.hostname,
        'User-Agent':
          'Mozilla/5.0 (compatible; CatStays-scraper/1.0; +https://catstays.app)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en',
        Connection: 'close',
      },
      servername: targetUrl.hostname,
      timeout: FETCH_TIMEOUT_MS,
    };

    const req = module_.request(options, res => {
      const status = res.statusCode ?? 0;
      const contentType = res.headers['content-type'] ?? '';
      const location = (res.headers['location'] as string) ?? '';

      if (status >= 300 && status < 400) {
        req.destroy();
        resolve({ status, contentType, location, body: '' });
        return;
      }

      if (status < 200 || status >= 400) {
        req.destroy();
        reject(new TypeError(`HTTP_${status}`));
        return;
      }

      res.setEncoding('utf8');
      let body = '';
      res.on('data', chunk => {
        body += chunk;
        if (body.length > MAX_BYTES) {
          req.destroy();
          resolve({ status, contentType, location, body });
        }
      });
      res.on('end', () => resolve({ status, contentType, location, body }));
    });

    req.on('timeout', () => { req.destroy(); reject(new TypeError('TIMEOUT')); });
    req.on('error', err => reject(err));
    req.end();
  });
}

async function fetchHtml(startUrl: URL, startIp: string): Promise<string> {
  let currentUrl = startUrl;
  let currentIp = startIp;
  let redirects = 0;

  while (redirects <= MAX_REDIRECTS) {
    const result = await fetchOnce(currentUrl, currentIp);

    if (result.status >= 300 && result.status < 400) {
      if (!result.location) throw new TypeError('REDIRECT_NO_LOCATION');
      redirects++;
      if (redirects > MAX_REDIRECTS) throw new TypeError('TOO_MANY_REDIRECTS');

      let nextUrl: URL;
      try {
        nextUrl = new URL(result.location, currentUrl.href);
      } catch {
        throw new TypeError('REDIRECT_INVALID_URL');
      }

      if (nextUrl.protocol !== 'http:' && nextUrl.protocol !== 'https:') {
        throw new TypeError('REDIRECT_BAD_SCHEME');
      }
      if (net.isIP(nextUrl.hostname)) {
        throw new Error('PRIVATE_IP');
      }

      // Re-validate SSRF on each redirect target
      currentIp = await resolveSafeIp(nextUrl.hostname);
      currentUrl = nextUrl;
      continue;
    }

    if (!result.contentType.includes('text/html')) throw new TypeError('NOT_HTML');
    return result.body;
  }

  throw new TypeError('TOO_MANY_REDIRECTS');
}

function extractPhone(text: string): string {
  const match = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
  return match ? match[1].trim() : '';
}

function extractEmail(text: string): string {
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : '';
}

function absoluteUrl(src: string, base: string): string {
  if (!src) return '';
  try {
    return new URL(src, base).href;
  } catch {
    return '';
  }
}

router.post('/website/scrape', async (req, res) => {
  const { url } = req.body as { url?: string };

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'url is required' });
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }

  // Only allow http and https schemes — no file://, ftp://, etc.
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    res.status(400).json({ error: 'Only http and https URLs are supported' });
    return;
  }

  // Reject direct IP addresses in the URL (hostname must be a domain name)
  if (net.isIP(parsedUrl.hostname)) {
    res.status(400).json({ error: 'Direct IP addresses are not allowed' });
    return;
  }

  // Resolve DNS and block private/reserved IPs
  let resolvedIp: string;
  try {
    resolvedIp = await resolveSafeIp(parsedUrl.hostname);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === 'PRIVATE_IP') {
      res.status(400).json({ error: 'That URL is not accessible' });
    } else {
      res.status(422).json({
        error: "We couldn't reach that site — the domain could not be resolved.",
      });
    }
    return;
  }

  let html: string;
  try {
    html = await fetchHtml(parsedUrl, resolvedIp);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === 'TIMEOUT') {
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
    } else {
      res.status(422).json({
        error: "We couldn't reach that site — you can start from scratch instead.",
      });
    }
    return;
  }

  const root = parse(html);

  const metaContent = (selector: string): string =>
    root.querySelector(`meta[${selector}]`)?.getAttribute('content')?.trim() ?? '';

  const title =
    metaContent('property="og:title"') ||
    metaContent('name="og:title"') ||
    root.querySelector('title')?.text?.trim() ||
    '';

  const description =
    metaContent('property="og:description"') ||
    metaContent('name="description"') ||
    '';

  const heading =
    root.querySelector('h1')?.text?.trim() ||
    root.querySelector('h2')?.text?.trim() ||
    '';

  let heroImage =
    metaContent('property="og:image"') ||
    metaContent('name="og:image"') ||
    '';

  if (heroImage) {
    heroImage = absoluteUrl(heroImage, parsedUrl.href);
  } else {
    const imgs = root.querySelectorAll('img[src]');
    for (const img of imgs) {
      const src = img.getAttribute('src') ?? '';
      const abs = absoluteUrl(src, parsedUrl.href);
      if (abs && !/logo|icon|avatar|pixel|1x1/i.test(abs)) {
        heroImage = abs;
        break;
      }
    }
  }

  const bodyText = root.querySelector('body')?.text ?? root.text;
  const phone = extractPhone(bodyText);
  const email = extractEmail(bodyText);

  if (!title && !description && !heading && !heroImage && !phone && !email) {
    res.status(422).json({
      error:
        "We couldn't extract useful content from that site — you can start from scratch instead.",
    });
    return;
  }

  res.json({ title, description, heading, heroImage, phone, email });
});

export default router;
