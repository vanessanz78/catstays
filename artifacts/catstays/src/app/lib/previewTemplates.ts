import {
  buildPreviewDataFromScrape,
  type DelorainePreviewData,
  type ImportedCatteryScrape,
} from './deloraineDemo';

export type { ImportedCatteryScrape } from './deloraineDemo';

export type PreviewTemplateId = 'original' | 'conversion-focus' | 'editorial-guide' | 'modern-showcase';

export interface PreviewTemplateOption {
  id: PreviewTemplateId;
  name: string;
  description: string;
  image: string;
  sourceOnly?: boolean;
}

export interface PreviewImportRecord {
  id: string;
  status: 'preview' | 'live';
  selectedTemplate: PreviewTemplateId;
  createdAt: string;
  source: {
    url: string;
    host: string;
    extractedFrom?: ImportedCatteryScrape['extractedFrom'];
  };
  identity: {
    businessName: string;
    location: string;
    subdomain: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    city: string;
  };
  media: {
    heroImage?: string;
    logoImage?: string;
    images: string[];
    galleryImages: NonNullable<ImportedCatteryScrape['galleryImages']>;
  };
  content: {
    title: string;
    description: string;
    heading: string;
    heroHeading: string;
    heroSubheading: string;
    aboutHeading: string;
    aboutText: string;
    highlights: NonNullable<ImportedCatteryScrape['highlights']>;
  };
  rooms: NonNullable<ImportedCatteryScrape['rooms']>;
  services: NonNullable<ImportedCatteryScrape['services']>;
  faqs: NonNullable<ImportedCatteryScrape['faqs']>;
  normalizedPreviewData: DelorainePreviewData;
}

export interface CatstaysTemplateContent {
  business: {
    name: string;
    tagline: string;
    location: string;
  };
  hero: {
    eyebrow: string;
    heading: string;
    text: string;
    image: string;
    button: string;
  };
  features: Array<{
    title: string;
    text: string;
  }>;
  about: {
    title: string;
    text: string;
    image: string;
  };
  gallery: Array<{
    image: string;
    caption: string;
  }>;
  suites: Array<{
    image: string;
    title: string;
    text: string;
  }>;
  testimonials: Array<{
    quote: string;
    author: string;
    image: string;
  }>;
  booking: {
    text: string;
    bannerText: string;
    primaryCta: string;
  };
  footer: {
    about: string;
    phone: string;
    email: string;
    address: string;
    hours: string;
  };
}

export const previewImportTableStorageKey = 'catstays_preview_import_table';

export const previewTemplateCards: PreviewTemplateOption[] = [
  {
    id: 'original',
    name: 'Original',
    description: 'The scraped website exactly as it appears now',
    image: 'https://images.unsplash.com/photo-1494253109108-2e30c049369b?w=900&h=600&fit=crop',
    sourceOnly: true,
  },
  {
    id: 'conversion-focus',
    name: 'Focus',
    description: 'Conversion-first layout with booking widget below the hero',
    image: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=900&h=600&fit=crop',
  },
  {
    id: 'editorial-guide',
    name: 'Editorial',
    description: 'Story-led checkerboard sections with magazine-style pacing',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=900&h=600&fit=crop',
  },
  {
    id: 'modern-showcase',
    name: 'Showcase',
    description: 'Image-first pages with minimal copy and strong visual rhythm',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=900&h=600&fit=crop',
  },
];

const templateConfig: Record<Exclude<PreviewTemplateId, 'original'>, Partial<DelorainePreviewData>> = {
  'conversion-focus': {
    primaryColor: '#1f241b',
    accentColor: '#2f3b22',
    backgroundColor: '#F8F7F5',
    typography: 'playfair',
    headingFont: 'playfair',
    subheadingFont: 'inter',
  },
  'editorial-guide': {
    primaryColor: '#222222',
    accentColor: '#556b3f',
    backgroundColor: '#F8F5EF',
    typography: 'playfair',
    headingFont: 'playfair',
    subheadingFont: 'inter',
  },
  'modern-showcase': {
    primaryColor: '#222222',
    accentColor: '#556b3f',
    backgroundColor: '#F8F6F1',
    typography: 'playfair',
    headingFont: 'playfair',
    subheadingFont: 'inter',
  },
};

