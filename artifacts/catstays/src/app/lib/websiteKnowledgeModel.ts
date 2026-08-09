import type {
  CatterySiteContentBlock,
  CatterySiteContentItem,
  CatterySiteContentLibrary,
  ImportedCatteryScrape,
} from './deloraineDemo';

export type WebsiteKnowledgeCategory =
  | 'identity'
  | 'hero'
  | 'about'
  | 'accommodation'
  | 'boarding'
  | 'services'
  | 'grooming'
  | 'healthCare'
  | 'respite'
  | 'facilities'
  | 'pricing'
  | 'policies'
  | 'faqs'
  | 'testimonials'
  | 'gallery'
  | 'contact'
  | 'booking'
  | 'otherImportantContent';

export interface WebsiteKnowledgeImage {
  sourceUrl: string;
  renderedUrl: string;
  caption?: string;
  altText?: string;
  sourcePageUrl?: string;
  section?: WebsiteKnowledgeCategory;
}

export interface WebsiteKnowledgeSection {
  id: string;
  category: WebsiteKnowledgeCategory;
  anchor: string;
  title: string;
  text: string;
  items: CatterySiteContentItem[];
  images: WebsiteKnowledgeImage[];
  links: Array<{ label: string; url: string }>;
  sourceUrls: string[];
  sourceBlockIds: string[];
  priority: number;
}

export interface SourceCoverageReport {
  sourceUrl?: string;
  sourceHost?: string;
  pagesFound: number;
  pagesProcessed: number;
  pagesFailed: number;
  sourceBlocks: number;
  blocksMapped: number;
  blocksRendered: number;
  blocksOmitted: number;
  imagesFound: number;
  imagesImported: number;
  imagesRendered: number;
  crawledPages: Array<{ title: string; url: string; category: string }>;
  extractedBlocks: Array<{ id: string; title: string; category: string; sourceUrl?: string }>;
  mapped: Array<{ section: string; count: number; sourceUrls: string[] }>;
  renderedSections: Array<{ anchor: string; title: string; category: WebsiteKnowledgeCategory; sourceUrls: string[] }>;
  omitted: Array<{ id: string; title: string; category: string; reason: string }>;
  renderedImages: Array<{ sourceUrl: string; renderedUrl: string; section: string; sourcePageUrl?: string }>;
}

export interface WebsiteKnowledgeModel {
  schemaVersion: 1;
  analysisMode: 'structured-crawl-plan';
  sourceUrl?: string;
  sourceHost?: string;
  businessName: string;
  identity: {
    businessName: string;
    location: string;
    phone: string;
    email: string;
    address: string;
  };
  sections: WebsiteKnowledgeSection[];
  navigationItems: Array<{ label: string; href: string }>;
  diagnostics: SourceCoverageReport;
}

type CrawlPage = NonNullable<ImportedCatteryScrape['crawl']>['pages'][number];

const categoryPriority: Record<WebsiteKnowledgeCategory, number> = {
  identity: 0,
  hero: 5,
  about: 15,
  accommodation: 25,
  boarding: 30,
  services: 40,
  grooming: 45,
  healthCare: 50,
  respite: 55,
  facilities: 60,
  pricing: 65,
  policies: 70,
  faqs: 80,
  testimonials: 90,
  gallery: 95,
  contact: 100,
  booking: 105,
  otherImportantContent: 75,
};

const navLabels: Partial<Record<WebsiteKnowledgeCategory, string>> = {
  about: 'About',
  accommodation: 'Accommodation',
  boarding: 'Boarding',
  services: 'Services',
  grooming: 'Grooming',
  healthCare: 'Health Care',
  respite: 'Respite',
  facilities: 'Facilities',
  pricing: 'Pricing',
  policies: 'Policies',
  faqs: 'Q&A',
  gallery: 'Gallery',
  contact: 'Contact',
  booking: 'Booking',
};

