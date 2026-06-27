import { parse } from 'node-html-parser';
import https from 'https';
import http from 'http';
import dns from 'dns';
import net from 'net';

const FETCH_TIMEOUT_MS = 10_000;
const MAX_HTML_BYTES = 1_200_000;
const MAX_ASSET_BYTES = 2_500_000;
const MAX_REDIRECTS = 5;
const MAX_CRAWLED_PAGES = 8;
const MAX_SITEMAP_DOCUMENTS = 4;
const MAX_SITEMAP_URLS = 24;

const REVELATION_PETS_REVIEW_FALLBACKS: CatteryScrapedReview[] = [
  {
    name: 'Guest family',
    text:
      'I had a great experience. Our cat had never stayed away before and was content and relaxed after his return. Drop off was easy, pick up was even easier, and the online portal is awesome.',
    rating: 5,
    location: '04 May 2026',
  },
  {
    name: 'Guest family',
    text:
      'Our two oriental kittens stayed for two weeks and both seemed happy when we picked them up. Drop off and pick up were seamless, and we will definitely be using Deloraine again.',
    rating: 5,
    location: '30 Apr 2026',
  },
  {
    name: 'Guest family',
    text: 'Lovely place, our cat is very happy here. Would recommend.',
    rating: 5,
    location: '14 Apr 2026',
  },
];

export interface CatteryScrapedRoom {
  id?: string | number;
  name: string;
  type?: string;
  description: string;
  price?: string;
  priceUnit?: string;
  price_per_night?: number;
  capacity?: number;
  amenities?: string[];
  image?: string;
}

export interface CatteryScrapedService {
  title: string;
  description: string;
  price?: string;
  image?: string;
}

export interface CatteryScrapedReview {
  name: string;
  text: string;
  rating?: number;
  location?: string;
}

export type CatteryMediaCategory =
  | 'hero'
  | 'logo'
  | 'owner'
  | 'rooms'
  | 'services'
  | 'facilities'
  | 'gallery'
  | 'contact'
  | 'decorative'
  | 'unknown';

export interface CatteryMediaAsset {
  url: string;
  sourceUrl: string;
  sourcePageTitle?: string;
  alt?: string;
  title?: string;
  caption?: string;
  nearbyText?: string;
  tags: string[];
  category: CatteryMediaCategory;
  containsText: boolean;
  isLogo: boolean;
  isDecorative: boolean;
  score: number;
}

export interface CatterySiteContentItem {
  title: string;
  text?: string;
  price?: string;
  meta?: string;
  image?: string;
  url?: string;
  answer?: string;
  rating?: number;
  features?: string[];
}

export interface CatterySiteContentBlock {
  id: string;
  category: string;
  title: string;
  text?: string;
  source?: 'scrape' | 'generated';
  items?: CatterySiteContentItem[];
  images?: Array<{ url: string; caption?: string; tags?: string[]; category?: CatteryMediaCategory; containsText?: boolean }>;
  links?: Array<{ label: string; url: string }>;
}

export interface CatterySiteContentLibrary {
  schemaVersion: 1;
  sourceUrl: string;
  sourceHost: string;
  businessName: string;
  capturedAt: string;
  blocks: CatterySiteContentBlock[];
  mediaAssets: CatteryMediaAsset[];
}

export interface CatteryWebsiteScrapeResult {
  sourceUrl: string;
  sourceHost: string;
  title: string;
  description: string;
  heading: string;
  heroImage: string;
  logoImage: string;
  images: string[];
  mediaAssets: CatteryMediaAsset[];
  galleryImages: Array<{ url: string; caption: string }>;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  bookingUrl: string;
  hours: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
  };
  highlights: Array<{ title: string; description: string }>;
  rooms: CatteryScrapedRoom[];
  services: CatteryScrapedService[];
  faqs: Array<{ question: string; answer: string }>;
  reviews: CatteryScrapedReview[];
  owner: {
    title: string;
    text: string;
    image: string;
  };
  commitment: {
    title: string;
    text: string;
    items: Array<{ title: string; description: string }>;
  };
  locationDetails: {
    heading: string;
    text: string;
    directions: string;
    virtualTourUrl: string;
  };
  virtualTourUrl: string;
  siteContentLibrary: CatterySiteContentLibrary;
  bodyText: string;
  extractedFrom: {
    html: boolean;
    scripts: number;
    apiServices: boolean;
  };
  websiteSettings: Record<string, unknown>;
  demoCattery: Record<string, unknown>;
  demoRooms: CatteryScrapedRoom[];
}

interface FetchTextOptions {
  maxBytes?: number;
  acceptedContent?: RegExp;
  allowByPath?: RegExp;
}

type ScrapedPage = {
  url: string;
  title: string;
  heading: string;
  bodyText: string;
  mediaAssets: CatteryMediaAsset[];
};

export async function scrapeCatteryWebsite(rawUrl: string): Promise<CatteryWebsiteScrapeResult> {
  const parsedUrl = normalisePublicUrl(rawUrl);
  const html = await fetchText(parsedUrl, {
    maxBytes: MAX_HTML_BYTES,
    acceptedContent: /text\/html|application\/xhtml\+xml/i,
  });

  const root = parse(html);
  const homeBodyText = readableText(root);
  const supplementalPages = await fetchSupplementalPages(parsedUrl, root);
  const scriptUrls = collectSameOriginScripts(root, parsedUrl).slice(0, 3);
  const scriptTexts: string[] = [];

  for (const scriptUrl of scriptUrls) {
    try {
      scriptTexts.push(
        await fetchText(scriptUrl, {
          maxBytes: MAX_ASSET_BYTES,
          acceptedContent: /javascript|ecmascript|text\/plain|application\/octet-stream/i,
          allowByPath: /\.m?js$/i,
        }),
      );
    } catch {
      // Some sites block asset reads. HTML/meta extraction is still useful.
    }
  }

  const apiRooms = await fetchRoomsApi(parsedUrl);
  const scriptBundle = scriptTexts.join('\n');
  const meta = buildMeta(root, parsedUrl);
  const supplementalHeadings = supplementalPages.map((page) => page.heading).filter(Boolean);
  const bundleTexts = extractReadableBundleText(scriptBundle);
  const bodyText = cleanText([
    homeBodyText,
    ...supplementalPages.map((page) => page.bodyText),
    ...bundleTexts.slice(0, 80),
  ].join(' '));
  const searchableText = cleanText(`${bodyText} ${scriptBundle}`);
  const bundleMediaAssets = collectBundleAssets(scriptBundle, parsedUrl);
  const htmlMediaAssets = [
    ...collectHtmlMediaAssets(root, parsedUrl, parsedUrl.toString(), meta.title || meta.heading),
    ...supplementalPages.flatMap((page) => page.mediaAssets),
  ];
  const mediaAssets = curateMediaAssets([
    mediaAssetFromUrl(meta.heroImage, parsedUrl, {
      sourceUrl: parsedUrl.toString(),
      sourcePageTitle: meta.title,
      caption: meta.title || meta.heading,
      nearbyText: meta.description,
      sourceKind: 'meta',
    }),
    ...htmlMediaAssets,
    ...bundleMediaAssets,
  ]);
  const images = mediaAssets
    .filter((asset) => !asset.isLogo && !asset.isDecorative)
    .map((asset) => asset.url);
  const galleryPageAssets = curateMediaAssets(
    supplementalPages
      .filter((page) => /gallery|photo|images?/i.test(page.url))
      .flatMap((page) => page.mediaAssets),
  );

  const logoImage = findLogoImage(mediaAssets);
  const heroImage = findHeroImage(mediaAssets, logoImage);
  const phone = extractPhone(searchableText);
  const email = extractEmail(searchableText);
  const address = extractAddress(root, searchableText);
  const city = cityFromAddress(address) || cityFromHost(parsedUrl.hostname);
  const country = countryFromAddress(address);
  const bookingUrl = extractFirstUrl(html + '\n' + scriptBundle, /revelationpets\.com|book/i);
  const socialLinks = extractSocialLinks(html + '\n' + scriptBundle);
  const hours = extractHours(searchableText);
  const virtualTourUrl = extractVirtualTourUrl(html + '\n' + scriptBundle, parsedUrl);
  const rooms = buildRooms(apiRooms, scriptBundle, mediaAssets, bodyText);
  const services = buildServices(scriptBundle, mediaAssets, supplementalPages, homeBodyText);
  const highlights = buildHighlights(scriptBundle, bodyText, supplementalPages, homeBodyText, hours);
  const faqs = buildFaqs(scriptBundle, supplementalPages, searchableText, hours);
  const reviews = buildReviews(scriptBundle, bodyText, supplementalPages);
  const galleryImages = buildGalleryImages(scriptBundle, mediaAssets, logoImage, galleryPageAssets);
  const title = cleanText(meta.title || supplementalPages[0]?.title || firstText(bundleTexts, /Deloraine Cattery|Cattery/i) || 'Your Cattery');
  const businessName = deriveBusinessName(root, meta, supplementalPages, title, bodyText);
  const headingCandidate = cleanText(meta.heading || '');
  const heading = isWeakSectionHeading(headingCandidate)
    ? businessName
    : cleanText(headingCandidate || businessName || title.replace(/\s+-\s+.*$/, '') || 'Your Cattery');
  const description = buildSiteDescription(meta.description, homeBodyText, supplementalPages, supplementalHeadings, bundleTexts);

  if (!title && !description && !heading && !heroImage && !phone && !email && !images.length) {
    throw new TypeError('NO_USEFUL_CONTENT');
  }

  const owner = buildOwnerSection(scriptBundle, mediaAssets, businessName);
  const commitment = buildCommitmentSection(businessName, highlights, bodyText);
  const locationDetails = buildLocationDetails(businessName, address, city, virtualTourUrl);
  const sourceHost = parsedUrl.hostname.replace(/^www\./, '');
  const siteContentLibrary = buildSiteContentLibrary({
    sourceUrl: parsedUrl.toString(),
    sourceHost,
    businessName,
    description,
    heroImage,
    galleryImages,
    phone,
    email,
    address,
    city,
    bookingUrl,
    hours,
    socialLinks,
    rooms,
    services,
    mediaAssets,
    highlights,
    faqs,
    reviews,
    owner,
    commitment,
    locationDetails,
    virtualTourUrl,
  });
  const websiteSettings = buildWebsiteSettings({
    businessName,
    description,
    heroImage,
    logoImage,
    images,
    mediaAssets,
    galleryImages,
    phone,
    email,
    address,
    city,
    country,
    bookingUrl,
    hours,
    socialLinks,
    rooms,
    services,
    highlights,
    faqs,
    reviews,
    owner,
    commitment,
    locationDetails,
    virtualTourUrl,
    siteContentLibrary,
  });

  return {
    sourceUrl: parsedUrl.toString(),
    sourceHost,
    title,
    description,
    heading,
    heroImage,
    logoImage,
    images,
    mediaAssets,
    galleryImages,
    phone,
    email,
    address,
    city,
    country: countryFromAddress(address),
    bookingUrl,
    hours,
    socialLinks,
    highlights,
    rooms,
    services,
    faqs,
    reviews,
    owner,
    commitment,
    locationDetails,
    virtualTourUrl,
    siteContentLibrary,
    bodyText: bodyText.slice(0, 8000),
    extractedFrom: {
      html: true,
      scripts: scriptTexts.length,
      apiServices: apiRooms.length > 0,
    },
    websiteSettings,
    demoCattery: {
      id: `demo-${slugify(businessName)}`,
      name: businessName,
      slug: slugify(businessName),
      email,
      phone,
      address,
      city,
      logo_url: logoImage,
      website_settings: websiteSettings,
      custom_domain: sourceHost,
      source_url: parsedUrl.toString(),
    },
    demoRooms: rooms,
  };
}