export function generatedTemplateCards() {
  return previewTemplateCards.filter((template) => !template.sourceOnly);
}

export function templateOptionsForData(data: Record<string, any>): PreviewTemplateOption[] {
  const hasOriginal = Boolean(data.previewImportRecord?.source?.url || data.importSourceUrl || data.sourceUrl);
  return hasOriginal ? previewTemplateCards : generatedTemplateCards();
}

export function buildPreviewImportRecord(scrape: ImportedCatteryScrape): PreviewImportRecord {
  const normalizedPreviewData = buildPreviewDataFromScrape(scrape);
  const sourceUrl = scrape.sourceUrl || '';
  const sourceHost = scrape.sourceHost || hostFromUrl(sourceUrl);
  const businessName = normalizedPreviewData.businessName;

  return {
    id: `${slugify(sourceHost || businessName)}-${Date.now()}`,
    status: 'preview',
    selectedTemplate: 'original',
    createdAt: new Date().toISOString(),
    source: {
      url: sourceUrl,
      host: sourceHost,
      extractedFrom: scrape.extractedFrom,
    },
    identity: {
      businessName,
      location: normalizedPreviewData.location,
      subdomain: normalizedPreviewData.subdomain,
    },
    contact: {
      phone: normalizedPreviewData.phone,
      email: normalizedPreviewData.email,
      address: normalizedPreviewData.address,
      city: scrape.city || normalizedPreviewData.location,
    },
    media: {
      heroImage: normalizedPreviewData.heroImage,
      logoImage: scrape.logoImage,
      images: scrape.images ?? [],
      galleryImages: scrape.galleryImages ?? [],
    },
    content: {
      title: scrape.title || businessName,
      description: scrape.description || normalizedPreviewData.aboutText,
      heading: scrape.heading || normalizedPreviewData.heroHeading,
      heroHeading: normalizedPreviewData.heroHeading,
      heroSubheading: normalizedPreviewData.heroSubheading,
      aboutHeading: normalizedPreviewData.aboutHeading,
      aboutText: normalizedPreviewData.aboutText,
      highlights: scrape.highlights ?? [],
    },
    rooms: scrape.rooms ?? [],
    services: scrape.services ?? [],
    faqs: scrape.faqs ?? [],
    normalizedPreviewData,
  };
}

export function applyPreviewTemplate(
  currentData: Record<string, any>,
  templateId: PreviewTemplateId,
): Record<string, any> {
  const record = currentData.previewImportRecord as PreviewImportRecord | undefined;
  const normalizedTemplate = normalizePreviewTemplateId(templateId);
  if (record) return dataFromPreviewRecord(record, normalizedTemplate, currentData);

  return {
    ...currentData,
    ...templateStyle(normalizedTemplate),
    selectedTemplate: normalizedTemplate === 'original' ? 'conversion-focus' : normalizedTemplate,
  };
}

export function dataFromPreviewRecord(
  record: PreviewImportRecord,
  templateId: PreviewTemplateId,
  currentData: Record<string, any> = {},
): Record<string, any> {
  const normalized = record.normalizedPreviewData;
  const selectedTemplate = normalizePreviewTemplateId(templateId);
  const updatedRecord: PreviewImportRecord = {
    ...record,
    status: 'preview',
    selectedTemplate,
  };

  return {
    ...currentData,
    ...normalized,
    ...templateStyle(selectedTemplate),
    selectedTemplate,
    previewImportRecord: updatedRecord,
    previewImportRecordId: record.id,
    previewRecordStatus: 'preview',
    importComplete: true,
    importSourceUrl: record.source.url,
    sourceUrl: record.source.url,
    sourceHost: record.source.host,
    businessName: record.identity.businessName,
    location: record.identity.location,
    subdomain: currentData.subdomain || record.identity.subdomain,
    phone: record.contact.phone || currentData.phone,
    email: record.contact.email || currentData.email,
    address: record.contact.address || currentData.address,
  };
}

export function savePreviewImportRecord(record: PreviewImportRecord) {
  if (typeof window === 'undefined') return;
  const table = readPreviewImportTable();
  table[record.id] = record;
  const serialized = JSON.stringify(table);
  sessionStorage.setItem(previewImportTableStorageKey, serialized);
  localStorage.setItem(previewImportTableStorageKey, serialized);
}