export function buildWebsiteKnowledgeModel(
  scrape: ImportedCatteryScrape,
  library: CatterySiteContentLibrary,
): WebsiteKnowledgeModel {
  const businessName = stringFrom(library.businessName, scrape.title, scrape.heading, 'Imported Cattery');
  const importedImages = importedImageMap(scrape.websiteSettings?.importedImageAssets);
  const sourceImagePool = buildImagePool(scrape, importedImages);
  const sourceBlocks = normalizeBlocks(scrape, library);
  const omitted: SourceCoverageReport['omitted'] = [];
  const sectionsByCategory = new Map<WebsiteKnowledgeCategory, WebsiteKnowledgeSection>();
  const seenBlocks = new Set<string>();

  for (const block of sourceBlocks) {
    const signature = contentSignature(block);
    if (seenBlocks.has(signature)) {
      omitted.push({
        id: block.id,
        title: block.title,
        category: block.category,
        reason: 'Duplicate content already mapped from another source block.',
      });
      continue;
    }
    seenBlocks.add(signature);

    const category = classifyBlock(block);
    if (category === 'identity') continue;

    const section = ensureSection(sectionsByCategory, category, block, businessName);
    section.text = bestText(section.text, block.text);
    section.items = mergeItems(section.items, block.items ?? []);
    section.images = mergeImages(section.images, imagesForBlock(block, category, sourceImagePool));
    section.links = mergeLinks(section.links, block.links ?? []);
    section.sourceUrls = uniqueStrings([...section.sourceUrls, block.sourceUrl]);
    section.sourceBlockIds = uniqueStrings([...section.sourceBlockIds, block.id]);
  }

  enrichSectionsWithImages(sectionsByCategory, sourceImagePool);

  const sections = [...sectionsByCategory.values()]
    .filter((section) => hasRenderableSectionContent(section))
    .sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));

  const renderedBlockIds = new Set(sections.flatMap((section) => section.sourceBlockIds));
  for (const block of sourceBlocks) {
    if (renderedBlockIds.has(block.id)) continue;
    if (omitted.some((item) => item.id === block.id)) continue;
    if (classifyBlock(block) === 'identity') continue;
    omitted.push({
      id: block.id,
      title: block.title,
      category: block.category,
      reason: 'No distinct customer-facing content after cleanup.',
    });
  }

  const navigationItems = buildNavigationItems(sections);
  const renderedImages = sections.flatMap((section) =>
    section.images.map((image) => ({
      sourceUrl: image.sourceUrl,
      renderedUrl: image.renderedUrl,
      section: section.anchor,
      sourcePageUrl: image.sourcePageUrl,
    })),
  );

  const diagnostics: SourceCoverageReport = {
    sourceUrl: scrape.sourceUrl || library.sourceUrl,
    sourceHost: scrape.sourceHost || library.sourceHost,
    pagesFound: scrape.crawl?.pagesFound ?? scrape.crawl?.pages?.length ?? 0,
    pagesProcessed: scrape.crawl?.pagesProcessed ?? scrape.crawl?.pages?.length ?? 0,
    pagesFailed: scrape.crawl?.pagesFailed ?? scrape.crawl?.failedPages?.length ?? 0,
    sourceBlocks: library.blocks?.length ?? sourceBlocks.length,
    blocksMapped: renderedBlockIds.size,
    blocksRendered: renderedBlockIds.size,
    blocksOmitted: omitted.length,
    imagesFound: scrape.crawl?.imagesFound ?? scrape.images?.length ?? sourceImagePool.length,
    imagesImported: importedImages.size,
    imagesRendered: uniqueStrings(renderedImages.map((image) => image.renderedUrl)).length,
    crawledPages: (scrape.crawl?.pages ?? []).map((page) => ({
      title: stringFrom(page.heading, page.title, page.url),
      url: page.url,
      category: stringFrom(page.pageType, classifyText(`${page.url} ${page.title} ${page.heading}`)),
    })),
    extractedBlocks: sourceBlocks.map((block) => ({
      id: block.id,
      title: block.title,
      category: block.category,
      sourceUrl: block.sourceUrl,
    })),
    mapped: sections.map((section) => ({
      section: section.anchor,
      count: section.sourceBlockIds.length,
      sourceUrls: section.sourceUrls,
    })),
    renderedSections: sections.map((section) => ({
      anchor: section.anchor,
      title: section.title,
      category: section.category,
      sourceUrls: section.sourceUrls,
    })),
    omitted,
    renderedImages,
  };

  return {
    schemaVersion: 1,
    analysisMode: 'structured-crawl-plan',
    sourceUrl: scrape.sourceUrl || library.sourceUrl,
    sourceHost: scrape.sourceHost || library.sourceHost,
    businessName,
    identity: {
      businessName,
      location: stringFrom(scrape.city),
      phone: stringFrom(scrape.phone),
      email: stringFrom(scrape.email),
      address: stringFrom(scrape.address),
    },
    sections,
    navigationItems,
    diagnostics,
  };
}