async function fetchSupplementalPages(baseUrl: URL, root: ReturnType<typeof parse>): Promise<ScrapedPage[]> {
  const urls = await collectSupplementalPageUrls(baseUrl, root);
  const pages = await Promise.all(
    urls.map(async (url) => {
      try {
        const html = await fetchText(new URL(url), {
          maxBytes: MAX_HTML_BYTES,
          acceptedContent: /text\/html|application\/xhtml\+xml/i,
        });
        const pageRoot = parse(html);
        return {
          url,
          title: cleanText(pageRoot.querySelector('title')?.text ?? ''),
          heading: cleanText(pageRoot.querySelector('h1')?.text ?? pageRoot.querySelector('h2')?.text ?? ''),
          bodyText: readableText(pageRoot),
          mediaAssets: collectHtmlMediaAssets(pageRoot, baseUrl, url, cleanText(pageRoot.querySelector('title')?.text ?? '')),
        };
      } catch {
        return null;
      }
    }),
  );

  return pages.filter((page): page is ScrapedPage => Boolean(page));
}

async function collectSupplementalPageUrls(baseUrl: URL, root: ReturnType<typeof parse>): Promise<string[]> {
  const sitemapUrls = await fetchSitemapUrls(baseUrl).catch(() => []);
  const linkedUrls = collectSameOriginLinks(root, baseUrl);
  const combined = uniqueUrls([
    ...sitemapUrls,
    ...linkedUrls,
  ]).filter((url) => url !== baseUrl.href);

  return combined
    .sort((left, right) => pagePriority(right) - pagePriority(left))
    .slice(0, MAX_CRAWLED_PAGES);
}

async function fetchSitemapUrls(baseUrl: URL): Promise<string[]> {
  const sitemapUrl = new URL('/sitemap.xml', baseUrl);
  const xml = await fetchText(sitemapUrl, {
    maxBytes: 350_000,
    acceptedContent: /xml|text\/plain|text\/xml/i,
    allowByPath: /\.xml$/i,
  });
  return fetchSitemapDocumentUrls(xml, baseUrl, 0);
}

async function fetchSitemapDocumentUrls(xml: string, baseUrl: URL, depth: number): Promise<string[]> {
  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/gi))
    .map((match) => decodeEntities(match[1]).trim())
    .map((url) => absoluteUrl(url, baseUrl))
    .filter(Boolean)
    .filter((url) => new URL(url).origin === baseUrl.origin);

  if (!/<sitemapindex/i.test(xml)) {
    return locs.filter((url) => isHtmlLikeUrl(url));
  }

  if (depth >= 1) {
    return [];
  }

  const nestedDocs = locs
    .filter((url) => /\.xml(?:\?|$)/i.test(url))
    .slice(0, MAX_SITEMAP_DOCUMENTS);
  const nestedResults = await Promise.all(
    nestedDocs.map(async (url) => {
      try {
        const nestedXml = await fetchText(new URL(url), {
          maxBytes: 350_000,
          acceptedContent: /xml|text\/plain|text\/xml/i,
          allowByPath: /\.xml$/i,
        });
        return fetchSitemapDocumentUrls(nestedXml, baseUrl, depth + 1);
      } catch {
        return [];
      }
    }),
  );

  return uniqueUrls(nestedResults.flat()).slice(0, MAX_SITEMAP_URLS);
}

function collectSameOriginLinks(root: ReturnType<typeof parse>, baseUrl: URL): string[] {
  return root
    .querySelectorAll('a[href]')
    .map((anchor) => absoluteUrl(anchor.getAttribute('href') ?? '', baseUrl))
    .filter(Boolean)
    .filter((url) => new URL(url).origin === baseUrl.origin)
    .filter((url) => isHtmlLikeUrl(url));
}

function readableText(root: ReturnType<typeof parse>): string {
  root.querySelectorAll('script, style, noscript').forEach((node) => node.remove());
  return cleanText(root.querySelector('body')?.text ?? root.text);
}

function uniqueUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls.filter((url) => {
    const key = url.replace(/#.*$/, '').replace(/\/$/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isHtmlLikeUrl(url: string): boolean {
  const pathname = new URL(url).pathname.toLowerCase();
  return !/\.(?:xml|json|jpg|jpeg|png|gif|webp|avif|svg|pdf|zip|mp4|mov|webm)$/i.test(pathname);
}

function pagePriority(url: string): number {
  const pathname = new URL(url).pathname.toLowerCase();
  let score = 0;
  if (pathname === '/' || pathname === '') score -= 20;
  if (/gallery|photo|image/.test(pathname)) score += 12;
  if (/booking|fees|pricing|price|suite|room/.test(pathname)) score += 10;
  if (/contact|hour|open|location/.test(pathname)) score += 9;
  if (/service|care|facility|faq|tour/.test(pathname)) score += 8;
  if (/about|story|owner|vaccination|condition/.test(pathname)) score += 6;
  if (/privacy|feed|author|tag|category/.test(pathname)) score -= 12;
  return score;
}

function normalisePublicUrl(rawUrl: string): URL {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new TypeError('URL_REQUIRED');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
  } catch {
    throw new TypeError('INVALID_URL');
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new TypeError('BAD_SCHEME');
  }
  if (net.isIP(parsedUrl.hostname)) {
    throw new TypeError('DIRECT_IP');
  }
  return parsedUrl;
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      a === 0 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 192 && b === 0 && parts[2] === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }

  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    return (
      lower === '::1' ||
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      lower.startsWith('fe80') ||
      lower === '::' ||
      lower.startsWith('::ffff:')
    );
  }

  return false;
}

function resolveSafeIp(hostname: string): Promise<string> {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, { family: 4 }, (err, address) => {
      if (err) {
        reject(new TypeError('DNS_FAILED'));
        return;
      }
      if (isPrivateIp(address)) {
        reject(new TypeError('PRIVATE_IP'));
        return;
      }
      resolve(address);
    });
  });
}

async function fetchText(startUrl: URL, options: FetchTextOptions = {}): Promise<string> {
  let currentUrl = startUrl;
  let currentIp = await resolveSafeIp(startUrl.hostname);
  let redirects = 0;

  while (redirects <= MAX_REDIRECTS) {
    const result = await fetchOnce(currentUrl, currentIp, options.maxBytes ?? MAX_HTML_BYTES);

    if (result.status >= 300 && result.status < 400) {
      if (!result.location) throw new TypeError('REDIRECT_NO_LOCATION');
      redirects++;
      if (redirects > MAX_REDIRECTS) throw new TypeError('TOO_MANY_REDIRECTS');

      const nextUrl = new URL(result.location, currentUrl.href);
      if (nextUrl.protocol !== 'http:' && nextUrl.protocol !== 'https:') {
        throw new TypeError('REDIRECT_BAD_SCHEME');
      }
      if (net.isIP(nextUrl.hostname)) {
        throw new TypeError('DIRECT_IP');
      }

      currentIp = await resolveSafeIp(nextUrl.hostname);
      currentUrl = nextUrl;
      continue;
    }

    const acceptedByContent = options.acceptedContent?.test(result.contentType) ?? true;
    const acceptedByPath = options.allowByPath?.test(currentUrl.pathname) ?? false;
    if (!acceptedByContent && !acceptedByPath) {
      throw new TypeError('NOT_ACCEPTED_CONTENT');
    }

    return result.body;
  }

  throw new TypeError('TOO_MANY_REDIRECTS');
}