export function markPreviewSelectionLive(currentData: Record<string, any>): Record<string, any> {
  const record = currentData.previewImportRecord as PreviewImportRecord | null | undefined;
  const selectedTemplate = normalizePreviewTemplateId(currentData.selectedTemplate || 'conversion-focus');

  if (!record) {
    return {
      ...currentData,
      liveTemplate: selectedTemplate,
      previewRecordStatus: 'live',
    };
  }

  const liveRecord: PreviewImportRecord = {
    ...record,
    status: 'live',
    selectedTemplate,
  };
  savePreviewImportRecord(liveRecord);

  return {
    ...currentData,
    previewImportRecord: liveRecord,
    previewImportRecordId: liveRecord.id,
    previewRecordStatus: 'live',
    liveTemplate: selectedTemplate,
  };
}

export function readPreviewImportTable(): Record<string, PreviewImportRecord> {
  if (typeof window === 'undefined') return {};
  const raw = sessionStorage.getItem(previewImportTableStorageKey) || localStorage.getItem(previewImportTableStorageKey);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, PreviewImportRecord>;
  } catch {
    return {};
  }
}

export function isOriginalTemplate(templateId: unknown) {
  return templateId === 'original';
}

export function normalizePreviewTemplateId(templateId: unknown): PreviewTemplateId {
  if (templateId === 'original') return 'original';
  if (templateId === 'editorial-guide') return 'editorial-guide';
  if (templateId === 'modern-showcase') return 'modern-showcase';
  if (templateId === 'conversion-focus') return 'conversion-focus';
  if (templateId === 'clean-modern') return 'modern-showcase';
  if (templateId === 'playful-family') return 'editorial-guide';
  return 'conversion-focus';
}

export function buildCatstaysTemplateContent(data: Record<string, any>): CatstaysTemplateContent {
  const record = data.previewImportRecord as PreviewImportRecord | null | undefined;
  const normalized = record?.normalizedPreviewData ?? data;
  const businessName = stringFrom(record?.identity.businessName, data.businessName, normalized.businessName, 'Your Cattery');
  const heroImage = imageFrom(
    normalized.heroImage,
    data.heroImage,
    record?.media.heroImage,
    record?.media.images?.[0],
    record?.media.galleryImages?.[0]?.url,
  );
  const galleryImages = uniqueStrings([
    ...(record?.media.images ?? []),
    ...(record?.media.galleryImages ?? []).map((image) => image.url),
    ...(data.galleryImages ?? []),
    data.facilitiesImage,
    data.aboutImage,
    heroImage,
  ]).filter(Boolean);
  const fallbackImages = ensureImageCount(galleryImages, heroImage);
  const highlights = (record?.content.highlights ?? data.whyChooseUsFeatures ?? []).filter(Boolean);
  const rooms = (record?.rooms?.length ? record.rooms : data.suites ?? data.roomTypes ?? []).filter(Boolean);
  const services = (record?.services?.length ? record.services : data.additionalServices ?? []).filter(Boolean);
  const testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];
  const primaryDescription = stringFrom(
    record?.content.description,
    record?.content.aboutText,
    data.aboutText,
    normalized.aboutText,
    'A calm, caring cat boarding experience designed around comfort, routine, and reassurance.',
  );

  return {
    business: {
      name: businessName,
      tagline: stringFrom(data.tagline, 'Luxury holiday retreat for cats'),
      location: stringFrom(record?.identity.location, data.location, normalized.location),
    },
    hero: {
      eyebrow: stringFrom(data.heroEyebrow, 'A home away from home'),
      heading: stringFrom(record?.content.heroHeading, data.heroHeading, normalized.heroHeading, `Welcome to ${businessName}`),
      text: stringFrom(record?.content.heroSubheading, data.heroSubheading, primaryDescription),
      image: heroImage,
      button: stringFrom(data.ctaText, 'Book Now'),
    },
    features: ensureFeatureCount(
      highlights.map((feature: any) => ({
        title: stringFrom(feature.title, feature.name),
        text: stringFrom(feature.description, feature.text),
      })),
      services.map((service: any) => ({
        title: stringFrom(service.title, service.name),
        text: stringFrom(service.description, service.text),
      })),
    ),
    about: {
      title: stringFrom(record?.content.aboutHeading, data.aboutHeading, normalized.aboutHeading, `About ${businessName}`),
      text: primaryDescription,
      image: imageFrom(data.aboutImage, data.facilitiesImage, fallbackImages[1], heroImage),
    },
    gallery: fallbackImages.slice(0, 8).map((image, index) => ({
      image,
      caption: stringFrom(record?.media.galleryImages?.[index]?.caption, `${businessName} photo ${index + 1}`),
    })),
    suites: ensureSuiteCount(rooms, fallbackImages, data.pricePerNight || normalized.pricePerNight),
    testimonials: [
      {
        quote: stringFrom(testimonials[0]?.text, "I built this because I needed it, and now I wouldn't run my cattery without it."),
        author: stringFrom(testimonials[0]?.name, 'Vanessa'),
        image: imageFrom(data.testimonialImage, fallbackImages[3], heroImage),
      },
    ],
    booking: {
      text: stringFrom(data.bookingText, "Check availability and secure your cat's holiday today."),
      bannerText: stringFrom(data.bookingBannerText, "Check availability and secure your cat's stay today."),
      primaryCta: stringFrom(data.primaryCta, 'Check Availability'),
    },
    footer: {
      about: stringFrom(data.footerAbout, primaryDescription),
      phone: stringFrom(record?.contact.phone, data.phone, normalized.phone),
      email: stringFrom(record?.contact.email, data.email, normalized.email),
      address: stringFrom(record?.contact.address, data.address, normalized.address),
      hours: stringFrom(data.hours, 'By appointment'),
    },
  };
}

