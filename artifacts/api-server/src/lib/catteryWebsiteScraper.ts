import { parse } from 'node-html-parser';
import https from 'https';
import http from 'http';
import dns from 'dns';
import net from 'net';

const FETCH_TIMEOUT_MS = 10_000;
const MAX_HTML_BYTES = 1_200_000;
const MAX_ASSET_BYTES = 2_500_000;
const MAX_REDIRECTS = 5;

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

export interface CatteryWebsiteScrapeResult {
  sourceUrl: string;
  sourceHost: string;
  title: string;
  description: string;
  heading: string;
  heroImage: string;
  logoImage: string;
  images: string[];
  galleryImages: Array<{ url: string; caption: string }>;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  bookingUrl: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
  };
  highlights: Array<{ title: string; description: string }>;
  rooms: CatteryScrapedRoom[];
  services: CatteryScrapedService[];
  faqs: Array<{ question: string; answer: string }>;
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

export async function scrapeCatteryWebsite(rawUrl: string): Promise<CatteryWebsiteScrapeResult> {
  const parsedUrl = normalisePublicUrl(rawUrl);
  const html = await fetchText(parsedUrl, {
    maxBytes: MAX_HTML_BYTES,
    acceptedContent: /text\/html|application\/xhtml\+xml/i,
  });

  const root = parse(html);
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
  const bundleTexts = extractReadableBundleText(scriptBundle);
  const bodyText = cleanText([
    root.querySelector('body')?.text ?? root.text,
    ...bundleTexts.slice(0, 80),
  ].join(' '));
  const searchableText = cleanText(`${bodyText} ${scriptBundle}`);
  const bundleImages = collectBundleAssets(scriptBundle, parsedUrl);
  const htmlImages = collectHtmlImages(root, parsedUrl);
  const images = curateImageUrls([
    meta.heroImage,
    ...htmlImages,
    ...bundleImages,
  ]);

  const logoImage = findLogoImage(images);
  const heroImage = findHeroImage(images, logoImage) || meta.heroImage;
  const phone = extractPhone(searchableText);
  const email = extractEmail(searchableText);
  const address = extractAddress(root, searchableText);
  const city = cityFromAddress(address) || cityFromHost(parsedUrl.hostname);
  const bookingUrl = extractFirstUrl(html + '\n' + scriptBundle, /revelationpets\.com|book/i);
  const socialLinks = extractSocialLinks(html + '\n' + scriptBundle);
  const rooms = buildRooms(apiRooms, scriptBundle, images);
  const services = buildServices(scriptBundle, images);
  const highlights = buildHighlights(scriptBundle, bodyText);
  const faqs = buildFaqs(scriptBundle);
  const galleryImages = buildGalleryImages(scriptBundle, images, logoImage);
  const title = cleanText(meta.title || firstText(bundleTexts, /Deloraine Cattery|Cattery/i) || 'Your Cattery');
  const heading = cleanText(meta.heading || title.replace(/\s+-\s+.*$/, '') || 'Your Cattery');
  const description = cleanText(
    meta.description ||
      firstText(bundleTexts, /cat boarding|cattery|feline|facility/i) ||
      'A cat boarding website imported into CatStays.',
  );

  if (!title && !description && !heading && !heroImage && !phone && !email && !images.length) {
    throw new TypeError('NO_USEFUL_CONTENT');
  }

  const businessName = heading || title.replace(/\s+-\s+.*$/, '') || 'Your Cattery';
  const websiteSettings = buildWebsiteSettings({
    businessName,
    description,
    heroImage,
    logoImage,
    images,
    galleryImages,
    phone,
    email,
    address,
    city,
    bookingUrl,
    rooms,
    services,
    highlights,
    faqs,
  });

  return {
    sourceUrl: parsedUrl.toString(),
    sourceHost: parsedUrl.hostname.replace(/^www\./, ''),
    title,
    description,
    heading,
    heroImage,
    logoImage,
    images,
    galleryImages,
    phone,
    email,
    address,
    city,
    country: countryFromAddress(address),
    bookingUrl,
    socialLinks,
    highlights,
    rooms,
    services,
    faqs,
    bodyText: bodyText.slice(0, 2500),
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
      custom_domain: parsedUrl.hostname.replace(/^www\./, ''),
      source_url: parsedUrl.toString(),
    },
    demoRooms: rooms,
  };
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

function collectSameOriginScripts(root: ReturnType<typeof parse>, baseUrl: URL): URL[] {
  return root
    .querySelectorAll('script[src]')
    .map((script) => absoluteUrl(script.getAttribute('src') ?? '', baseUrl))
    .filter(Boolean)
    .map((src) => new URL(src))
    .filter((url) => url.origin === baseUrl.origin && /\.m?js$/i.test(url.pathname));
}