export function sectionsForCategories(
  model: WebsiteKnowledgeModel | undefined,
  categories: WebsiteKnowledgeCategory[],
): WebsiteKnowledgeSection[] {
  if (!model) return [];
  const allowed = new Set(categories);
  return model.sections.filter((section) => allowed.has(section.category));
}

function normalizeBlocks(
  scrape: ImportedCatteryScrape,
  library: CatterySiteContentLibrary,
): CatterySiteContentBlock[] {
  const libraryBlocks = (library.blocks ?? []).filter(Boolean);
  if (libraryBlocks.length) return libraryBlocks;

  const pageBlockIds = new Set(libraryBlocks.filter((block) => block.sourceUrl).map((block) => block.sourceUrl));
  const crawlBlocks = (scrape.crawl?.pages ?? [])
    .filter((page) => page.bodyText && !pageBlockIds.has(page.url))
    .map((page, index): CatterySiteContentBlock => ({
      id: `crawl-page-${slugFromText(page.url || String(index + 1))}`,
      category: stringFrom(page.pageType, classifyText(`${page.url} ${page.title} ${page.heading}`)) as CatterySiteContentBlock['category'],
      title: stringFrom(page.heading, page.title, page.url),
      text: page.bodyText,
      source: 'scrape',
      sourceUrl: page.url,
      images: (page.images ?? []).map((image) => ({
        url: image.url,
        caption: stringFrom(image.caption, image.altText, page.title),
      })),
      links: [],
    }));

  return [...libraryBlocks, ...crawlBlocks].filter((block) => {
    const text = stringFrom(block.text);
    return text.length > 30 || Boolean(block.items?.length || block.images?.length || block.links?.length);
  });
}

function classifyBlock(block: CatterySiteContentBlock): WebsiteKnowledgeCategory {
  const category = String(block.category || '').toLowerCase();
  const id = String(block.id || '').toLowerCase();
  const locator = `${category} ${id} ${block.title} ${block.sourceUrl || ''}`.toLowerCase();
  if (category === 'hero' || id === 'hero') return 'hero';
  if (/contact|address|phone|email|hours|location|visit/.test(locator)) return 'contact';
  if (/booking|book now|enquiry|appointment|reserve/.test(locator)) return 'booking';
  if (/groom|brush|matting|coat|clip|nails?/.test(locator)) return 'grooming';
  if (/health.?care|healthcare|hyperbaric|oxygen|pemf|therapy|therapies|rehab|veterinary|wellness|feline health/.test(locator)) return 'healthCare';
  if (/respite|owner respite|carer|temporary care|short break/.test(locator)) return 'respite';
  if (/price|pricing|rate|fees?|cost|tariff|deposit|discount|all-products/.test(locator)) return 'pricing';
  if (/faq|q-a|q&a|question|answer|common questions/.test(locator)) return 'faqs';
  if (category === 'rooms') return 'accommodation';
  if (category === 'faqs' || category === 'faq') return 'faqs';
  if (category === 'reviews') return 'testimonials';
  if (category === 'gallery') return 'gallery';
  if (category === 'contact' || category === 'location') return 'contact';
  if (category === 'booking') return 'booking';
  if (category === 'pricing') return 'pricing';
  if (category === 'facilities' || category === 'daily-care' || category === 'commitment') return 'facilities';
  if (category === 'why-choose-us') return 'about';

  return classifyText(locator) || classifyText(`${block.title} ${block.text || ''}`.toLowerCase());
}

function classifyText(text: string): WebsiteKnowledgeCategory {
  if (/logo|navigation|menu/.test(text)) return 'identity';
  if (/contact|address|phone|email|hours|location|visit/.test(text)) return 'contact';
  if (/booking|book now|enquiry|appointment|reserve/.test(text)) return 'booking';
  if (/groom|brush|matting|coat|clip|nails?/.test(text)) return 'grooming';
  if (/health.?care|healthcare|hyperbaric|oxygen|pemf|therapy|therapies|rehab|veterinary|wellness|feline health/.test(text)) return 'healthCare';
  if (/respite|owner respite|carer|temporary care|short break/.test(text)) return 'respite';
  if (/price|pricing|rate|fees?|cost|tariff|deposit|discount|all-products/.test(text)) return 'pricing';
  if (/faq|q&a|question|answer|common questions/.test(text)) return 'faqs';
  if (/testimonial|review|guest family|recommend/.test(text)) return 'testimonials';
  if (/gallery|photo|image|portfolio/.test(text)) return 'gallery';
  if (/policy|policies|vaccination|terms|conditions|requirements|medication|arrival|departure/.test(text)) return 'policies';
  if (/accommodation|suite|room|chalet|unit|lodging|sleep/.test(text)) return 'accommodation';
  if (/boarding|cattery|cat stay|holiday|long stay|short stay/.test(text)) return 'boarding';
  if (/facility|facilities|secure|indoor|outdoor|garden|environment/.test(text)) return 'facilities';
  if (/service|care|feeding|transport|airport|play|attention/.test(text)) return 'services';
  if (/about|story|who we are|meet|team|family/.test(text)) return 'about';
  return 'otherImportantContent';
}