function templateStyle(templateId: PreviewTemplateId) {
  if (templateId === 'original') return {};
  return templateConfig[templateId];
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

function imageFrom(...values: unknown[]): string {
  for (const value of values) {
    const image = stringFrom(value);
    if (/^https?:\/\//i.test(image) || /^data:image\//i.test(image)) return image;
  }
  return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&h=900&fit=crop';
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

function ensureImageCount(images: string[], heroImage: string): string[] {
  const fallback = [
    heroImage,
    'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1573865526739-10c1de0e0ef2?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&h=900&fit=crop',
  ];
  return uniqueStrings([...images, ...fallback]);
}

function ensureFeatureCount(
  primary: Array<{ title: string; text: string }>,
  secondary: Array<{ title: string; text: string }>,
) {
  return [
    ...primary,
    ...secondary,
    { title: 'Fully Licensed', text: 'Professional care with clear standards and safe routines.' },
    { title: 'Premium Care', text: 'Thoughtful daily care, comfort checks, and calm spaces.' },
    { title: 'Daily Enrichment', text: "A reassuring stay shaped around each cat's personality." },
    { title: 'Photo Updates', text: 'Owners can receive updates while their cats are away.' },
  ]
    .filter((feature) => feature.title || feature.text)
    .slice(0, 4)
    .map((feature, index) => ({
      title: feature.title || ['Fully Licensed', 'Premium Care', 'Daily Enrichment', 'Photo Updates'][index],
      text: feature.text || 'A calm, professional cattery experience.',
    }));
}

function ensureSuiteCount(rooms: any[], images: string[], fallbackPrice?: string) {
  const fallbackSuites = [
    { name: 'Standard Suites', description: 'Comfortable and cosy suites perfect for a relaxing stay.' },
    { name: 'Deluxe Suites', description: 'Extra comfort and premium features for added calm.' },
    { name: 'Executive Suites', description: 'Spacious accommodation with personalised care.' },
    { name: 'Family Suites', description: 'Ideal for multi-cat families staying together.' },
  ];

  return fallbackSuites.map((fallback, index) => {
    const room = rooms[index] ?? {};
    const title = stringFrom(room.name, room.title, fallback.name);
    const price = stringFrom(room.price, fallbackPrice);
    return {
      image: imageFrom(room.image, images[index + 1], images[index], images[0]),
      title,
      text: stringFrom(room.description, price ? `${fallback.description} ${price}.` : fallback.description),
    };
  });
}

function hostFromUrl(rawUrl: string) {
  if (!rawUrl) return '';
  try {
    return new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'import';
}