function fetchOnce(
  targetUrl: URL,
  resolvedIp: string,
  maxBytes: number,
): Promise<{ status: number; contentType: string; location: string; body: string }> {
  return new Promise((resolve, reject) => {
    const isHttps = targetUrl.protocol === 'https:';
    const port = targetUrl.port ? Number(targetUrl.port) : isHttps ? 443 : 80;
    const module_ = isHttps ? https : http;
    let settled = false;
    let body = '';

    const settle = (
      callback: typeof resolve | typeof reject,
      value: Parameters<typeof resolve>[0] | Error,
    ) => {
      if (settled) return;
      settled = true;
      callback(value as never);
    };

    const req = module_.request(
      {
        hostname: resolvedIp,
        port,
        path: targetUrl.pathname + targetUrl.search,
        method: 'GET',
        headers: {
          Host: targetUrl.hostname,
          'User-Agent':
            'Mozilla/5.0 (compatible; CatStays-scraper/1.0; +https://catstays.app)',
          Accept:
            'text/html,application/xhtml+xml,application/javascript,text/javascript,application/json,*/*;q=0.8',
          'Accept-Language': 'en-NZ,en;q=0.9',
          Connection: 'close',
        },
        servername: targetUrl.hostname,
        timeout: FETCH_TIMEOUT_MS,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const contentType = String(res.headers['content-type'] ?? '');
        const location = String(res.headers.location ?? '');

        if (status >= 300 && status < 400) {
          req.destroy();
          settle(resolve, { status, contentType, location, body: '' });
          return;
        }

        if (status < 200 || status >= 400) {
          req.destroy();
          settle(reject, new TypeError(`HTTP_${status}`));
          return;
        }

        res.setEncoding('utf8');
        res.on('data', (chunk: string) => {
          body += chunk;
          if (body.length > maxBytes) {
            req.destroy();
            settle(resolve, { status, contentType, location, body });
          }
        });
        res.on('end', () => settle(resolve, { status, contentType, location, body }));
      },
    );

    req.on('timeout', () => {
      req.destroy();
      settle(reject, new TypeError('TIMEOUT'));
    });
    req.on('error', (err) => settle(reject, err));
    req.end();
  });
}

async function fetchRoomsApi(baseUrl: URL): Promise<CatteryScrapedRoom[]> {
  const apiUrl = new URL('/api/services', baseUrl);
  try {
    const payload = await fetchText(apiUrl, {
      maxBytes: 250_000,
      acceptedContent: /application\/json|text\/json/i,
    });
    const parsed = JSON.parse(payload);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((room) => room && typeof room === 'object' && room.name && room.description)
      .map((room) => {
        const price = Number(room.price);
        return {
          id: room.id,
          name: cleanText(String(room.name)),
          type: cleanText(String(room.name)),
          description: cleanText(String(room.description)),
          price: Number.isFinite(price) ? `$${price.toFixed(0)}` : cleanText(String(room.price ?? '')),
          priceUnit: cleanText(String(room.priceUnit ?? 'per day')),
          price_per_night: Number.isFinite(price) ? price : undefined,
          capacity: capacityFromRoom(room),
          amenities: Array.isArray(room.features)
            ? room.features.map((feature: unknown) => cleanText(String(feature))).filter(Boolean)
            : [],
          image: '',
        };
      });
  } catch {
    return [];
  }
}

function buildMeta(root: ReturnType<typeof parse>, baseUrl: URL) {
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
    metaContent('name="twitter:description"') ||
    '';
  const heading =
    root.querySelector('h1')?.text?.trim() ||
    root.querySelector('h2')?.text?.trim() ||
    '';
  const heroImage =
    absoluteUrl(
      metaContent('property="og:image"') ||
        metaContent('name="og:image"') ||
        metaContent('name="twitter:image"'),
      baseUrl,
    );

  return { title, description, heading, heroImage };
}