function ensureSection(
  sections: Map<WebsiteKnowledgeCategory, WebsiteKnowledgeSection>,
  category: WebsiteKnowledgeCategory,
  block: CatterySiteContentBlock,
  businessName: string,
) {
  const existing = sections.get(category);
  if (existing) {
    existing.title = bestTitle(existing.title, block.title, category, businessName);
    return existing;
  }

  const section: WebsiteKnowledgeSection = {
    id: category,
    category,
    anchor: anchorForCategory(category),
    title: bestTitle('', block.title, category, businessName),
    text: stringFrom(block.text),
    items: block.items ?? [],
    images: [],
    links: block.links ?? [],
    sourceUrls: uniqueStrings([block.sourceUrl]),
    sourceBlockIds: [block.id],
    priority: categoryPriority[category],
  };
  sections.set(category, section);
  return section;
}

function bestTitle(current: string, incoming: string, category: WebsiteKnowledgeCategory, businessName: string) {
  const fallback = defaultTitle(category, businessName);
  const normalizedCurrent = stringFrom(current);
  const normalizedIncoming = normalizedSectionTitle(stringFrom(incoming), category, businessName);
  if (!normalizedCurrent || normalizedCurrent === fallback) return normalizedIncoming || fallback;
  if (/^(services|gallery|contact|frequently asked questions)$/i.test(normalizedCurrent)) {
    return normalizedIncoming || normalizedCurrent;
  }
  return normalizedCurrent;
}

function normalizedSectionTitle(title: string, category: WebsiteKnowledgeCategory, businessName: string) {
  if (!title) return '';
  const defaultSectionTitle = defaultTitle(category, businessName);
  if (category === 'hero' || category === 'about') return title;
  const weak = new RegExp(`^(?:${escapeRegExp(businessName)}|about us|services|before|after|project title|collaborations?|home)$`, 'i');
  if (weak.test(title) || /fancyfelines\.nz$|all products/i.test(title)) return defaultSectionTitle;
  return title;
}

function defaultTitle(category: WebsiteKnowledgeCategory, businessName: string) {
  const titles: Record<WebsiteKnowledgeCategory, string> = {
    identity: businessName,
    hero: businessName,
    about: `About ${businessName}`,
    accommodation: 'Accommodation',
    boarding: 'Cat Boarding',
    services: 'Services',
    grooming: 'Grooming',
    healthCare: 'Feline Health Care',
    respite: 'Owner Respite',
    facilities: 'Facilities',
    pricing: 'Pricing',
    policies: 'Policies',
    faqs: 'Q&A',
    testimonials: 'Reviews',
    gallery: 'Gallery',
    contact: 'Contact',
    booking: 'Booking',
    otherImportantContent: 'Important Information',
  };
  return titles[category];
}

function anchorForCategory(category: WebsiteKnowledgeCategory) {
  const anchors: Record<WebsiteKnowledgeCategory, string> = {
    identity: 'identity',
    hero: 'home',
    about: 'about',
    accommodation: 'accommodation',
    boarding: 'boarding',
    services: 'services',
    grooming: 'grooming',
    healthCare: 'health-care',
    respite: 'respite',
    facilities: 'facilities',
    pricing: 'pricing',
    policies: 'policies',
    faqs: 'faqs',
    testimonials: 'reviews',
    gallery: 'gallery',
    contact: 'contact',
    booking: 'booking',
    otherImportantContent: 'important-information',
  };
  return anchors[category];
}

function bestText(current: string, incoming?: string) {
  const currentText = stringFrom(current);
  const incomingText = stringFrom(incoming);
  if (!incomingText) return currentText;
  if (!currentText) return incomingText;
  if (incomingText.length > currentText.length && !incomingText.includes(currentText)) return incomingText;
  return currentText;
}