function collectHtmlImages(root: ReturnType<typeof parse>, baseUrl: URL): string[] {
  const images: string[] = [];
  for (const img of root.querySelectorAll('img')) {
    const src = img.getAttribute('src');
    const srcset = img.getAttribute('srcset');
    if (src) images.push(src);
    if (srcset) {
      for (const candidate of srcset.split(',')) {
        const [candidateUrl] = candidate.trim().split(/\s+/);
        if (candidateUrl) images.push(candidateUrl);
      }
    }
  }
  return images.map((image) => absoluteUrl(image, baseUrl)).filter(Boolean);
}

function collectBundleAssets(bundle: string, baseUrl: URL): string[] {
  const assets = [
    ...bundle.matchAll(/["'`](\/assets\/[^"'`]+?\.(?:jpe?g|png|webp|avif))["'`]/gi),
    ...bundle.matchAll(/["'`](https?:\/\/[^"'`\s)]+?\.(?:jpe?g|png|webp|avif)(?:\?[^"'`\s)]*)?)["'`]/gi),
  ];
  return assets.map((match) => absoluteUrl(match[1], baseUrl)).filter(Boolean);
}

function curateImageUrls(rawImages: string[]): string[] {
  const byKey = new Map<string, string>();
  for (const image of rawImages) {
    if (!image) continue;
    if (/\.(svg|gif)(\?|$)/i.test(image)) continue;
    if (/favicon|apple-touch-icon|placeholder|avatar|profile|icon/i.test(image)) continue;
    const key = imageKey(image);
    const existing = byKey.get(key);
    if (!existing || imageWidth(image) > imageWidth(existing)) {
      byKey.set(key, image);
    }
  }
  return Array.from(byKey.values()).slice(0, 30);
}

function findLogoImage(images: string[]): string {
  return images.find((image) => /logo/i.test(decodeURIComponent(image))) ?? '';
}

function findHeroImage(images: string[], logoImage: string): string {
  const logoKey = imageKey(logoImage);
  return (
    images.find((image) => /building|facility|cattery|exterior|hero/i.test(decodeURIComponent(image)) && imageKey(image) !== logoKey) ||
    images.find((image) => imageKey(image) !== logoKey) ||
    ''
  );
}

function buildGalleryImages(bundle: string, images: string[], logoImage: string): Array<{ url: string; caption: string }> {
  const captionsByAsset = new Map<string, string>();
  const galleryMatches = bundle.matchAll(/src:([A-Za-z0-9_$]+),alt:"([^"]*)",title:"([^"]*)"/g);
  for (const match of galleryMatches) {
    captionsByAsset.set(match[1], cleanText(match[3] || match[2]));
  }

  const logoKey = imageKey(logoImage);
  return images
    .filter((image) => imageKey(image) !== logoKey)
    .slice(0, 12)
    .map((url, index) => ({
      url,
      caption: captionForImage(url, captionsByAsset) || `Cattery photo ${index + 1}`,
    }));
}

function captionForImage(image: string, captionsByAsset: Map<string, string>): string {
  const decoded = decodeURIComponent(image);
  for (const [assetVar, caption] of captionsByAsset.entries()) {
    if (decoded.includes(assetVar)) return caption;
  }
  const file = decoded.split('/').pop()?.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') ?? '';
  return cleanText(file.replace(/\b[A-Za-z0-9]{6,}\b/g, ''));
}

function buildRooms(apiRooms: CatteryScrapedRoom[], bundle: string, images: string[]): CatteryScrapedRoom[] {
  const roomImages = {
    private: images.find((image) => /private/i.test(decodeURIComponent(image))),
    communal: images.find((image) => /communal/i.test(decodeURIComponent(image))),
    indoor: images.find((image) => /indoor/i.test(decodeURIComponent(image))),
  };

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
              : roomImages.private || roomImages.indoor || images[0],
    }));
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
          ? roomImages.private
          : name.toLowerCase().includes('communal')
            ? roomImages.communal
            : roomImages.indoor,
    }));
}

function buildServices(bundle: string, images: string[]): CatteryScrapedService[] {
  const matches = [...bundle.matchAll(/name:"([^"]{3,80})",price:"([^"]{1,80})",description:"([^"]{20,420})"/g)];
  const services = matches
    .map((match) => ({
      title: cleanText(match[1]),
      price: cleanText(match[2]),
      description: cleanText(match[3]),
      image: serviceImage(match[1], images),
    }))
    .filter((service) => !/professional grooming/i.test(service.title));

  if (services.length) return services.slice(0, 8);

  return [
    {
      title: 'Cat boarding',
      description: 'Comfortable accommodation and daily care for cats.',
      image: images[0],
    },
    {
      title: 'Photo updates',
      description: 'Friendly updates for families while cats are staying.',
      image: images[1] || images[0],
    },
  ];
}

function buildHighlights(bundle: string, bodyText: string): Array<{ title: string; description: string }> {
  const matches = [...bundle.matchAll(/title:"([^"]{3,80})",description:"([^"]{20,320})"/g)]
    .map((match) => ({ title: cleanText(match[1]), description: cleanText(match[2]) }))
    .filter((item) => !/Daily Brush|Medicine|Electric|Airport|Flea|Veterinary|Professional Grooming/i.test(item.title));

  if (matches.length) return uniqueByTitle(matches).slice(0, 3);

  const fallback = [
    ['Safe and secure', /safe|secure|security/i],
    ['Purpose-built facility', /purpose built|facility/i],
    ['On-site care', /on site|animal loving|care/i],
  ] as const;

  return fallback
    .filter(([, pattern]) => pattern.test(bodyText))
    .map(([title]) => ({ title, description: 'Imported from the public cattery website.' }));
}

function buildFaqs(bundle: string): Array<{ question: string; answer: string }> {
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

  return uniqueByQuestion([...templateMatches, ...stringMatches]).slice(0, 6);
}

function buildWebsiteSettings(input: {
  businessName: string;
  description: string;
  heroImage: string;
  logoImage: string;
  images: string[];
  galleryImages: Array<{ url: string; caption: string }>;
  phone: string;
  email: string;
  address: string;
  city: string;
  bookingUrl: string;
  rooms: CatteryScrapedRoom[];
  services: CatteryScrapedService[];
  highlights: Array<{ title: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
}): Record<string, unknown> {
  const roomCards = input.rooms.map((room, index) => ({
    name: room.name,
    price: room.price && room.priceUnit ? `${room.price}/${room.priceUnit.replace(/^per\s+/i, '')}` : room.price,
    description: room.description,
    image: room.image || input.images[index + 1] || input.heroImage,
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
    ctaText: 'Book a stay',
    headingFont: 'playfair',
    subheadingFont: 'inter',
    typography: 'playfair',
    phone: input.phone,
    email: input.email,
    address: input.address,
    location: input.city,
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
      facilitiesImage: input.images.find((image) => /building|facility|indoor|communal/i.test(decodeURIComponent(image))) || input.heroImage,
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
      services: input.services.slice(0, 4).map((service, index) => ({
        icon: ['Heart', 'Camera', 'Clock', 'Shield'][index] ?? 'Star',
        title: service.title,
        description: service.price ? `${service.description} ${service.price}.` : service.description,
        image: service.image || input.images[index + 2] || input.heroImage,
      })),
    },
    galleryData: {
      galleryHeading: `Happy cats at ${input.businessName}`,
      galleryImages: input.galleryImages.length
        ? input.galleryImages
        : input.images.slice(0, 8).map((url, index) => ({ url, caption: `Cattery photo ${index + 1}` })),
    },
    faqData: {
      faqs: input.faqs,
    },
    contactData: {
      contactHeading: 'Contact and booking',
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
    .filter((value) => /cat|cattery|boarding|facility|room|service|Deloraine|booking|vaccination|address|email|phone/i.test(value));
}

function extractAddress(root: ReturnType<typeof parse>, text: string): string {
  const addressTag = cleanText(root.querySelector('address')?.text ?? '');
  if (addressTag) return addressTag;
  const streetMatch =
    text.match(/\b\d{1,5}\s+[A-Z][A-Za-z0-9' -]{2,80}(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Way),?\s+[A-Z][A-Za-z' -]{2,80}(?:,\s*[A-Z][A-Za-z' -]{2,80})?/);
  return cleanText(streetMatch?.[0] ?? '');
}

function extractPhone(text: string): string {
  const nzMobile = text.match(/\b0(?:2\d|9|7|6|4|3)\s?\d{3}\s?\d{3,4}\b/);
  if (nzMobile) return cleanText(nzMobile[0]);
  const match = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
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

function serviceImage(title: string, images: string[]): string {
  const lower = title.toLowerCase();
  if (lower.includes('brush') || lower.includes('flea')) {
    return images.find((image) => /maine|groom|brush/i.test(decodeURIComponent(image))) || images[0];
  }
  if (lower.includes('airport') || lower.includes('pickup') || lower.includes('drop')) {
    return images.find((image) => /driveway|bus|map/i.test(decodeURIComponent(image))) || images[0];
  }
  return images.find((image) => /cat|kitty|room/i.test(decodeURIComponent(image))) || images[0];
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

function imageKey(image?: string): string {
  if (!image) return '';
  try {
    const url = new URL(image);
    return `${url.origin}${url.pathname}`.toLowerCase();
  } catch {
    return image.split('?')[0].toLowerCase();
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