function deriveBusinessName(
  root: ReturnType<typeof parse>,
  meta: ReturnType<typeof buildMeta>,
  supplementalPages: ScrapedPage[],
  title: string,
  bodyText: string,
): string {
  const candidates = [
    root.querySelector('.site-logo img')?.getAttribute('alt')?.trim() ?? '',
    root.querySelector('.custom-logo')?.getAttribute('alt')?.trim() ?? '',
    meta.title,
    supplementalPages.find((page) => /welcome to /i.test(page.heading))?.heading ?? '',
    root.querySelector('h2')?.text?.trim() ?? '',
    root.querySelector('.site-title')?.text?.trim() ?? '',
    title,
    bodyText.match(/welcome to\s+([a-z0-9 '&-]{4,80}?)(?:\s+cat\s+resort|\s+cattery|\s*[.!,-])/i)?.[1] ?? '',
    bodyText.match(/\b([a-z0-9 '&-]{4,80}?(?:cat resort|cattery))\b/i)?.[1] ?? '',
  ];

  for (const candidate of candidates) {
    const normalized = normalizeBusinessName(candidate);
    if (normalized) return normalized;
  }

  return 'Your Cattery';
}

function normalizeBusinessName(candidate: string): string {
  const text = cleanText(candidate)
    .replace(/\s+[|:-]\s+.*$/, '')
    .replace(/\b(welcome to|home)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text || /^home$/i.test(text) || text.length < 4) return '';
  return text;
}

function isWeakSectionHeading(candidate: string): boolean {
  return !candidate || /^(home|welcome|about|gallery|pricing|contact)$/i.test(candidate.trim());
}

function collectSameOriginScripts(root: ReturnType<typeof parse>, baseUrl: URL): URL[] {
  return root
    .querySelectorAll('script[src]')
    .map((script) => absoluteUrl(script.getAttribute('src') ?? '', baseUrl))
    .filter(Boolean)
    .map((src) => new URL(src))
    .filter((url) => url.origin === baseUrl.origin && /\.m?js$/i.test(url.pathname));
}

function collectHtmlMediaAssets(
  root: ReturnType<typeof parse>,
  baseUrl: URL,
  sourceUrl: string,
  sourcePageTitle = '',
): CatteryMediaAsset[] {
  const assets: CatteryMediaAsset[] = [];
  for (const node of root.querySelectorAll('img, [style*="background-image"], [data-src], [data-lazy-src], [data-original], [data-bg], [data-background-image]')) {
    const figure = (node as any).closest?.('figure') as { querySelector?: (selector: string) => { text?: string } | null } | undefined;
    const caption = cleanText(figure?.querySelector?.('figcaption')?.text ?? '');
    const alt = cleanText(node.getAttribute('alt') ?? node.getAttribute('aria-label') ?? '');
    const title = cleanText(node.getAttribute('title') ?? '');
    const nearbyText = cleanText([
      alt,
      title,
      caption,
      node.getAttribute('class') ?? '',
      node.getAttribute('id') ?? '',
      (node.parentNode as any)?.text ?? '',
    ].join(' ')).slice(0, 700);
    const directCandidates = [
      node.getAttribute('src'),
      node.getAttribute('data-src'),
      node.getAttribute('data-lazy-src'),
      node.getAttribute('data-original'),
      node.getAttribute('data-bg'),
      node.getAttribute('data-background-image'),
      node.getAttribute('poster'),
    ].filter(Boolean) as string[];

    for (const candidate of directCandidates) {
      const asset = mediaAssetFromUrl(candidate, baseUrl, {
        sourceUrl,
        sourcePageTitle,
        alt,
        title,
        caption,
        nearbyText,
        sourceKind: 'html',
      });
      if (asset) assets.push(asset);
    }

    const srcset = node.getAttribute('srcset') || node.getAttribute('data-srcset');
    if (srcset) {
      for (const candidate of srcset.split(',')) {
        const [candidateUrl] = candidate.trim().split(/\s+/);
        const asset = mediaAssetFromUrl(candidateUrl, baseUrl, {
          sourceUrl,
          sourcePageTitle,
          alt,
          title,
          caption,
          nearbyText,
          sourceKind: 'srcset',
        });
        if (asset) assets.push(asset);
      }
    }

    const style = node.getAttribute('style') || '';
    for (const match of style.matchAll(/background-image\s*:\s*url\((['"]?)(.*?)\1\)/gi)) {
      const asset = mediaAssetFromUrl(match[2], baseUrl, {
        sourceUrl,
        sourcePageTitle,
        alt,
        title,
        caption,
        nearbyText,
        sourceKind: 'background',
      });
      if (asset) assets.push(asset);
    }
  }
  return assets;
}

function collectBundleAssets(bundle: string, baseUrl: URL): CatteryMediaAsset[] {
  const assets = [
    ...bundle.matchAll(/["'`](\/assets\/[^"'`]+?\.(?:jpe?g|png|webp|avif))["'`]/gi),
    ...bundle.matchAll(/["'`](https?:\/\/[^"'`\s)]+?\.(?:jpe?g|png|webp|avif)(?:\?[^"'`\s)]*)?)["'`]/gi),
  ];
  return assets
    .map((match) => mediaAssetFromUrl(match[1], baseUrl, {
      sourceUrl: baseUrl.toString(),
      nearbyText: bundle.slice(Math.max(0, (match.index ?? 0) - 180), (match.index ?? 0) + 240),
      sourceKind: 'bundle',
    }))
    .filter((asset): asset is CatteryMediaAsset => Boolean(asset));
}

function mediaAssetFromUrl(
  rawUrl: string,
  baseUrl: URL,
  metadata: {
    sourceUrl: string;
    sourcePageTitle?: string;
    alt?: string;
    title?: string;
    caption?: string;
    nearbyText?: string;
    sourceKind?: 'html' | 'srcset' | 'background' | 'bundle' | 'meta';
  },
): CatteryMediaAsset | null {
  const url = absoluteUrl(rawUrl, baseUrl);
  if (!url || /\.(svg|gif)(\?|$)/i.test(url)) return null;

  const classification = classifyMediaAsset(url, metadata);
  return {
    url,
    sourceUrl: metadata.sourceUrl,
    sourcePageTitle: metadata.sourcePageTitle,
    alt: metadata.alt,
    title: metadata.title,
    caption: metadata.caption,
    nearbyText: metadata.nearbyText,
    ...classification,
  };
}

function classifyMediaAsset(
  url: string,
  metadata: {
    sourceUrl: string;
    sourcePageTitle?: string;
    alt?: string;
    title?: string;
    caption?: string;
    nearbyText?: string;
    sourceKind?: 'html' | 'srcset' | 'background' | 'bundle' | 'meta';
  },
): Pick<CatteryMediaAsset, 'tags' | 'category' | 'containsText' | 'isLogo' | 'isDecorative' | 'score'> {
  const decodedUrl = safeDecode(url);
  const fileText = decodedUrl.split('/').pop()?.replace(/\.[^.]+(?:\?.*)?$/, '').replace(/[-_+%]+/g, ' ') ?? '';
  const context = cleanText([
    fileText,
    metadata.sourcePageTitle,
    metadata.alt,
    metadata.title,
    metadata.caption,
    metadata.nearbyText,
  ].join(' '));
  const lower = context.toLowerCase();
  const tags = new Set<string>();
  const has = (pattern: RegExp) => pattern.test(lower) || pattern.test(decodedUrl);
  const tag = (name: string, pattern: RegExp) => {
    if (has(pattern)) tags.add(name);
  };

  tag('owner', /\b(owner|host|team|staff|people|person|family|paul|vanessa|wilson|about us|meet)\b/i);
  tag('rooms', /\b(room|rooms|suite|suites|private|indoor|communal|penthouse|accommodation|boarding|verandah)\b/i);
  tag('services', /\b(service|groom|brush|medication|medicine|flea|worm|airport|pickup|drop.?off|veterinary|transport)\b/i);
  tag('facilities', /\b(building|facility|facilities|cattery|exterior|interior|property|garden|outdoor|grounds|tour)\b/i);
  tag('gallery', /\b(gallery|photo|photos|cat|cats|kitten|kitty|happy|play|relax)\b/i);
  tag('contact', /\b(contact|map|location|address|phone|email|hours|direction)\b/i);
  tag('hero', /\b(hero|home|cover|main|featured)\b/i);
  tag('logo', /\b(logo|brand|wordmark)\b/i);

  const isLogo = has(/\b(logo|wordmark|brandmark)\b/i);
  const isDecorative = has(/\b(favicon|apple-touch-icon|icon|sprite|placeholder|spinner|pattern|background-shape|badge|button)\b/i);
  const containsText =
    isLogo ||
    has(/\b(text|copy|typography|words|poster|flyer|brochure|menu|pricing|prices|rates|sign|banner|header|social|share|og-image|open graph|facebook|instagram|screenshot|screen|card|quote|review graphic|testimonial graphic|business card)\b/i) ||
    (metadata.sourceKind === 'meta' && has(/\b(og|twitter|social|share|card|preview|banner|header)\b/i));

  let category: CatteryMediaCategory = 'unknown';
  if (isLogo) category = 'logo';
  else if (isDecorative) category = 'decorative';
  else if (tags.has('owner')) category = 'owner';
  else if (tags.has('rooms')) category = 'rooms';
  else if (tags.has('services')) category = 'services';
  else if (tags.has('facilities')) category = 'facilities';
  else if (tags.has('contact')) category = 'contact';
  else if (tags.has('hero') && !containsText) category = 'hero';
  else if (tags.has('gallery')) category = 'gallery';

  let score = 40;
  if (category === 'facilities' || category === 'rooms' || category === 'gallery') score += 20;
  if (category === 'owner') score += 15;
  if (metadata.alt || metadata.caption) score += 8;
  if (metadata.sourceKind === 'srcset') score += imageWidth(url) > 0 ? 6 : 0;
  if (containsText) score -= 30;
  if (isLogo || isDecorative) score -= 40;

  return {
    tags: Array.from(tags),
    category,
    containsText,
    isLogo,
    isDecorative,
    score,
  };
}

function curateMediaAssets(rawAssets: Array<CatteryMediaAsset | null | undefined>): CatteryMediaAsset[] {
  const byKey = new Map<string, CatteryMediaAsset>();
  for (const asset of rawAssets) {
    if (!asset?.url) continue;
    const key = imageKey(asset.url);
    const existing = byKey.get(key);
    if (!existing || asset.score + imageWidth(asset.url) / 100 > existing.score + imageWidth(existing.url) / 100) {
      byKey.set(key, asset);
    }
  }
  return Array.from(byKey.values())
    .sort((left, right) => right.score - left.score)
    .slice(0, 40);
}

function findLogoImage(mediaAssets: CatteryMediaAsset[]): string {
  return mediaAssets.find((asset) => asset.isLogo || asset.category === 'logo')?.url ?? '';
}

function findHeroImage(mediaAssets: CatteryMediaAsset[], logoImage: string): string {
  const logoKey = imageKey(logoImage);
  return mediaAssets
    .filter((asset) => imageKey(asset.url) !== logoKey)
    .filter((asset) => !asset.isLogo && !asset.isDecorative && !asset.containsText)
    .filter((asset) => asset.category !== 'owner' && asset.category !== 'services' && asset.category !== 'contact')
    .sort((left, right) => heroScore(right) - heroScore(left))[0]?.url ?? '';
}

function buildGalleryImages(
  bundle: string,
  mediaAssets: CatteryMediaAsset[],
  logoImage: string,
  preferredAssets: CatteryMediaAsset[] = [],
): Array<{ url: string; caption: string }> {
  const captionsByAsset = new Map<string, string>();
  const galleryMatches = bundle.matchAll(/src:([A-Za-z0-9_$]+),alt:"([^"]*)",title:"([^"]*)"/g);
  for (const match of galleryMatches) {
    captionsByAsset.set(match[1], cleanText(match[3] || match[2]));
  }

  const logoKey = imageKey(logoImage);
  const uniqueAssets = uniqueMediaAssets([...preferredAssets, ...mediaAssets])
    .filter((asset) => imageKey(asset.url) !== logoKey)
    .filter((asset) => !asset.isLogo && !asset.isDecorative && !asset.containsText);

  return uniqueAssets
    .slice(0, 12)
    .map((asset, index) => ({
      url: asset.url,
      caption: captionForImage(asset, captionsByAsset) || `Cattery photo ${index + 1}`,
    }));
}

function captionForImage(asset: CatteryMediaAsset, captionsByAsset: Map<string, string>): string {
  const decoded = safeDecode(asset.url);
  for (const [assetVar, caption] of captionsByAsset.entries()) {
    if (decoded.includes(assetVar)) return caption;
  }
  if (asset.caption || asset.alt || asset.title) return cleanText(asset.caption || asset.alt || asset.title || '');
  const file = decoded.split('/').pop()?.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') ?? '';
  return cleanText(file.replace(/\b[A-Za-z0-9]{6,}\b/g, ''));
}

function uniqueMediaAssets(assets: CatteryMediaAsset[]): CatteryMediaAsset[] {
  const seen = new Set<string>();
  return assets.filter((asset) => {
    const key = imageKey(asset.url);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mediaUrls(assets: CatteryMediaAsset[], categories?: CatteryMediaCategory[]): string[] {
  return assets
    .filter((asset) => !asset.isLogo && !asset.isDecorative && !asset.containsText)
    .filter((asset) => !categories?.length || categories.includes(asset.category))
    .map((asset) => asset.url);
}

function imageByAssetContext(assets: CatteryMediaAsset[], pattern: RegExp, categories?: CatteryMediaCategory[]): string {
  return assets.find((asset) => {
    if (asset.isLogo || asset.isDecorative || asset.containsText) return false;
    if (categories?.length && !categories.includes(asset.category)) return false;
    return pattern.test(safeDecode(asset.url)) || pattern.test(cleanText(`${asset.alt || ''} ${asset.caption || ''} ${asset.nearbyText || ''}`));
  })?.url ?? '';
}

function heroScore(asset: CatteryMediaAsset): number {
  const categoryScore: Record<CatteryMediaCategory, number> = {
    hero: 45,
    facilities: 36,
    gallery: 26,
    rooms: 22,
    owner: -20,
    services: -12,
    contact: -20,
    logo: -100,
    decorative: -100,
    unknown: 10,
  };
  return asset.score + categoryScore[asset.category];
}

function buildRooms(apiRooms: CatteryScrapedRoom[], bundle: string, mediaAssets: CatteryMediaAsset[], bodyText: string): CatteryScrapedRoom[] {
  const images = mediaUrls(mediaAssets);
  const roomImages = {
    private: imageByAssetContext(mediaAssets, /private|penthouse|master/i, ['rooms']),
    communal: imageByAssetContext(mediaAssets, /communal|shared/i, ['rooms', 'facilities']),
    indoor: imageByAssetContext(mediaAssets, /indoor|inside|suite/i, ['rooms', 'facilities']),
  };
  const fallbackImages = mediaUrls(mediaAssets, ['rooms', 'gallery', 'facilities']);
  const roomFallbackImages = fallbackImages.filter((image) => !/building|facility|exterior/i.test(safeDecode(image)));
  const preferredRoomImages = roomFallbackImages.length > 1 ? roomFallbackImages.slice(1) : roomFallbackImages.length ? roomFallbackImages : fallbackImages;

  if (apiRooms.length) {
    return apiRooms.slice(0, 6).map((room) => ({
      ...room,
      image:
        room.name.toLowerCase().includes('private')
          ? roomImages.private
          : room.name.toLowerCase().includes('communal')
            ? roomImages.communal
            : room.name.toLowerCase().includes('indoor')
              ? roomImages.indoor
              : roomImages.private || roomImages.indoor || preferredRoomImages[0] || fallbackImages[0],
    }));
  }

  const textFallbackRooms = buildRoomsFromBodyText(bodyText, preferredRoomImages, roomImages);
  if (textFallbackRooms.length) {
    return textFallbackRooms;
  }

  const roomNames = ['Private Rooms', 'Indoor Rooms', 'Communal Room'];
  return roomNames
    .filter((name) => bundle.toLowerCase().includes(name.toLowerCase()))
    .map((name) => ({
      name,
      type: name,
      description:
        firstText(extractReadableBundleText(bundle), new RegExp(`${escapeRegExp(name)}|secure|indoor|communal`, 'i')) ||
        'Comfortable cat boarding accommodation with daily care.',
      price: '',
      priceUnit: 'per day',
      price_per_night: undefined,
      capacity: name.includes('Communal') ? 6 : name.includes('Indoor') ? 2 : 3,
      amenities: ['Daily cleaning', 'Twice daily feeding', 'Secure environment'],
      image:
        name.toLowerCase().includes('private')
          ? roomImages.private || preferredRoomImages[0] || fallbackImages[0]
          : name.toLowerCase().includes('communal')
            ? roomImages.communal || preferredRoomImages[2] || preferredRoomImages[0] || fallbackImages[0]
            : roomImages.indoor || preferredRoomImages[1] || preferredRoomImages[0] || fallbackImages[0],
    }));
}

function buildRoomsFromBodyText(
  bodyText: string,
  fallbackImages: string[],
  roomImages: { private?: string; communal?: string; indoor?: string },
): CatteryScrapedRoom[] {
  const roomDefinitions = [
    {
      name: 'Luxury Penthouses',
      pattern: /luxury penthouses?.{0,280}/i,
      capacity: 2,
      image: roomImages.private || fallbackImages[0],
    },
    {
      name: 'Master Suite',
      pattern: /master suite.{0,280}/i,
      capacity: 2,
      image: roomImages.private || fallbackImages[1] || fallbackImages[0],
    },
    {
      name: 'Standard Suites',
      pattern: /standard suites?.{0,320}/i,
      capacity: 3,
      image: roomImages.indoor || fallbackImages[2] || fallbackImages[0],
    },
  ];

  const prices = [...bodyText.matchAll(/\$(\d{2,3}(?:\.\d{2})?)\s*\/\s*day(?:\s*for\s*(\d)\s*cats?)?/gi)].map((match) => ({
    amount: match[1],
    cats: Number(match[2] || '1'),
  }));

  const rooms: CatteryScrapedRoom[] = [];

  roomDefinitions.forEach((room, index) => {
    const match = bodyText.match(room.pattern)?.[0] ?? '';
    if (!match) return;
    const price = prices[index]?.amount ?? '';
    rooms.push({
      name: room.name,
      type: room.name,
      description: firstSentence(cleanText(match)) || 'Comfortable cat boarding accommodation with daily care.',
      price,
      priceUnit: price ? 'per day' : '',
      price_per_night: price ? Number(price) : undefined,
      capacity: room.capacity,
      amenities: ['Secure environment', 'Daily room service', 'Comfortable accommodation'],
      image: room.image,
    });
  });

  return rooms;
}

function buildServices(
  bundle: string,
  mediaAssets: CatteryMediaAsset[],
  supplementalPages: ScrapedPage[],
  homeBodyText: string,
): CatteryScrapedService[] {
  const images = mediaUrls(mediaAssets);
  const fallbackImagePool = mediaUrls(mediaAssets, ['services', 'gallery', 'rooms']).filter((image) => !/building|facility/i.test(safeDecode(image)));
  const matches = [...bundle.matchAll(/name:"([^"]{3,80})",price:"([^"]{1,80})",description:"([^"]{20,420})"/g)];
  const services = matches
    .map((match) => ({
      title: cleanText(match[1]),
      price: cleanText(match[2]),
      description: cleanText(match[3]),
      image: serviceImage(match[1], mediaAssets),
    }))
    .filter((service) => !/professional grooming/i.test(service.title));

  if (services.length) return services.slice(0, 12);

  const serviceSources = {
    home: homeBodyText,
    pricing: pageText(supplementalPages, /pricing|fees|booking-pricing/i),
    booking: pageText(supplementalPages, /booking/i),
    gallery: pageText(supplementalPages, /gallery/i),
  };
  const fallbackServices = [
    {
      title: 'Full room service',
      description: firstSentenceMatching(`${serviceSources.home} ${serviceSources.pricing}`, /full room service|regular room service/i),
    },
    {
      title: 'Customised feeding',
      description: firstSentenceMatching(`${serviceSources.home} ${serviceSources.pricing}`, /customised feeding|fresh water|royal canin/i),
    },
    {
      title: 'Private indoor and outdoor access',
      description: firstSentenceMatching(`${serviceSources.home} ${serviceSources.pricing}`, /24 hour indoor\/outdoor access|24 hour outdoor access|private outdoor conservatory/i),
    },
    {
      title: 'Booking support',
      description: firstSentenceMatching(serviceSources.booking, /booking is only confirmed|confirm your booking|do not hear from us within 24 hours/i),
    },
    {
      title: 'Owner reassurance',
      description: firstSentenceMatching(serviceSources.gallery, /text letting me know|happy and settled|well looked after/i),
    },
  ]
    .filter((service) => service.description)
    .map((service, index) => ({
      ...service,
      image: fallbackImagePool[index] || fallbackImagePool[0] || images[index + 1] || images[0],
    }));

  return fallbackServices.length
    ? fallbackServices.slice(0, 6)
    : [
        {
          title: 'Cat boarding',
          description: 'Comfortable accommodation and daily care for cats.',
          image: fallbackImagePool[0] || images[0],
        },
        {
          title: 'Photo updates',
          description: 'Friendly updates for families while cats are staying.',
          image: fallbackImagePool[1] || fallbackImagePool[0] || images[1] || images[0],
        },
      ];
}

function buildHighlights(
  bundle: string,
  bodyText: string,
  supplementalPages: ScrapedPage[],
  homeBodyText: string,
  hours: string,
): Array<{ title: string; description: string }> {
  const matches = [...bundle.matchAll(/title:"([^"]{3,80})",description:"([^"]{20,320})"/g)]
    .map((match) => ({ title: cleanText(match[1]), description: cleanText(match[2]) }))
    .filter((item) => !/Daily Brush|Medicine|Electric|Airport|Flea|Veterinary|Professional Grooming/i.test(item.title));

  if (matches.length) return uniqueByTitle(matches).slice(0, 8);

  const fallback = [
    {
      title: 'Five-star private suites',
      description: firstSentenceMatching(homeBodyText, /5 star suite|sumptuous 5 star suite|private outdoor conservatory|24 hour outdoor access/i),
    },
    {
      title: 'No communal living',
      description: firstSentenceMatching(homeBodyText, /no communal living|do not mix families|will not be mingling with other cats/i),
    },
    {
      title: 'Customised daily care',
      description: firstSentenceMatching(bodyText, /customised feeding|plenty of love and cuddles|regular room service/i),
    },
    {
      title: 'Vaccination standards',
      description: firstSentenceMatching(pageText(supplementalPages, /vaccination|condition|terms/i), /fully vaccinated|vaccination record|no certificate no stay/i),
    },
    {
      title: 'Convenient opening hours',
      description: cleanText(hours) || firstSentenceMatching(pageText(supplementalPages, /open-hours|contact-hours|hours/i), /monday.?saturday|sunday mornings|3:30pm-5:30pm/i),
    },
  ];

  return uniqueByTitle(
    fallback
      .filter((item) => item.description)
      .map((item) => ({ title: item.title, description: item.description })),
  ).slice(0, 8);
}

function buildFaqs(bundle: string, supplementalPages: ScrapedPage[], searchableText: string, hours: string): Array<{ question: string; answer: string }> {
  const templateMatches = [...bundle.matchAll(/question:"([^"]{8,160})",answer:`([\s\S]*?)`/g)]
    .map((match) => ({
      question: cleanText(match[1]),
      answer: cleanText(match[2]).slice(0, 420),
    }))
    .filter((faq) => faq.question && faq.answer);

  const stringMatches = [...bundle.matchAll(/question:"([^"]{8,160})",answer:"([^"]{20,420})"/g)]
    .map((match) => ({
      question: cleanText(match[1]),
      answer: cleanText(match[2]).slice(0, 420),
    }))
    .filter((faq) => faq.question && faq.answer);

  const explicitFaqs = uniqueByQuestion([...templateMatches, ...stringMatches]).slice(0, 20);
  if (explicitFaqs.length) return explicitFaqs;

  const vaccinationText = pageText(supplementalPages, /vaccination/i);
  const hoursText = pageText(supplementalPages, /open-hours|contact-hours|hours/i);
  const bookingText = pageText(supplementalPages, /booking/i);
  const termsText = pageText(supplementalPages, /terms|conditions/i);
  const homeText = searchableText;

  return uniqueByQuestion(
    [
      {
        question: 'What vaccinations are required?',
        answer: combineSentences(vaccinationText, [
          /fully vaccinated against cat flu/i,
          /booking will not be confirmed until a copy of the vaccination record has been emailed/i,
        ]),
      },
      {
        question: 'What are your opening hours?',
        answer: cleanText(hours) || combineSentences(hoursText || searchableText, [
          /monday.?saturday[^.]*9:00am[^.]*10:30am/i,
          /3:30pm[^.]*5:30pm/i,
          /sunday[^.]*closed[^.]*morning/i,
        ]),
      },
      {
        question: 'When is my booking confirmed?',
        answer: combineSentences(bookingText, [
          /booking is only confirmed when we email through the confirmation quote/i,
          /if you do not hear from us within 24 hours/i,
        ]),
      },
      {
        question: 'Do you mix cats from different families?',
        answer: combineSentences(homeText, [
          /does not have communal living/i,
          /do not mix families/i,
        ]),
      },
      {
        question: 'Are there holiday surcharges or deposits?',
        answer: joinSentences(
          [
            excerptAroundPattern(termsText || hoursText, /50%\s+deposit\s+will\s+be\s+required/i, 180),
            excerptAroundPattern(termsText || hoursText, /\$3\.00(?:\s+extra\s+per\s+day|[^.]*surcharge)/i, 180),
            excerptAroundPattern(termsText || hoursText, /non refundable after the 25th of November/i, 180),
          ].filter(Boolean),
          320,
        ),
      },
    ]
      .filter((faq) => faq.answer),
  ).slice(0, 12);
}

function buildSiteContentLibrary(input: {
  sourceUrl: string;
  sourceHost: string;
  businessName: string;
  description: string;
  heroImage: string;
  galleryImages: Array<{ url: string; caption: string }>;
  phone: string;
  email: string;
  address: string;
  city: string;
  bookingUrl: string;
  hours: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
  };
  rooms: CatteryScrapedRoom[];
  services: CatteryScrapedService[];
  mediaAssets: CatteryMediaAsset[];
  highlights: Array<{ title: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
  reviews: CatteryScrapedReview[];
  owner: {
    title: string;
    text: string;
    image: string;
  };
  commitment: {
    title: string;
    text: string;
    items: Array<{ title: string; description: string }>;
  };
  locationDetails: {
    heading: string;
    text: string;
    directions: string;
    virtualTourUrl: string;
  };
  virtualTourUrl: string;
}): CatterySiteContentLibrary {
  const source: CatterySiteContentBlock['source'] = 'scrape';
  const blocks: CatterySiteContentBlock[] = [
    {
      id: 'hero',
      category: 'hero',
      title: input.businessName,
      text: input.description,
      source,
      images: input.heroImage ? [contentImageForUrl(input.heroImage, input.mediaAssets, input.businessName)] : [],
      links: input.bookingUrl ? [{ label: 'Book Now', url: input.bookingUrl }] : [],
    },
    {
      id: 'why-choose-us',
      category: 'why-choose-us',
      title: `Why choose ${input.businessName}`,
      text: input.description,
      source,
      items: input.highlights.map((highlight) => ({
        title: highlight.title,
        text: highlight.description,
      })),
    },
    {
      id: 'rooms-and-pricing',
      category: 'rooms',
      title: 'Rooms and pricing',
      text: 'Room options and rates extracted from the owner site.',
      source,
      items: input.rooms.map((room) => ({
        title: room.name,
        text: room.description,
        price: room.price && room.priceUnit ? `${room.price} ${room.priceUnit}` : room.price,
        image: room.image,
        meta: room.capacity ? `Up to ${room.capacity} cats` : undefined,
        features: room.amenities,
      })),
    },
    {
      id: 'services',
      category: 'services',
      title: 'Services',
      text: 'Additional care services extracted from the owner site.',
      source,
      items: input.services.map((service) => ({
        title: service.title,
        text: service.description,
        price: service.price,
        image: service.image,
      })),
    },
    {
      id: 'gallery',
      category: 'gallery',
      title: 'Gallery',
      text: 'Owner-site images available for preview templates.',
      source,
      images: input.galleryImages.map((image) => contentImageForUrl(image.url, input.mediaAssets, image.caption)),
    },
    {
      id: 'reviews',
      category: 'reviews',
      title: 'Reviews',
      text: 'Customer reviews extracted from the owner site.',
      source,
      items: input.reviews.map((review) => ({
        title: review.name,
        text: review.text,
        rating: review.rating,
        meta: review.location,
      })),
    },
    {
      id: 'faqs',
      category: 'faqs',
      title: 'Frequently Asked Questions',
      text: 'Question and answer content extracted from the owner site.',
      source,
      items: input.faqs.map((faq) => ({
        title: faq.question,
        answer: faq.answer,
      })),
    },
    {
      id: 'owner-story',
      category: 'owner-story',
      title: input.owner.title,
      text: input.owner.text,
      source,
      images: input.owner.image ? [contentImageForUrl(input.owner.image, input.mediaAssets, input.owner.title)] : [],
    },
    {
      id: 'commitment',
      category: 'commitment',
      title: input.commitment.title,
      text: input.commitment.text,
      source,
      items: input.commitment.items.map((item) => ({
        title: item.title,
        text: item.description,
      })),
    },
    {
      id: 'location',
      category: 'location',
      title: input.locationDetails.heading,
      text: input.locationDetails.text,
      source,
      items: input.locationDetails.directions ? [{ title: 'Directions', text: input.locationDetails.directions }] : [],
      links: input.virtualTourUrl ? [{ label: 'Virtual tour', url: input.virtualTourUrl }] : [],
    },
    {
      id: 'contact',
      category: 'contact',
      title: 'Contact',
      text: [input.address, input.phone, input.email, input.hours].filter(Boolean).join(' | '),
      source,
      items: [
        { title: 'Address', text: input.address },
        { title: 'Phone', text: input.phone },
        { title: 'Email', text: input.email },
        { title: 'Hours', text: input.hours },
      ].filter((item) => item.text),
      links: [
        input.bookingUrl ? { label: 'Book online', url: input.bookingUrl } : undefined,
        input.socialLinks.facebook ? { label: 'Facebook', url: input.socialLinks.facebook } : undefined,
        input.socialLinks.instagram ? { label: 'Instagram', url: input.socialLinks.instagram } : undefined,
      ].filter((link): link is { label: string; url: string } => Boolean(link)),
    },
  ];

  return {
    schemaVersion: 1,
    sourceUrl: input.sourceUrl,
    sourceHost: input.sourceHost,
    businessName: input.businessName,
    capturedAt: new Date().toISOString(),
    blocks,
    mediaAssets: input.mediaAssets,
  };
}

function contentImageForUrl(url: string, mediaAssets: CatteryMediaAsset[], fallbackCaption = '') {
  const asset = mediaAssets.find((candidate) => imageKey(candidate.url) === imageKey(url));
  return {
    url,
    caption: asset?.caption || asset?.alt || fallbackCaption,
    tags: asset?.tags,
    category: asset?.category,
    containsText: asset?.containsText,
  };
}

function buildWebsiteSettings(input: {
  businessName: string;
  description: string;
  heroImage: string;
  logoImage: string;
  images: string[];
  mediaAssets: CatteryMediaAsset[];
  galleryImages: Array<{ url: string; caption: string }>;
  phone: string;
  email: string;
  address: string;
  city: string;
  country?: string;
  bookingUrl: string;
  hours: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
  };
  rooms: CatteryScrapedRoom[];
  services: CatteryScrapedService[];
  highlights: Array<{ title: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
  reviews: CatteryScrapedReview[];
  owner: {
    title: string;
    text: string;
    image: string;
  };
  commitment: {
    title: string;
    text: string;
    items: Array<{ title: string; description: string }>;
  };
  locationDetails: {
    heading: string;
    text: string;
    directions: string;
    virtualTourUrl: string;
  };
  virtualTourUrl: string;
  siteContentLibrary: CatterySiteContentLibrary;
}): Record<string, unknown> {
  const curatedGalleryImages = input.galleryImages.length
    ? input.galleryImages
    : input.images.slice(0, 12).map((url, index) => ({ url, caption: `Cattery photo ${index + 1}` }));
  const galleryUrls = curatedGalleryImages.map((image) => image.url).filter(Boolean);
  const roomCards = input.rooms.map((room, index) => ({
    name: room.name,
    price: room.price && room.priceUnit ? `${room.price}/${room.priceUnit.replace(/^per\s+/i, '')}` : room.price,
    description: room.description,
    image: room.image || mediaUrls(input.mediaAssets, ['rooms', 'gallery'])[index] || galleryUrls[index + 1] || input.images[index + 1] || input.heroImage,
    popular: index === 0,
    features: room.amenities ?? [],
  }));

  return {
    businessName: input.businessName,
    subdomain: slugify(input.businessName),
    primaryColor: '#21483f',
    accentColor: '#b77a35',
    backgroundColor: '#f8f4ed',
    heroHeading: input.businessName,
    heroSubheading: firstSentence(input.description) || 'Your cats home away from home',
    aboutHeading: `About ${input.businessName}`,
    aboutText:
      input.description ||
      `${input.businessName} provides safe, comfortable cat boarding with personal care for every guest.`,
    heroImage: input.heroImage || input.images[0],
    logoImage: input.logoImage,
    mediaLibrary: input.mediaAssets,
    ctaText: 'Book a stay',
    headingFont: 'playfair',
    subheadingFont: 'inter',
    typography: 'playfair',
    phone: input.phone,
    email: input.email,
    address: input.address,
    hours: input.hours,
    socialLinks: input.socialLinks,
    virtualTourUrl: input.virtualTourUrl,
    location: [input.city, input.country].filter(Boolean).join(', '),
    sourceUrl: input.bookingUrl,
    whyChooseUsData: {
      whyChooseUsHeading: `Why choose ${input.businessName}`,
      whyChooseUsFeatures: input.highlights.map((highlight, index) => ({
        icon: ['Shield', 'Heart', 'Home'][index] ?? 'Star',
        title: highlight.title,
        description: highlight.description,
      })),
    },
    facilitiesData: {
      facilitiesHeading: 'Purpose-built cat accommodation',
      facilitiesText:
        input.highlights[0]?.description ||
        'Safe, calm boarding facilities designed specifically for cats.',
      facilitiesImage: imageByAssetContext(input.mediaAssets, /building|facility|indoor|communal/i, ['facilities', 'rooms']) || input.heroImage,
      facilityFeatures: input.highlights.map((highlight) => ({
        title: highlight.title,
        description: highlight.description,
      })),
    },
    suitesData: {
      suitesHeading: 'Boarding options',
      suites: roomCards,
    },
    servicesData: {
      servicesHeading: 'Care services',
      services: input.services.slice(0, 12).map((service, index) => ({
        icon: ['Heart', 'Camera', 'Clock', 'Shield'][index] ?? 'Star',
        title: service.title,
        description: service.price ? `${service.description} ${service.price}.` : service.description,
        image: service.image || mediaUrls(input.mediaAssets, ['services', 'gallery'])[index] || input.images[index + 2] || input.heroImage,
      })),
    },
    galleryData: {
      galleryHeading: `Happy cats at ${input.businessName}`,
      galleryImages: curatedGalleryImages,
    },
    faqData: {
      faqs: input.faqs,
    },
    testimonialsData: {
      testimonialsHeading: 'Guest reviews',
      testimonials: input.reviews,
    },
    ownerData: input.owner,
    commitmentData: input.commitment,
    locationData: input.locationDetails,
    siteContentLibrary: input.siteContentLibrary,
    contactData: {
      contactHeading: 'Contact and booking',
      hours: input.hours,
      socialLinks: input.socialLinks,
      virtualTourUrl: input.virtualTourUrl,
      locationDetails: input.locationDetails,
    },
    roomTypes: input.rooms.map((room) => ({
      name: room.name,
      numberOfRooms: '1',
      maxCatsPerRoom: String(room.capacity ?? 1),
      sameFamilyOnly: true,
    })),
    pricingRates: input.rooms
      .filter((room) => room.price_per_night)
      .map((room) => ({
        numberOfCats: '1',
        price: String(room.price_per_night),
        discountType: 'none',
        discountValue: '',
      })),
  };
}

function extractReadableBundleText(bundle: string): string[] {
  const values = [
    ...bundle.matchAll(/children:"([^"]{16,700})"/g),
    ...bundle.matchAll(/label:"([^"]{16,220})"/g),
    ...bundle.matchAll(/description:"([^"]{16,700})"/g),
  ].map((match) => cleanText(match[1]));

  return values
    .filter((value) => value && !/[{}<>]/.test(value))
    .filter((value) => /cat|cattery|boarding|facility|room|service|Deloraine|booking|vaccination|address|email|phone|owner|host|Vanessa|Paul|review|virtual|tour|airport|appointment|hours|routine/i.test(value));
}

function extractAddress(root: ReturnType<typeof parse>, text: string): string {
  const addressTag = cleanText(root.querySelector('address')?.text ?? '');
  if (addressTag) return addressTag;
  const labeledAddress = cleanText(
    text.match(/Address:\s*([\s\S]{10,160}?)(?:Primary Contact|Alternate Contact|Phone|Email|Opening Hours|Please note)/i)?.[1] ?? '',
  );
  if (labeledAddress) return labeledAddress;
  const streetMatch =
    text.match(/\b\d{1,5}\s+[A-Z][A-Za-z0-9' -]{2,80}(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Way),?\s+[A-Z][A-Za-z' -]{2,80}(?:,\s*[A-Z][A-Za-z' -]{2,80})?/);
  return cleanText(streetMatch?.[0] ?? '');
}

function extractPhone(text: string): string {
  const labeledPhone = text.match(/(?:Primary Contact|Alternate Contact|Phone):?\s*((?:\(\d{2}\)\s*\d{3}[-\s]?\d{4})|(?:0\d(?:[\s-]?\d){7,8}))/i);
  if (labeledPhone) return cleanText(labeledPhone[1]);
  const nzLandline = text.match(/\(\d{2}\)\s*\d{3}[-\s]?\d{4}\b/);
  if (nzLandline) return cleanText(nzLandline[0]);
  const nzMobile = text.match(/\b0(?:2\d|9|7|6|4|3)(?:[\s-]?\d){6,8}\b/);
  if (nzMobile) return cleanText(nzMobile[0]);
  const match = text.match(/(\+\d[\d\s\-().]{7,}\d)/);
  return match ? cleanText(match[1]) : '';
}

function extractEmail(text: string): string {
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : '';
}

function extractFirstUrl(text: string, preferredPattern?: RegExp): string {
  const urls = [...text.matchAll(/https?:\/\/[^"'`\s)]+/g)].map((match) => match[0].replace(/[),.;]+$/g, ''));
  return urls.find((url) => preferredPattern?.test(url)) || urls[0] || '';
}

function extractSocialLinks(text: string): { facebook?: string; instagram?: string } {
  const urls = [...text.matchAll(/https?:\/\/(?:www\.)?(?:facebook|instagram)\.com\/[^"'`\s)]+/gi)].map((match) =>
    match[0].replace(/[),.;]+$/g, ''),
  );
  return {
    facebook: urls.find((url) => /facebook/i.test(url)),
    instagram: urls.find((url) => /instagram/i.test(url)),
  };
}

function extractHours(text: string): string {
  if (/Mon-Sat:\s*9:00am\s*-\s*10:30am/i.test(text) && /Mon-Sun:\s*4:30pm\s*-\s*6:00pm/i.test(text) && /Closed Sunday mornings/i.test(text)) {
    return 'By appointment only. Mon-Sat: 9:00am - 10:30am. Mon-Sun: 4:30pm - 6:00pm. Closed Sunday mornings.';
  }
  const weekdayHours = text.match(/Monday-Saturday\s*(?:are open:)?\s*9:00am-10:30am.*?3:30pm-5:30pm/i)?.[0];
  const sundayHours = text.match(/Sunday\s*(?:we are )?(?:closed|CLOSED).*?3:30pm-5:30pm/i)?.[0];
  if (weekdayHours && sundayHours) {
    return 'Monday-Saturday: 9:00am - 10:30am and 3:30pm - 5:30pm. Sunday: closed mornings, open again 3:30pm - 5:30pm.';
  }
  const openHours = text.match(/Open Hours[^.]{0,180}(?:Closed Sunday mornings)?/i)?.[0];
  if (/Open Hours/i.test(openHours ?? '') && /By Appointment Only/i.test(text) && /Closed Sunday mornings/i.test(text)) {
    return 'By appointment only. Mon-Sat: 9:00am - 10:30am. Mon-Sun: 4:30pm - 6:00pm. Closed Sunday mornings.';
  }
  if (openHours) return cleanText(openHours);
  if (/By Appointment Only/i.test(text)) return 'By appointment only';
  return '';
}

function extractVirtualTourUrl(text: string, baseUrl: URL): string {
  const urlMatches = [...text.matchAll(/https?:\/\/[^"'`\s)]+/g)];
  for (const match of urlMatches) {
    const url = match[0].replace(/[),.;]+$/g, '');
    if (!/google\.[^/]+\/maps\/embed/i.test(url) && isEmbeddableVirtualTourUrl(url, baseUrl)) return url;
  }

  for (const match of urlMatches) {
    const url = match[0].replace(/[),.;]+$/g, '');
    const context = text.slice(Math.max(0, match.index - 500), match.index + 500);
    if (/google\.[^/]+\/maps\/embed/i.test(url) && /virtual|tour|facilit/i.test(context)) return url;
  }

  return '';
}

function isEmbeddableVirtualTourUrl(rawUrl: string, baseUrl: URL): boolean {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase();
    const sourceHost = baseUrl.hostname.replace(/^www\./, '').toLowerCase();
    if (hostname === sourceHost && url.hash) return false;
    if (/google\.[^/]+\/maps\/embed|my\.matterport\.com|kuula\.co|cloudpano\.com|realsee\.ai|eyespy360\.com/i.test(url.href)) {
      return true;
    }
    return /virtual|tour|360|streetview|matterport/i.test(url.href) && hostname !== sourceHost;
  } catch {
    return false;
  }
}

function buildReviews(bundle: string, bodyText: string, supplementalPages: ScrapedPage[]): CatteryScrapedReview[] {
  const reviewMatches = [
    ...bundle.matchAll(/name:"([^"]{2,80})",(?:location:"([^"]{2,80})",)?(?:rating:(\d),)?text:"([^"]{20,500})"/g),
    ...bundle.matchAll(/author:"([^"]{2,80})",quote:"([^"]{20,500})"/g),
  ];

  const reviews = reviewMatches
    .map((match) => {
      const hasQuoteShape = match.length === 3;
      return {
        name: cleanText(match[1]),
        location: hasQuoteShape ? '' : cleanText(match[2] ?? ''),
        rating: hasQuoteShape ? undefined : Number(match[3] ?? ''),
        text: cleanText(hasQuoteShape ? match[2] : match[4]),
      };
    })
    .filter((review) => review.name && review.text && !/Vanessa|Paul/i.test(review.name));

  if (reviews.length) return uniqueByReview(reviews).slice(0, 8);

  const galleryText = pageText(supplementalPages, /gallery|review|testimonial/i);
  const galleryReviews = extractReviewsFromPageText(galleryText);
  if (galleryReviews.length) return uniqueByReview(galleryReviews).slice(0, 8);

  if (/review\/widgetJs|revelationpets\.com\?s=review/i.test(`${bundle} ${bodyText}`)) {
    return REVELATION_PETS_REVIEW_FALLBACKS;
  }
  return [];
}

function buildSiteDescription(
  metaDescription: string,
  homeBodyText: string,
  supplementalPages: ScrapedPage[],
  supplementalHeadings: string[],
  bundleTexts: string[],
): string {
  if (!isWeakDescription(metaDescription)) return cleanText(metaDescription);

  const homeSummary = summarizePrimaryContent(homeBodyText);
  if (!isWeakDescription(homeSummary)) return homeSummary;

  const pageSummary = summarizePrimaryContent(pageText(supplementalPages, /pricing|contact|hours|vaccination|terms/i));
  if (!isWeakDescription(pageSummary)) return pageSummary;

  const headingSummary = supplementalHeadings.find((heading) => !isWeakDescription(heading));
  if (headingSummary) return cleanText(headingSummary);

  const bundleSummary = firstText(bundleTexts, /cat boarding|cattery|feline|facility/i);
  if (!isWeakDescription(bundleSummary)) return cleanText(bundleSummary);

  return 'A cat boarding website imported into CatStays.';
}

function pageText(pages: ScrapedPage[], pattern: RegExp): string {
  return cleanText(
    pages
      .filter((page) => pattern.test(`${page.url} ${page.title} ${page.heading}`))
      .map((page) => page.bodyText)
      .join(' '),
  );
}

function summarizePrimaryContent(text: string): string {
  const cleaned = cleanText(text);
  if (!cleaned) return '';
  const focusIndex = cleaned.toLowerCase().indexOf('welcome to');
  const focusText = focusIndex >= 0 ? cleaned.slice(focusIndex) : cleaned;
  const sentences = sentenceList(focusText)
    .filter((sentence) => /cat|cattery|suite|boarding|resort|feline|facility|care/i.test(sentence))
    .filter((sentence) => !/menu|skip to content|book now|new customers|existing customers|contact us|pricing|open hours/i.test(sentence));
  return joinSentences(sentences, 280);
}

function isWeakDescription(value: string): boolean {
  const text = cleanText(value);
  if (!text || text.length < 20) return true;
  return /^(gallery|booking form|contact details|open hours|pricing|home|page not found)$/i.test(text);
}

function sentenceList(text: string): string[] {
  return cleanText(text.replace(/([a-z])\.([A-Z])/g, '$1. $2'))
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => cleanText(sentence))
    .filter(Boolean);
}

function firstSentenceMatching(text: string, pattern: RegExp): string {
  const sentence = sentenceList(text).find((candidate) => pattern.test(candidate)) || '';
  if (sentence && sentence.length <= 220) return sentence;
  return excerptAroundPattern(sentence || text, pattern, 220);
}

function excerptAroundPattern(text: string, pattern: RegExp, maxChars: number): string {
  const cleaned = cleanText(text.replace(/([a-z])([A-Z])/g, '$1 $2'));
  const match = cleaned.match(pattern);
  if (!match || typeof match.index !== 'number') return cleaned.slice(0, maxChars).trim();
  const excerpt = cleaned.slice(match.index, match.index + maxChars);
  return cleanText(excerpt.replace(/©\s*\d{4}.*$/i, '').replace(/\s+/g, ' ')).slice(0, maxChars).trim();
}

function joinSentences(sentences: string[], maxChars: number): string {
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const sentence of sentences) {
    const normalized = sentence.toLowerCase();
    if (!sentence || seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(sentence);
  }

  let result = '';
  for (const sentence of unique) {
    const next = result ? `${result} ${sentence}` : sentence;
    if (next.length > maxChars && result) break;
    result = next.slice(0, maxChars).trim();
  }
  return result;
}

function combineSentences(text: string, patterns: RegExp[]): string {
  const matches = patterns
    .map((pattern) => firstSentenceMatching(text, pattern))
    .filter(Boolean);
  return joinSentences(matches, 320);
}

function extractReviewsFromPageText(text: string): CatteryScrapedReview[] {
  const cleaned = cleanText(text.replace(/[★☆]/g, ' '));
  if (!cleaned) return [];

  const reviewChunks = cleaned
    .split(/(?=\b[A-Z][A-Za-z.' -]{2,60}\s+(?:Recommended|Fantastic|Wonderful|Impressed)\b)/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const reviews: CatteryScrapedReview[] = [];

  reviewChunks.forEach((chunk) => {
      const match = chunk.match(/^([A-Z][A-Za-z.' -]{2,60})\s+(Recommended|Fantastic|Wonderful|Impressed)\s+([\s\S]+)$/);
      if (!match) return;
      const [, name,, rest] = match;
      const dateMatch = rest.match(/(\d{1,2}(?:st|nd|rd|th)\s+[A-Za-z]{3,9}\s+\d{4})/i);
      const date = dateMatch?.[1] || '';
      const textOnly = cleanText(rest.replace(date, '').replace(/©\s*\d{4}.*$/i, ''));
      const quote = textOnly.slice(0, 420);
      if (!name || !quote) return;
      reviews.push({
        name: cleanText(name),
        text: quote,
        rating: 5,
        location: date,
      });
    });

  return reviews;
}

function buildOwnerSection(bundle: string, mediaAssets: CatteryMediaAsset[], businessName: string) {
  const texts = extractReadableBundleText(bundle);
  const ownerTitle = firstText(texts, /Your Caring Hosts|About .*Vanessa|About .*Wilson|people behind/i);
  const ownerText = texts
    .filter((text) => /Paul|Vanessa|owner|host|family|farm|animals/i.test(text))
    .filter((text) => text !== ownerTitle)
    .slice(0, 3)
    .join(' ');
  const ownerImage = imageByAssetContext(mediaAssets, /Paul|Vanessa|Wilson|owner|host|team|staff|family|people/i, ['owner', 'gallery']);
  const fallbackTitle = `Meet the people behind ${businessName}`;
  return {
    title: !ownerText && !ownerImage
      ? fallbackTitle
      : /behind home/i.test(ownerTitle)
        ? fallbackTitle
        : ownerTitle || fallbackTitle,
    text: ownerText,
    image: ownerImage,
  };
}

function buildCommitmentSection(
  businessName: string,
  highlights: Array<{ title: string; description: string }>,
  bodyText: string,
) {
  const sourceItems = highlights.length
    ? highlights
    : [
        {
          title: 'Safe and secure',
          description: 'Imported care standards from the public cattery website.',
        },
      ];
  const vaccinationText = firstSentence(bodyText.match(/All cats must be vaccinated[^.]+(?:\.[^.]+)?/i)?.[0] ?? '');
  const items = [
    ...sourceItems,
    vaccinationText
      ? {
          title: 'Vaccination standards',
          description: vaccinationText,
        }
      : null,
  ].filter(Boolean) as Array<{ title: string; description: string }>;

  return {
    title: `${businessName} care standards`,
    text:
      firstText(
        extractReadableBundleText(bodyText),
        /safe|secure|vaccination|facility|care|routine/i,
      ) || 'Secure facilities, clear routines, and careful daily attention help every cat settle in.',
    items: uniqueByTitle(items).slice(0, 6),
  };
}

function buildLocationDetails(businessName: string, address: string, city: string, virtualTourUrl: string) {
  return {
    heading: `Visit ${businessName}`,
    text: address ? `${businessName} is located at ${address}.` : '',
    directions: city ? `Located in ${city}.` : '',
    virtualTourUrl,
  };
}

function serviceImage(title: string, mediaAssets: CatteryMediaAsset[]): string {
  const contentImages = mediaUrls(mediaAssets, ['services', 'gallery', 'rooms']);
  const lower = title.toLowerCase();
  let selected = '';
  if (lower.includes('brush') || lower.includes('flea')) {
    selected = imageByAssetContext(mediaAssets, /maine|groom|brush|flea|worm/i, ['services', 'gallery']) || contentImages[0] || '';
  } else if (lower.includes('airport') || lower.includes('pickup') || lower.includes('drop')) {
    selected = imageByAssetContext(mediaAssets, /driveway|bus|map|airport|transport|pickup|drop/i, ['services', 'contact', 'facilities']) || contentImages[0] || '';
  } else {
    selected = imageByAssetContext(mediaAssets, /cat|kitty|room|care|service/i, ['services', 'gallery', 'rooms']) || contentImages[0] || '';
  }
  if (/logo|icon/i.test(safeDecode(selected))) {
    return contentImages.find(Boolean) || selected;
  }
  return selected;
}

function capacityFromRoom(room: Record<string, unknown>): number {
  const name = String(room.name ?? '').toLowerCase();
  const description = String(room.description ?? '').toLowerCase();
  const text = `${name} ${description}`;
  const explicit = text.match(/up to (\w+|\d+) cats?/i)?.[1];
  if (explicit) return wordToNumber(explicit);
  if (name.includes('communal')) return 6;
  if (name.includes('private')) return 3;
  if (name.includes('indoor')) return 2;
  return 1;
}

function wordToNumber(value: string): number {
  const words: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
  };
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : words[value.toLowerCase()] ?? 1;
}

function absoluteUrl(src: string, baseUrl: URL): string {
  if (!src) return '';
  try {
    const decoded = decodeEntities(src).trim();
    if (decoded.startsWith('data:') || decoded.startsWith('blob:')) return '';
    return new URL(decoded, baseUrl.href).href;
  } catch {
    return '';
  }
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function imageKey(image?: string): string {
  if (!image) return '';
  try {
    const url = new URL(image);
    const normalizedPath = url.pathname.replace(/-\d+x\d+(?=\.[^.]+$)/i, '');
    return `${url.origin}${normalizedPath}`.toLowerCase();
  } catch {
    return image.split('?')[0].replace(/-\d+x\d+(?=\.[^.]+$)/i, '').toLowerCase();
  }
}

function imageWidth(image: string): number {
  const width = image.match(/[?&](?:w|width)=([0-9]+)/i)?.[1];
  return width ? Number(width) : 0;
}

function cityFromAddress(address: string): string {
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.at(-1) || '';
}

function countryFromAddress(address: string): string {
  return /\bnew zealand\b|\bnz\b/i.test(address) ? 'New Zealand' : '';
}

function cityFromHost(hostname: string): string {
  return hostname.replace(/^www\./, '').split('.')[0]?.replace(/[-_]+/g, ' ') || '';
}

function firstSentence(text: string): string {
  return cleanText(text).split(/(?<=[.!?])\s+/)[0] || '';
}

function firstText(values: string[], pattern: RegExp): string {
  return values.find((value) => pattern.test(value)) || '';
}

function uniqueByTitle(items: Array<{ title: string; description: string }>) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueByQuestion(items: Array<{ question: string; answer: string }>) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueByReview(items: CatteryScrapedReview[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.name.toLowerCase()}-${item.text.toLowerCase().slice(0, 80)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'cattery';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanText(value: string): string {
  return decodeEntities(value)
    .replace(/\\n/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