function mergeItems(current: CatterySiteContentItem[], incoming: CatterySiteContentItem[]) {
  const seen = new Set(current.map((item) => contentSignatureForText(`${item.title} ${item.text || ''} ${item.answer || ''}`)));
  const result = [...current];
  for (const item of incoming) {
    const key = contentSignatureForText(`${item.title} ${item.text || ''} ${item.answer || ''}`);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result.slice(0, 12);
}

function mergeImages(current: WebsiteKnowledgeImage[], incoming: WebsiteKnowledgeImage[]) {
  const seen = new Set(current.map((image) => normalizedImageKey(image.renderedUrl)));
  const result = [...current];
  for (const image of incoming) {
    const key = normalizedImageKey(image.renderedUrl);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(image);
  }
  return result.slice(0, 10);
}

function mergeLinks(current: Array<{ label: string; url: string }>, incoming: Array<{ label: string; url: string }>) {
  const seen = new Set(current.map((link) => link.url));
  const result = [...current];
  for (const link of incoming) {
    if (!link.url || seen.has(link.url)) continue;
    seen.add(link.url);
    result.push(link);
  }
  return result.slice(0, 8);
}

function buildImagePool(
  scrape: ImportedCatteryScrape,
  importedImages: Map<string, string>,
): WebsiteKnowledgeImage[] {
  const images: WebsiteKnowledgeImage[] = [];
  const add = (url: unknown, meta: Partial<WebsiteKnowledgeImage> = {}) => {
    const renderedUrl = stringFrom(url);
    if (!renderedUrl || !isUsableImage(renderedUrl)) return;
    const sourceUrl = [...importedImages.entries()].find(([, storedUrl]) => normalizedImageKey(storedUrl) === normalizedImageKey(renderedUrl))?.[0] || renderedUrl;
    images.push({
      sourceUrl,
      renderedUrl,
      caption: meta.caption,
      altText: meta.altText,
      sourcePageUrl: meta.sourcePageUrl,
    });
  };

  add(scrape.heroImage, { caption: scrape.title, sourcePageUrl: scrape.sourceUrl });
  (scrape.images ?? []).forEach((image) => add(image, { sourcePageUrl: scrape.sourceUrl }));
  (scrape.galleryImages ?? []).forEach((image) => add(image.url, { caption: image.caption, sourcePageUrl: scrape.sourceUrl }));
  (scrape.siteContentLibrary?.blocks ?? []).forEach((block) => {
    (block.images ?? []).forEach((image) => add(image.url, { caption: image.caption, sourcePageUrl: block.sourceUrl }));
  });
  (scrape.crawl?.pages ?? []).forEach((page) => {
    (page.images ?? []).forEach((image) => add(image.url, {
      caption: image.caption,
      altText: image.altText,
      sourcePageUrl: image.sourcePageUrl || page.url,
    }));
  });

  return uniqueImages(images);
}

function imagesForBlock(
  block: CatterySiteContentBlock,
  category: WebsiteKnowledgeCategory,
  pool: WebsiteKnowledgeImage[],
) {
  const explicit = (block.images ?? [])
    .map((image) => imageForUrl(image.url, pool, { caption: image.caption, sourcePageUrl: block.sourceUrl }))
    .filter((image): image is WebsiteKnowledgeImage => Boolean(image))
    .map((image) => ({ ...image, section: category }));
  if (explicit.length) return explicit;

  const matcher = imageMatcher(category, `${block.title} ${block.text || ''} ${block.sourceUrl || ''}`);
  return pool
    .filter((image) => {
      const haystack = `${image.sourceUrl} ${image.renderedUrl} ${image.caption || ''} ${image.altText || ''} ${image.sourcePageUrl || ''}`.toLowerCase();
      return matcher.test(haystack) || (block.sourceUrl && image.sourcePageUrl === block.sourceUrl);
    })
    .slice(0, 4)
    .map((image) => ({ ...image, section: category }));
}

function enrichSectionsWithImages(
  sections: Map<WebsiteKnowledgeCategory, WebsiteKnowledgeSection>,
  pool: WebsiteKnowledgeImage[],
) {
  const used = new Set<string>();
  for (const section of [...sections.values()].sort((a, b) => a.priority - b.priority)) {
    section.images.forEach((image) => used.add(normalizedImageKey(image.renderedUrl)));
    if (section.images.length) continue;
    const matcher = imageMatcher(section.category, section.title);
    const candidate = pool.find((image) => {
      const key = normalizedImageKey(image.renderedUrl);
      if (!key || used.has(key)) return false;
      const haystack = `${image.sourceUrl} ${image.renderedUrl} ${image.caption || ''} ${image.altText || ''} ${image.sourcePageUrl || ''}`.toLowerCase();
      return matcher.test(haystack);
    }) || pool.find((image) => !used.has(normalizedImageKey(image.renderedUrl)));
    if (!candidate) continue;
    used.add(normalizedImageKey(candidate.renderedUrl));
    section.images = [{ ...candidate, section: section.category }];
  }
}

function imageMatcher(category: WebsiteKnowledgeCategory, context: string) {
  const text = `${category} ${context}`.toLowerCase();
  if (/groom/.test(text)) return /groom|brush|clip|coat|nail|maincoone|mat/i;
  if (/healthcare|health.?care|therapy|hyperbaric|oxygen|pemf/.test(text)) return /health|therapy|oxygen|pemf|wellness|vet|care/i;
  if (/respite/.test(text)) return /respite|care|home|boarding/i;
  if (/accommodation|boarding|room|suite/.test(text)) return /room|suite|accommodation|boarding|cat|cattery|unit/i;
  if (/pricing/.test(text)) return /price|rate|fees?|boarding|cat/i;
  if (/facilit/.test(text)) return /facility|building|exterior|indoor|outdoor|cattery|garden/i;
  if (/gallery/.test(text)) return /gallery|photo|cat|kitten|cattery/i;
  return /cat|cattery|boarding|care|facility|photo|image/i;
}

function imageForUrl(
  url: string,
  pool: WebsiteKnowledgeImage[],
  fallback: Partial<WebsiteKnowledgeImage>,
) {
  const key = normalizedImageKey(url);
  const match = pool.find((image) => normalizedImageKey(image.renderedUrl) === key || normalizedImageKey(image.sourceUrl) === key);
  if (match) return match;
  if (!isUsableImage(url)) return undefined;
  return {
    sourceUrl: url,
    renderedUrl: url,
    caption: fallback.caption,
    sourcePageUrl: fallback.sourcePageUrl,
  };
}

function importedImageMap(value: unknown): Map<string, string> {
  const map = new Map<string, string>();
  if (!Array.isArray(value)) return map;
  for (const asset of value) {
    if (!asset || typeof asset !== 'object') continue;
    const record = asset as Record<string, unknown>;
    const originalUrl = stringFrom(record.originalUrl);
    const storedUrl = stringFrom(record.storedUrl);
    if (originalUrl && storedUrl) map.set(originalUrl, storedUrl);
  }
  return map;
}

function buildNavigationItems(sections: WebsiteKnowledgeSection[]) {
  const allowed = sections.filter((section) => section.category !== 'hero' && section.category !== 'identity');
  const compact = allowed.filter((section) => section.category !== 'otherImportantContent').slice(0, 8);
  return compact.map((section) => ({
    label: navLabels[section.category] || section.title,
    href: `#${section.anchor}`,
  }));
}

function hasRenderableSectionContent(section: WebsiteKnowledgeSection) {
  return Boolean(section.title && (section.text || section.items.length || section.images.length || section.links.length));
}

function contentSignature(block: CatterySiteContentBlock) {
  return `${classifyBlock(block)}:${contentSignatureForText(`${block.title} ${block.text || ''}`)}`;
}

function contentSignatureForText(text: string) {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .slice(0, 180);
}

function uniqueImages(images: WebsiteKnowledgeImage[]) {
  const seen = new Set<string>();
  const result: WebsiteKnowledgeImage[] = [];
  for (const image of images) {
    const key = normalizedImageKey(image.renderedUrl);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(image);
  }
  return result;
}

function uniqueStrings(values: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const text = stringFrom(value);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    result.push(text);
  }
  return result;
}

function stringFrom(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return '';
}

function slugFromText(text: string) {
  return text.toLowerCase().replace(/https?:\/\//g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizedImageKey(image: string) {
  return image.split('?')[0].trim().toLowerCase();
}

function isUsableImage(image: string) {
  const decoded = decodeURIComponent(image.split('?')[0].toLowerCase());
  return !/logo|favicon|apple-touch-icon|icon|avatar|profile|placeholder|silhouette|open.?graph|\/og[-_.]|social.?card/i.test(decoded);
}
