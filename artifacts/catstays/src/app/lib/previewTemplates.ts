import {
  buildPreviewDataFromScrape,
  fallbackDeloraineScrape,
  type CatteryContentSnippet,
  type CatteryMediaAsset,
  type CatteryMediaCategory,
  type CatterySiteContentLibrary,
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
  status: 'preview' | 'in_progress' | 'live';
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
    mediaAssets?: CatteryMediaAsset[];
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
  contentLibrary: CatterySiteContentLibrary;
  contentSnippets?: CatteryContentSnippet[];
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
    primaryButton: string;
    primaryHref: string;
    secondaryButton: string;
    secondaryHref: string;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    headingFont: string;
    subheadingFont: string;
    bodyFont: string;
  };
  sectionHeadings: {
    care: string;
    facilities: string;
    suites: string;
    services: string;
    gallery: string;
    reviews: string;
    contact: string;
  };
  features: Array<{
    title: string;
    text: string;
    icon?: string;
  }>;
  whyChoose: {
    title: string;
    text: string;
    image?: string;
    items: Array<{
      title: string;
      text: string;
      icon?: string;
    }>;
  };
  facilities: {
    title: string;
    text: string;
    image: string;
    items: Array<{
      title: string;
      text: string;
      icon?: string;
    }>;
  };
  services: Array<{
    image: string;
    title: string;
    text: string;
    price: string;
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
    price: string;
    features: string[];
  }>;
  testimonials: Array<{
    quote: string;
    author: string;
    image: string;
    location: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
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
    facebook: string;
    instagram: string;
  };
  contentLibrary: CatterySiteContentLibrary;
}

export const previewImportTableStorageKey = 'catstays_preview_import_table';
const persistentPreviewImageLimit = 48;
const persistentPreviewSnippetLimit = 80;
const persistentPreviewBlockLimit = 40;
const persistentPreviewTextLimit = 1800;

function safeStorageGet(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeStorageSet(storage: Storage | undefined, key: string, value: string): boolean {
  try {
    storage?.setItem(key, value);
    return Boolean(storage);
  } catch {
    return false;
  }
}

function safeStorageRemove(storage: Storage | undefined, key: string) {
  try {
    storage?.removeItem(key);
  } catch {
    // Storage is optional for preview recovery.
  }
}

function compactText(value: unknown, limit = persistentPreviewTextLimit) {
  if (typeof value !== 'string') return value;
  return value.length > limit ? `${value.slice(0, limit).trim()}...` : value;
}

function compactContentLibrary(library: CatterySiteContentLibrary): CatterySiteContentLibrary {
  return {
    ...library,
    blocks: (library.blocks ?? []).slice(0, persistentPreviewBlockLimit).map((block) => ({
      ...block,
      text: compactText(block.text) as string | undefined,
      items: block.items?.slice(0, persistentPreviewSnippetLimit).map((item) => ({
        ...item,
        text: compactText(item.text) as string,
      })),
      images: block.images?.slice(0, persistentPreviewImageLimit),
      links: block.links?.slice(0, persistentPreviewSnippetLimit),
    })),
    mediaAssets: library.mediaAssets?.slice(0, persistentPreviewImageLimit),
    contentSnippets: library.contentSnippets?.slice(0, persistentPreviewSnippetLimit).map((snippet) => ({
      ...snippet,
      text: compactText(snippet.text) as string,
    })),
  };
}

function compactPreviewImportRecord(record: PreviewImportRecord): PreviewImportRecord {
  return {
    ...record,
    media: {
      ...record.media,
      images: record.media.images.slice(0, persistentPreviewImageLimit),
      mediaAssets: record.media.mediaAssets?.slice(0, persistentPreviewImageLimit),
      galleryImages: record.media.galleryImages.slice(0, persistentPreviewImageLimit),
    },
    contentLibrary: compactContentLibrary(record.contentLibrary),
    contentSnippets: record.contentSnippets?.slice(0, persistentPreviewSnippetLimit).map((snippet) => ({
      ...snippet,
      text: compactText(snippet.text) as string,
    })),
    normalizedPreviewData: {
      ...record.normalizedPreviewData,
      mediaAssets: record.normalizedPreviewData.mediaAssets?.slice(0, persistentPreviewImageLimit),
      contentSnippets: record.normalizedPreviewData.contentSnippets?.slice(0, persistentPreviewSnippetLimit).map((snippet) => ({
        ...snippet,
        text: compactText(snippet.text) as string,
      })),
      siteContentLibrary: record.normalizedPreviewData.siteContentLibrary
        ? compactContentLibrary(record.normalizedPreviewData.siteContentLibrary)
        : undefined,
      galleryData: {
        ...(record.normalizedPreviewData.galleryData ?? {}),
        galleryImages: Array.isArray(record.normalizedPreviewData.galleryData?.galleryImages)
          ? record.normalizedPreviewData.galleryData.galleryImages.slice(0, persistentPreviewImageLimit)
          : record.normalizedPreviewData.galleryData?.galleryImages,
      },
    },
  };
}

function compactPreviewImportTable(table: Record<string, PreviewImportRecord>) {
  return Object.fromEntries(
    Object.entries(table).map(([id, record]) => [id, compactPreviewImportRecord(record)]),
  );
}

export const previewTemplateCards: PreviewTemplateOption[] = [
  {
    id: 'original',
    name: 'Original',
    description: 'A generated clone of the scraped site using saved content and media',
    image: 'https://www.delorainecattery.com/assets/Deloraine%20Cattery%20Building-CX1rWDRb.png',
    sourceOnly: true,
  },
  {
    id: 'conversion-focus',
    name: 'Focus',
    description: 'Conversion-first layout with booking widget below the hero',
    image: 'https://www.delorainecattery.com/assets/Deloraine%20Cattery%20Building-CX1rWDRb.png',
  },
  {
    id: 'editorial-guide',
    name: 'Editorial',
    description: 'Story-led checkerboard sections with magazine-style pacing',
    image: 'https://www.delorainecattery.com/assets/Paul%20and%20Vanessa-Dst6H-6-.jpg',
  },
  {
    id: 'modern-showcase',
    name: 'Showcase',
    description: 'Image-first pages with minimal copy and strong visual rhythm',
    image: 'https://www.delorainecattery.com/assets/Kitty3-nO3ryPLf.jpg',
  },
];

const templateConfig: Record<Exclude<PreviewTemplateId, 'original'>, Partial<DelorainePreviewData>> = {
  'conversion-focus': {
    primaryColor: '#0A1128',
    accentColor: '#C46A3A',
    backgroundColor: '#F8F7F5',
    typography: 'playfair',
    headingFont: 'playfair',
    subheadingFont: 'inter',
  },
  'editorial-guide': {
    primaryColor: '#0A1128',
    accentColor: '#C46A3A',
    backgroundColor: '#F8F5EF',
    typography: 'playfair',
    headingFont: 'playfair',
    subheadingFont: 'inter',
  },
  'modern-showcase': {
    primaryColor: '#0A1128',
    accentColor: '#C46A3A',
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
  const normalizedGalleryImages = Array.isArray(normalizedPreviewData.galleryData?.galleryImages)
    ? normalizedPreviewData.galleryData.galleryImages
    : [];
  const normalizedGalleryUrls = normalizedGalleryImages
    .map((image: any) => stringFrom(image.url, image.image))
    .filter(Boolean);
  const normalizedRooms = normalizedPreviewData.suitesData?.suites ?? [];
  const normalizedServices = normalizedPreviewData.servicesData?.services ?? [];
  const normalizedHighlights = normalizedPreviewData.whyChooseUsData?.whyChooseUsFeatures ?? [];
  const normalizedFaqs = normalizedPreviewData.faqData?.faqs ?? [];
  const normalizedRoomRecords = normalizedRooms.map((room: any) => ({
    name: stringFrom(room.name, room.title),
    description: stringFrom(room.description, room.text),
    price: stringFrom(room.price),
    amenities: Array.isArray(room.features) ? room.features : Array.isArray(room.amenities) ? room.amenities : [],
    image: stringFrom(room.image),
  })).filter((room: any) => room.name || room.description || room.image);
  const normalizedServiceRecords = normalizedServices.map((service: any) => ({
    title: stringFrom(service.title, service.name),
    description: stringFrom(service.description, service.text),
    price: stringFrom(service.price),
    image: stringFrom(service.image),
  })).filter((service: any) => service.title || service.description || service.image);
  const normalizedHighlightRecords = normalizedHighlights.map((item: any) => ({
    title: stringFrom(item.title, item.name),
    description: stringFrom(item.description, item.text),
  })).filter((item: any) => item.title || item.description);

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
      images: uniqueStrings([...(scrape.images ?? []), ...normalizedGalleryUrls]),
      mediaAssets: scrape.mediaAssets ?? normalizedPreviewData.mediaAssets ?? scrape.siteContentLibrary?.mediaAssets ?? [],
      galleryImages: uniqueGalleryItems([
        ...normalizedGalleryImages.map((image: any) => ({
          url: stringFrom(image.url, image.image),
          caption: stringFrom(image.caption),
        })),
        ...(scrape.galleryImages ?? []),
      ]),
    },
    content: {
      title: scrape.title || businessName,
      description: scrape.description || normalizedPreviewData.aboutText,
      heading: scrape.heading || normalizedPreviewData.heroHeading,
      heroHeading: normalizedPreviewData.heroHeading,
      heroSubheading: normalizedPreviewData.heroSubheading,
      aboutHeading: normalizedPreviewData.aboutHeading,
      aboutText: normalizedPreviewData.aboutText,
      highlights: mergeFeatureRecords(scrape.highlights ?? [], normalizedHighlightRecords),
    },
    rooms: mergeRoomsByTitle(scrape.rooms ?? [], normalizedRoomRecords),
    services: mergeServicesByTitle(scrape.services ?? [], normalizedServiceRecords),
    faqs: scrape.faqs?.length ? scrape.faqs : normalizedFaqs,
    contentLibrary: normalizedPreviewData.siteContentLibrary ?? emptyContentLibrary(sourceUrl, sourceHost, businessName),
    contentSnippets: scrape.contentSnippets ?? normalizedPreviewData.contentSnippets ?? scrape.siteContentLibrary?.contentSnippets ?? [],
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

  return withOnboardingCollections({
    ...currentData,
    ...templateStyle(normalizedTemplate),
    selectedTemplate: normalizedTemplate === 'original' ? 'conversion-focus' : normalizedTemplate,
  }, currentData);
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
    status: 'in_progress',
    selectedTemplate,
  };
  savePreviewImportRecord(updatedRecord);

  return withOnboardingCollections({
    ...currentData,
    ...normalized,
    ...templateStyle(selectedTemplate),
    __preferImportedCollections: true,
    selectedTemplate,
    previewImportRecord: updatedRecord,
    previewImportRecordId: record.id,
    previewRecordStatus: 'in_progress',
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
  }, currentData);
}

export function savePreviewImportRecord(record: PreviewImportRecord) {
  if (typeof window === 'undefined') return;
  const table = readPreviewImportTable();
  table[record.id] = record;
  const serialized = JSON.stringify(table);
  safeStorageSet(window.sessionStorage, previewImportTableStorageKey, serialized);

  if (!safeStorageSet(window.localStorage, previewImportTableStorageKey, serialized)) {
    safeStorageRemove(window.localStorage, previewImportTableStorageKey);
    safeStorageSet(
      window.localStorage,
      previewImportTableStorageKey,
      JSON.stringify(compactPreviewImportTable(table)),
    );
  }
}

export function markPreviewSelectionLive(currentData: Record<string, any>): Record<string, any> {
  const record = currentData.previewImportRecord as PreviewImportRecord | null | undefined;
  const selectedTemplate = normalizePreviewTemplateId(currentData.selectedTemplate || 'conversion-focus');

  if (!record) {
    return withOnboardingCollections({
      ...currentData,
      liveTemplate: selectedTemplate,
      previewRecordStatus: 'live',
    }, currentData);
  }

  const liveRecord: PreviewImportRecord = {
    ...record,
    status: 'live',
    selectedTemplate,
  };
  savePreviewImportRecord(liveRecord);

  return withOnboardingCollections({
    ...currentData,
    previewImportRecord: liveRecord,
    previewImportRecordId: liveRecord.id,
    previewRecordStatus: 'live',
    liveTemplate: selectedTemplate,
  }, currentData);
}

export function readPreviewImportTable(): Record<string, PreviewImportRecord> {
  if (typeof window === 'undefined') return {};
  const raw =
    safeStorageGet(window.sessionStorage, previewImportTableStorageKey) ||
    safeStorageGet(window.localStorage, previewImportTableStorageKey);
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
  const normalizedRecord = normalized as Record<string, any>;
  const businessName = stringFrom(data.businessName, normalized.businessName, record?.identity.businessName, 'Your Cattery');
  const contentLibrary =
    record?.contentLibrary ??
    normalized.siteContentLibrary ??
    data.siteContentLibrary ??
    emptyContentLibrary(stringFrom(record?.source.url, data.sourceUrl, normalized.sourceUrl), stringFrom(record?.source.host, data.sourceHost, normalized.sourceHost), businessName);
  const mediaAssets = normaliseMediaAssets(
    record?.media.mediaAssets,
    normalizedRecord.mediaAssets,
    data.mediaAssets,
    contentLibrary.mediaAssets,
  );
  const contentSnippets = normaliseContentSnippets(
    record?.contentSnippets,
    normalizedRecord.contentSnippets,
    data.contentSnippets,
    contentLibrary.contentSnippets,
  );
  const importedFromSource = Boolean(record?.source.url || data.sourceUrl || data.importSourceUrl);
  const libraryRooms = libraryItems(contentLibrary, 'rooms');
  const libraryServices = libraryItems(contentLibrary, 'services');
  const libraryReviews = libraryItems(contentLibrary, 'reviews');
  const libraryFaqs = libraryItems(contentLibrary, 'faqs');
  const libraryGalleryImages = libraryImages(contentLibrary, 'gallery');
  const libraryRoomRecords = libraryRoomsToRooms(libraryRooms);
  const libraryServiceRecords = libraryItemsToServices(libraryServices);
  const heroBlock = libraryBlock(contentLibrary, 'hero');
  const heroLinks = heroBlock?.links ?? [];
  const whyChooseBlock = libraryBlock(contentLibrary, 'why-choose-us');
  const facilitiesBlock = libraryBlock(contentLibrary, 'facilities');
  const dailyCareBlock = libraryBlock(contentLibrary, 'daily-care');
  const ownerBlock = libraryBlock(contentLibrary, 'owner-story');
  const locationBlock = libraryBlock(contentLibrary, 'location');
  const logoImage = stringFrom(data.logoImage, normalizedRecord.logoImage, record?.media.logoImage);
  const genericHeroFallback = imageFrom(
    record?.media.images?.find((image) => !isTextHeavyImage(image, mediaAssets)),
    record?.media.galleryImages?.find((image) => !isTextHeavyImage(image.url, mediaAssets))?.url,
  );
  const heroImage =
    firstSafeImage([data.heroImage, normalized.heroImage, record?.media.heroImage], mediaAssets) ||
    mediaImageForCategories(mediaAssets, ['hero', 'facilities', 'gallery']) ||
    (importedFromSource ? '' : genericHeroFallback);
  const editedGalleryImages = Array.isArray(data.galleryImages) ? data.galleryImages : undefined;
  const taggedGalleryImages = mediaAssets
    .filter((asset) => isPreviewSafeMedia(asset))
    .map((asset) => asset.url);
  const sourceGalleryCandidates = [
    ...taggedGalleryImages,
    ...(record?.media.images ?? []),
    ...(record?.media.galleryImages ?? []).map((image) => image.url),
    ...libraryGalleryImages.map((image) => image.url),
    ...(editedGalleryImages ?? []),
  ];
  const galleryImages = uniqueStrings([
    ...(importedFromSource ? sourceGalleryCandidates : editedGalleryImages ?? sourceGalleryCandidates),
    data.facilitiesImage,
    data.aboutImage,
    data.ownerData?.image,
    heroImage,
  ]).filter((image) => isUsableGalleryImage(image, logoImage) && !isTextHeavyImage(image, mediaAssets));
  const fallbackImages = ensureImageCount(galleryImages, heroImage, !importedFromSource);
  const usedImages = new Set<string>();
  rememberImage(usedImages, heroImage);
  const editedHighlights = Array.isArray(data.whyChooseUsFeatures) ? data.whyChooseUsFeatures : undefined;
  const highlights = (editedHighlights ?? record?.content.highlights ?? []).filter(Boolean);
  const dataRooms = Array.isArray(data.suites)
    ? data.suites
    : Array.isArray(data.roomTypes)
      ? data.roomTypes
      : undefined;
  const normalizedRooms = normalizedRecord.suitesData?.suites ?? data.suitesData?.suites ?? [];
  const editedRooms = importedFromSource ? undefined : dataRooms;
  const rooms = (importedFromSource
    ? mergeRoomsByTitle(record?.rooms ?? [], libraryRoomRecords, normalizedRooms, dataRooms ?? [])
    : editedRooms ?? mergeRoomsByTitle(libraryRoomRecords, record?.rooms ?? [], normalizedRooms)
  ).filter(Boolean);
  const dataServices = Array.isArray(data.additionalServices) ? data.additionalServices : undefined;
  const normalizedServices = normalizedRecord.servicesData?.services ?? data.servicesData?.services ?? [];
  const editedServices = importedFromSource ? undefined : dataServices;
  const services = (importedFromSource
    ? mergeServicesByTitle(record?.services ?? [], libraryServiceRecords, normalizedServices, dataServices ?? [])
    : editedServices ?? mergeServicesByTitle(libraryServiceRecords, record?.services ?? [], normalizedServices)
  ).filter(Boolean);
  const roomImageKeys = new Set(
    rooms
      .map((room: any) => normalizedImageKey(stringFrom(room.image)))
      .filter(Boolean),
  );
  const nonRoomImage = (image: unknown) => {
    const url = stringFrom(image);
    return url && !roomImageKeys.has(normalizedImageKey(url)) ? url : '';
  };
  const nonRoomImages = (...images: unknown[]) => images.map(nonRoomImage).filter(Boolean);
  const nonRoomFallbackImages = fallbackImages.filter((image) => !roomImageKeys.has(normalizedImageKey(image)));
  const editedTestimonials = Array.isArray(data.testimonials) ? data.testimonials : undefined;
  const testimonials = ensureReviewFallback(
    (
      editedTestimonials ??
      normalizedRecord.testimonialsData?.testimonials ??
      data.testimonialsData?.testimonials ??
      libraryItemsToReviews(libraryReviews) ??
      []
    ).filter(Boolean),
    businessName,
    stringFrom(record?.source.host, normalized.sourceHost, data.sourceHost),
  );
  const editedFaqs = Array.isArray(data.faqs) ? data.faqs : undefined;
  const faqs = (editedFaqs ?? normalizedRecord.faqData?.faqs ?? data.faqData?.faqs ?? record?.faqs ?? libraryItemsToFaqs(libraryFaqs) ?? []).filter(Boolean);
  const ownerBlockData = ownerBlock
    ? { title: ownerBlock.title, text: ownerBlock.text, image: ownerBlock.images?.[0]?.url }
    : {};
  const ownerData = {
    ...ownerBlockData,
    ...(normalizedRecord.ownerData ?? {}),
    ...(data.ownerData ?? {}),
  };
  const ownerImageCandidates = ownerCandidateImages(mediaAssets, [
    { url: ownerData.image, label: stringFrom(ownerData.title, ownerData.text, ownerData.description) },
    { url: normalizedRecord.ownerData?.image, label: stringFrom(normalizedRecord.ownerData?.title, normalizedRecord.ownerData?.text) },
    ...(record?.media.galleryImages ?? []).map((image) => ({ url: image.url, label: image.caption })),
    ...libraryGalleryImages.map((image) => ({ url: image.url, label: stringFrom(image.caption, image.tags?.join(' ')) })),
    ...(record?.media.images ?? []).map((url) => ({ url, label: url })),
  ]).filter((image) => isUsableGalleryImage(image, logoImage) && !isTextHeavyImage(image, mediaAssets));
  const ownerImageKeys = new Set(ownerImageCandidates.map((image) => normalizedImageKey(image)));
  const nonOwnerNonRoomImages = (...images: unknown[]) => nonRoomImages(...images).filter((image) => !ownerImageKeys.has(normalizedImageKey(image)));
  const nonOwnerFallbackImages = nonRoomFallbackImages.filter((image) => !ownerImageKeys.has(normalizedImageKey(image)));
  const commitmentData = data.commitmentData ?? normalizedRecord.commitmentData ?? {};
  const locationData = data.locationData ?? data.contactData?.locationDetails ?? normalizedRecord.locationData ?? normalizedRecord.contactData?.locationDetails ?? {};
  const socialLinks = {
    ...((normalizedRecord.socialLinks ?? normalizedRecord.contactData?.socialLinks ?? {}) as Record<string, unknown>),
    ...((data.socialLinks ?? {}) as Record<string, unknown>),
  };
  const hours = stringFrom(
    data.hours,
    data.contactData?.hours,
    normalizedRecord.hours,
    normalizedRecord.contactData?.hours,
    record?.normalizedPreviewData?.hours,
    'By appointment',
  );
  const ownerStoryText = stringFrom(ownerData.text, ownerData.description, ownerBlock?.text, snippetTextFor(contentSnippets, ['owner-story']));
  const sourceAboutText = snippetTextFor(contentSnippets, ['facilities', 'why-choose-us', 'daily-care', 'general']);
  const primaryDescription = stringFrom(
    record?.content.description,
    data.heroSubheading,
    normalized.heroSubheading,
    record?.content.heroSubheading,
    record?.content.aboutText,
    sourceAboutText !== ownerStoryText ? sourceAboutText : '',
    data.aboutText !== ownerStoryText ? data.aboutText : '',
    normalized.aboutText !== ownerStoryText ? normalized.aboutText : '',
    'A calm, caring cat boarding experience designed around comfort, routine, and reassurance.',
  );
  const usedSectionCopy: string[] = [];
  const heroText = pickUniqueCopy(
    usedSectionCopy,
    [
      data.heroSubheading,
      normalized.heroSubheading,
      record?.content.heroSubheading,
      record?.content.description,
      primaryDescription,
    ],
    'A calm, caring cat boarding experience designed around comfort, routine, and reassurance.',
  );
  const mappedHighlights = highlights.map((feature: any) => ({
    title: stringFrom(feature.title, feature.name),
    text: stringFrom(feature.description, feature.text),
    icon: stringFrom(feature.icon),
  }));
  const mappedServices = services.map((service: any) => ({
    title: stringFrom(service.title, service.name),
    text: stringFrom(service.description, service.text),
    icon: stringFrom(service.icon),
  }));
  const featureItems = editedHighlights
    ? mappedHighlights.filter((feature) => feature.title || feature.text).slice(0, 5)
    : importedFromSource && !mappedHighlights.length && !mappedServices.length
      ? []
    : ensureFeatureCount(mappedHighlights, mappedServices);
  const whyChooseItems = editedHighlights
    ? featureItems
    : importedFromSource && !(whyChooseBlock?.items?.length) && !featureItems.length
      ? []
    : ensureFeatureCount(
        (whyChooseBlock?.items?.length ? whyChooseBlock.items : featureItems).map((item: any) => ({
          title: stringFrom(item.title, item.name),
          text: stringFrom(item.text, item.description),
          icon: stringFrom(item.icon),
        })),
        featureItems,
      ).slice(0, 5);
  const editedFacilityItems = Array.isArray(data.facilityFeatures) ? data.facilityFeatures : undefined;
  const mappedFacilityItems = editedFacilityItems
    ? editedFacilityItems.map((item: any) => ({
        title: stringFrom(item.title, item.name),
        text: stringFrom(item.description, item.text),
        icon: stringFrom(item.icon),
      }))
    : [
        ...(facilitiesBlock?.items ?? []).map((item: any) => ({
          title: stringFrom(item.title, item.name),
          text: stringFrom(item.text, item.description),
          icon: stringFrom(item.icon),
        })),
        dailyCareBlock
          ? {
              title: stringFrom(dailyCareBlock.title, 'Daily Care Routine'),
              text: stringFrom(dailyCareBlock.text),
              icon: 'Clock',
            }
          : null,
      ];
  const facilityItems = mappedFacilityItems
    .filter((item) => Boolean(item?.title && item?.text))
    .map((item) => ({ title: item!.title, text: item!.text, icon: item!.icon }))
    .slice(0, 6);
  const ownerText = pickUniqueCopy(
    usedSectionCopy,
    [
      ownerStoryText,
      ownerData.text,
      ownerData.description,
      ownerBlock?.text,
      snippetTextFor(contentSnippets, ['owner-story']),
    ],
  );
  const aboutText = pickUniqueCopy(
    usedSectionCopy,
    [
      data.aboutText,
      normalized.aboutText,
      record?.content.aboutText,
      sourceAboutText && sourceAboutText !== ownerStoryText && sourceAboutText !== ownerText ? sourceAboutText : '',
      data.aboutText !== ownerStoryText && data.aboutText !== ownerText ? data.aboutText : '',
      normalized.aboutText !== ownerStoryText && normalized.aboutText !== ownerText ? normalized.aboutText : '',
      primaryDescription,
    ],
    primaryDescription,
  );
  const whyChooseText = pickUniqueCopy(
    usedSectionCopy,
    [
      data.whyChooseUsText,
      whyChooseBlock?.text,
      snippetTextFor(contentSnippets, ['why-choose-us', 'facilities', 'daily-care', 'general']),
      mappedHighlights.find((feature) => feature.text)?.text,
      featureItems.find((feature) => feature.text)?.text,
    ],
  );
  const facilitiesText = pickUniqueCopy(
    usedSectionCopy,
    [
      facilitiesBlock?.text,
      snippetTextFor(contentSnippets, ['facilities', 'rooms', 'daily-care']),
      data.facilitiesText,
      normalized.facilitiesText,
      facilityItems.find((feature) => feature.text)?.text,
    ],
    'Comfortable, secure spaces designed around daily cat care, quiet routines, and peace of mind.',
  );
  const footerAbout = pickUniqueCopy(
    [...usedSectionCopy],
    [
      data.footerAbout,
      snippetTextFor(contentSnippets, ['footer', 'general']),
      record?.content.description,
      primaryDescription,
    ],
    primaryDescription,
  );
  const aboutImage = pickUniqueImage(
    usedImages,
    [
      ...nonOwnerNonRoomImages(data.aboutImage, normalizedRecord.aboutImage, normalizedRecord.aboutData?.image),
      ...mediaImagesForCategories(mediaAssets, ['gallery', 'facilities']).filter((image) => !roomImageKeys.has(normalizedImageKey(image)) && !ownerImageKeys.has(normalizedImageKey(image))),
      ...nonOwnerFallbackImages.filter((image) => image !== heroImage),
    ],
    [],
  );
  const whyChooseImage = whyChooseText
    ? pickUniqueImage(
        usedImages,
        [
          ...nonOwnerNonRoomImages(whyChooseBlock?.images?.[0]?.url),
          ...mediaImagesForCategories(mediaAssets, ['gallery', 'facilities']).filter((image) => !roomImageKeys.has(normalizedImageKey(image)) && !ownerImageKeys.has(normalizedImageKey(image))),
          ...nonOwnerFallbackImages.filter((image) => image !== heroImage && image !== aboutImage),
        ],
        [],
      )
    : '';
  const facilityImage = pickUniqueImage(
    usedImages,
    [
      ...nonOwnerNonRoomImages(data.facilitiesImage, facilitiesBlock?.images?.[0]?.url, normalizedRecord.facilitiesData?.facilitiesImage),
      ...mediaImagesForCategories(mediaAssets, ['facilities']).filter((image) => !roomImageKeys.has(normalizedImageKey(image)) && !ownerImageKeys.has(normalizedImageKey(image))),
      ...nonOwnerFallbackImages,
    ],
    [],
  );
  const directOwnerImage = stringFrom(ownerData.image, normalizedRecord.ownerData?.image, ownerImageCandidates[0], mediaImagesForCategories(mediaAssets, ['owner'])[0]);
  const ownerImage = ownerText && isUsableGalleryImage(directOwnerImage, logoImage) && !isTextHeavyImage(directOwnerImage, mediaAssets)
    ? directOwnerImage
    : ownerText
      ? pickUniqueImage(
        usedImages,
        [
          ownerData.image,
          normalizedRecord.ownerData?.image,
          ...ownerImageCandidates,
          ...mediaImagesForCategories(mediaAssets, ['owner']),
        ],
        [],
      )
      : '';
  rememberImage(usedImages, ownerImage);
  const virtualTourUrl = embeddableVirtualTourUrl(
    stringFrom(locationData.virtualTourUrl, normalized.virtualTourUrl, data.virtualTourUrl, data.contactData?.virtualTourUrl),
    contentLibrary.sourceHost,
  );
  const serviceItems = services.map((service: any, index: number) => {
    const serviceImage = stringFrom(service.image);
    const resolvedServiceImage = isUsableGalleryImage(serviceImage, logoImage) && !isTextHeavyImage(serviceImage, mediaAssets)
      ? serviceImage
      : importedFromSource
        ? ''
        : imageFrom('', fallbackImages[index + 3], fallbackImages[index]);
    return {
      image: resolvedServiceImage,
      title: stringFrom(service.title, service.name, `Care service ${index + 1}`),
      text: stringFrom(service.description, service.text, 'Additional support available during the stay.'),
      price: stringFrom(service.price),
    };
  });
  const suiteItems = editedRooms && editedRooms.length === 0
    ? []
    : importedFromSource && !rooms.length
      ? []
      : ensureSuiteCount(rooms, fallbackImages, data.pricePerNight || normalized.pricePerNight, usedImages, !importedFromSource);
  const sourceGalleryImages = uniqueGalleryItems([
    ...mediaAssets
      .filter((asset) => isPreviewSafeMedia(asset) && asset.category === 'gallery')
      .map((asset) => ({ url: asset.url, caption: stringFrom(asset.caption, asset.alt, asset.title) })),
    ...libraryGalleryImages,
    ...(record?.media.galleryImages ?? []),
    ...((Array.isArray(data.galleryImages) ? data.galleryImages : []) as unknown[]).map((url) => ({ url: stringFrom(url) })),
    ...(importedFromSource ? [] : fallbackImages.map((url) => ({ url }))),
  ]).filter((item) => isUsableGalleryImage(item.url, logoImage) && !isTextHeavyImage(item.url, mediaAssets));
  const galleryReservedKeys = new Set(
    [heroImage, aboutImage, whyChooseImage, facilityImage, ownerImage, ...ownerImageCandidates]
      .map((image) => normalizedImageKey(image))
      .filter(Boolean),
  );
  const gallerySourceImages = uniqueStrings([
    ...sourceGalleryImages
      .map((image) => image.url)
      .filter((image) => !galleryReservedKeys.has(normalizedImageKey(image))),
    ...sourceGalleryImages.map((image) => image.url),
  ]).slice(0, 24);
  const captionForGalleryImage = (image: string, index: number) => stringFrom(
    sourceGalleryImages.find((galleryImage) => normalizedImageKey(galleryImage.url) === normalizedImageKey(image))?.caption,
    `${businessName} photo ${index + 1}`,
  );

  return {
    business: {
      name: businessName,
      tagline: stringFrom(data.tagline, 'Luxury holiday retreat for cats'),
      location: stringFrom(data.location, normalized.location, record?.identity.location),
    },
    contentLibrary,
    hero: {
      eyebrow: stringFrom(data.heroEyebrow, 'A home away from home'),
      heading: stringFrom(data.heroHeading, normalized.heroHeading, record?.content.heroHeading, `Welcome to ${businessName}`),
      text: heroText,
      image: heroImage,
      button: stringFrom(data.ctaText, data.heroPrimaryCtaText, heroLinks[0]?.label, 'Book Now'),
      primaryButton: stringFrom(data.heroPrimaryCtaText, heroLinks[0]?.label, 'View Suites'),
      primaryHref: stringFrom(data.heroPrimaryCtaHref, heroLinks[0]?.url, '#suites'),
      secondaryButton: stringFrom(data.heroSecondaryCtaText, heroLinks[1]?.label, 'Our Care Approach'),
      secondaryHref: stringFrom(data.heroSecondaryCtaHref, heroLinks[1]?.url, '#care'),
    },
    theme: {
      primaryColor: stringFrom(data.primaryColor, normalizedRecord.primaryColor, '#0A1128'),
      accentColor: stringFrom(data.accentColor, normalizedRecord.accentColor, '#C46A3A'),
      backgroundColor: stringFrom(data.backgroundColor, normalizedRecord.backgroundColor, '#F8F7F5'),
      headingFont: stringFrom(data.headingFont, data.typography, normalizedRecord.headingFont, normalizedRecord.typography, 'playfair'),
      subheadingFont: stringFrom(data.subheadingFont, normalizedRecord.subheadingFont, 'inter'),
      bodyFont: stringFrom(data.bodyFont, normalizedRecord.bodyFont, data.subheadingFont, normalizedRecord.subheadingFont, 'inter'),
    },
    sectionHeadings: {
      care: stringFrom(data.whyChooseUsHeading, whyChooseBlock?.title, `Why choose ${businessName}`),
      facilities: stringFrom(data.facilitiesHeading, facilitiesBlock?.title, 'Our Facilities'),
      suites: stringFrom(data.suitesHeading, 'Beautiful suites for every kind of cat'),
      services: stringFrom(data.additionalServicesHeading, 'Extra care when your cat needs it'),
      gallery: stringFrom(data.galleryHeading, 'A closer look at the stay'),
      reviews: stringFrom(data.testimonialsHeading, 'Trusted by cat families'),
      contact: stringFrom(data.contactHeading, 'Send us a message'),
    },
    features: featureItems,
    whyChoose: {
      title: stringFrom(data.whyChooseUsHeading, whyChooseBlock?.title, `Why choose ${businessName}`),
      text: whyChooseText,
      image: whyChooseImage,
      items: whyChooseItems,
    },
    facilities: {
      title: stringFrom(data.facilitiesHeading, facilitiesBlock?.title, 'Our Facilities'),
      text: facilitiesText,
      image: facilityImage,
      items: facilityItems.length || editedFacilityItems ? facilityItems : featureItems.slice(0, 4),
    },
    services: serviceItems,
    about: {
      title: stringFrom(data.aboutHeading, normalized.aboutHeading, record?.content.aboutHeading, facilitiesBlock?.title, `About ${businessName}`),
      text: aboutText,
      image: aboutImage,
    },
    gallery: gallerySourceImages.map((image, index) => ({
      image,
      caption: captionForGalleryImage(image, index),
    })),
    suites: suiteItems,
    testimonials: ensureTestimonials(testimonials, businessName, fallbackImages, heroImage, data.testimonialImage, !importedFromSource),
    faqs: faqs.map((faq: any) => ({
      question: stringFrom(faq.question),
      answer: stringFrom(faq.answer),
    })).filter((faq) => faq.question && faq.answer),
    owner: {
      title: stringFrom(ownerData.title, `Meet the people behind ${businessName}`),
      text: ownerText,
      image: ownerImage,
    },
    commitment: {
      title: stringFrom(commitmentData.title, `${businessName} care standards`),
      text: stringFrom(commitmentData.text, 'Clear routines, secure facilities, and careful daily attention help every cat settle in.'),
      items: ((commitmentData.items ?? highlights) as any[])
        .map((item: any) => ({
          title: stringFrom(item.title, item.name),
          description: stringFrom(item.description, item.text),
        }))
        .filter((item) => item.title && item.description)
        .slice(0, 6),
    },
    locationDetails: {
      heading: stringFrom(locationData.heading, locationBlock?.title, `Visit ${businessName}`),
      text: stringFrom(locationData.text, locationBlock?.text, record?.contact.address, normalized.address, data.address),
      directions: stringFrom(locationData.directions, locationBlock?.items?.[0]?.text, data.location, normalized.location),
      virtualTourUrl,
    },
    booking: {
      text: stringFrom(data.bookingText, "Check availability and secure your cat's holiday today."),
      bannerText: stringFrom(data.bookingBannerText, "Check availability and secure your cat's stay today."),
      primaryCta: stringFrom(data.primaryCta, 'Check Availability'),
    },
    footer: {
      about: footerAbout,
      phone: stringFrom(data.phone, normalized.phone, record?.contact.phone),
      email: stringFrom(data.email, normalized.email, record?.contact.email),
      address: stringFrom(data.address, normalized.address, record?.contact.address),
      hours,
      facebook: stringFrom(data.facebookUrl, socialLinks.facebook),
      instagram: stringFrom(data.instagramUrl, socialLinks.instagram),
    },
    contentLibrary,
  };
}

function emptyContentLibrary(sourceUrl: string, sourceHost: string, businessName: string): CatterySiteContentLibrary {
  return {
    schemaVersion: 1,
    sourceUrl,
    sourceHost,
    businessName,
    blocks: [],
    mediaAssets: [],
    contentSnippets: [],
  };
}

function libraryBlock(library: CatterySiteContentLibrary, category: string) {
  return library.blocks.find((block) => block.category === category);
}

function libraryItems(library: CatterySiteContentLibrary, category: string) {
  return libraryBlock(library, category)?.items ?? [];
}

function libraryImages(library: CatterySiteContentLibrary, category: string) {
  return libraryBlock(library, category)?.images ?? [];
}

function libraryRoomsToRooms(items: ReturnType<typeof libraryItems>) {
  return items.map((item) => ({
    name: item.title,
    description: item.text,
    price: item.price,
    amenities: item.features,
    image: item.image,
  }));
}

function libraryItemsToServices(items: ReturnType<typeof libraryItems>) {
  return items.map((item) => ({
    title: item.title,
    description: item.text || '',
    price: item.price,
    image: item.image,
  }));
}

function mergeRoomsByTitle(...sources: any[][]) {
  const merged: any[] = [];
  const byTitle = new Map<string, any>();

  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const room of source) {
      if (!room) continue;
      const title = stringFrom(room.name, room.title);
      const key = contentTitleKey(title);
      if (!key) {
        merged.push(room);
        continue;
      }

      const existing = byTitle.get(key);
      if (!existing) {
        const copy = { ...room, name: title || stringFrom(room.name), title };
        byTitle.set(key, copy);
        merged.push(copy);
        continue;
      }

      fillMissingContentFields(existing, room);
    }
  }

  return merged;
}

function mergeServicesByTitle(...sources: any[][]) {
  const merged: any[] = [];
  const byTitle = new Map<string, any>();

  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const service of source) {
      if (!service) continue;
      const title = stringFrom(service.title, service.name);
      const key = contentTitleKey(title);
      if (!key) {
        merged.push(service);
        continue;
      }

      const existing = byTitle.get(key);
      if (!existing) {
        const copy = { ...service, title, name: title || stringFrom(service.name) };
        byTitle.set(key, copy);
        merged.push(copy);
        continue;
      }

      fillMissingContentFields(existing, service);
    }
  }

  return merged;
}

function mergeFeatureRecords(...sources: any[][]) {
  const merged: any[] = [];
  const byTitle = new Map<string, any>();

  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const feature of source) {
      if (!feature) continue;
      const title = stringFrom(feature.title, feature.name);
      const key = contentTitleKey(title);
      if (!key) {
        merged.push(feature);
        continue;
      }

      const existing = byTitle.get(key);
      if (!existing) {
        const copy = { ...feature, title, name: title || stringFrom(feature.name) };
        byTitle.set(key, copy);
        merged.push(copy);
        continue;
      }

      fillMissingContentFields(existing, feature);
    }
  }

  return merged;
}

function fillMissingContentFields(target: any, source: any) {
  for (const field of ['name', 'title', 'price', 'priceUnit', 'image', 'icon']) {
    if (!stringFrom(target[field]) && stringFrom(source[field])) target[field] = source[field];
  }

  const sourceText = stringFrom(source.description, source.text);
  const targetText = stringFrom(target.description, target.text);
  if (sourceText && sourceText.length > targetText.length) {
    if ('description' in target || !('text' in target)) target.description = sourceText;
    else target.text = sourceText;
  }

  const targetAmenities = Array.isArray(target.amenities) ? target.amenities : [];
  const sourceAmenities = Array.isArray(source.amenities)
    ? source.amenities
    : Array.isArray(source.features)
      ? source.features
      : [];
  if (!targetAmenities.length && sourceAmenities.length) target.amenities = sourceAmenities;

  const targetFeatures = Array.isArray(target.features) ? target.features : [];
  if (!targetFeatures.length && sourceAmenities.length) target.features = sourceAmenities;
}

function contentTitleKey(value: string) {
  return normalizeCopyForDedupe(value)
    .replace(/\b(room|rooms|suite|suites|service|services)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim() || normalizeCopyForDedupe(value);
}

function libraryItemsToReviews(items: ReturnType<typeof libraryItems>) {
  if (!items.length) return undefined;
  return items.map((item) => ({
    name: item.title,
    text: item.text,
    rating: item.rating,
    location: item.meta,
  }));
}

function ensureReviewFallback(testimonials: any[], businessName: string, sourceHost?: string) {
  const isDeloraine = /deloraine/i.test(`${businessName} ${sourceHost || ''}`);
  if (!isDeloraine || testimonials.length >= 2) return testimonials;

  const fallbackReviews = fallbackDeloraineScrape.reviews ?? [];
  const seen = new Set<string>();
  return [...testimonials, ...fallbackReviews]
    .filter((review) => {
      const key = stringFrom(review.text, review.quote).toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
}

function libraryItemsToFaqs(items: ReturnType<typeof libraryItems>) {
  if (!items.length) return undefined;
  return items.map((item) => ({
    question: item.title,
    answer: item.answer || item.text,
  }));
}

function templateStyle(templateId: PreviewTemplateId) {
  if (templateId === 'original') return {};
  return templateConfig[templateId];
}

function withOnboardingCollections(data: Record<string, any>, fallback: Record<string, any> = {}) {
  const { __preferImportedCollections, ...cleanData } = data;
  const preferImportedCollections = Boolean(__preferImportedCollections);
  const record = cleanData.previewImportRecord as PreviewImportRecord | undefined;
  const normalized = (record?.normalizedPreviewData ?? cleanData) as Record<string, any>;
  const contentLibrary =
    record?.contentLibrary ??
    normalized.siteContentLibrary ??
    cleanData.siteContentLibrary ??
    fallback.siteContentLibrary ??
    emptyContentLibrary(stringFrom(record?.source.url, cleanData.sourceUrl, normalized.sourceUrl), stringFrom(record?.source.host, cleanData.sourceHost, normalized.sourceHost), stringFrom(cleanData.businessName, normalized.businessName, record?.identity.businessName));

  const block = (category: string) => libraryBlock(contentLibrary, category);
  const blockItems = (category: string) => libraryItems(contentLibrary, category);
  const blockImages = (category: string) => libraryImages(contentLibrary, category);

  const firstArray = (values: unknown[]) => {
    for (const value of values) {
      if (Array.isArray(value)) return value;
    }
    return [];
  };

  const arrayFrom = (key: string, ...importedSources: unknown[]) => {
    const localSources = [cleanData[key], fallback[key]];
    return firstArray(preferImportedCollections ? [...importedSources, ...localSources] : [cleanData[key], ...importedSources, fallback[key]]);
  };

  const richArrayFrom = (key: string, ...importedSources: unknown[]) => {
    const sources = preferImportedCollections
      ? [...importedSources, cleanData[key], fallback[key]]
      : [cleanData[key], ...importedSources, fallback[key]];
    const nonEmpty = sources.find((value) => Array.isArray(value) && value.length);
    return Array.isArray(nonEmpty) ? nonEmpty : firstArray(sources);
  };

  const textFrom = (key: string, ...importedSources: unknown[]) => (
    preferImportedCollections
      ? stringFrom(...importedSources, cleanData[key], fallback[key])
      : stringFrom(cleanData[key], ...importedSources, fallback[key])
  );

  const imageFieldFrom = (key: string, ...importedSources: unknown[]) => (
    preferImportedCollections
      ? stringFrom(...importedSources, cleanData[key], fallback[key])
      : stringFrom(cleanData[key], ...importedSources, fallback[key])
  );

  const mapItemsToFeatures = (items: any[] = []) => items.map((item) => ({
    title: stringFrom(item.title, item.name),
    description: stringFrom(item.description, item.text),
    icon: stringFrom(item.icon),
  })).filter((item) => item.title || item.description);

  const mapItemsToSuites = (items: any[] = []) => items.map((item) => ({
    name: stringFrom(item.name, item.title),
    description: stringFrom(item.description, item.text),
    price: stringFrom(item.price),
    image: stringFrom(item.image),
    amenities: Array.isArray(item.amenities) ? item.amenities : Array.isArray(item.features) ? item.features : [],
  })).filter((item) => item.name || item.description || item.image);

  const mapItemsToServices = (items: any[] = []) => items.map((item) => ({
    title: stringFrom(item.title, item.name),
    description: stringFrom(item.description, item.text),
    price: stringFrom(item.price),
    image: stringFrom(item.image),
  })).filter((item) => item.title || item.description || item.image);

  const mapItemsToReviews = (items: any[] = []) => items.map((item) => ({
    name: stringFrom(item.name, item.title, item.author),
    text: stringFrom(item.text, item.quote, item.description),
    rating: typeof item.rating === 'number' ? item.rating : 5,
    location: stringFrom(item.location, item.meta),
  })).filter((item) => item.name || item.text);

  const mapItemsToFaqs = (items: any[] = []) => items.map((item) => ({
    question: stringFrom(item.question, item.title),
    answer: stringFrom(item.answer, item.text, item.description),
  })).filter((item) => item.question && item.answer);

  const mapImagesToUrls = (items: any[] = []) => items.map((item) => stringFrom(item.url, item.image, item)).filter(Boolean);
  const heroBlock = block('hero');
  const heroLinks = heroBlock?.links ?? [];
  const ownerBlock = block('owner-story');
  const contactBlock = block('contact');
  const locationBlock = block('location');
  const socialBlock = block('social');
  const ownerBlockData = ownerBlock
    ? { title: ownerBlock.title, text: ownerBlock.text, image: ownerBlock.images?.[0]?.url }
    : {};
  const ownerSources = preferImportedCollections
    ? [ownerBlockData, normalized.ownerData, cleanData.ownerData, fallback.ownerData]
    : [cleanData.ownerData, normalized.ownerData, ownerBlockData, fallback.ownerData];
  const ownerData = ownerSources.reduce<Record<string, string>>((merged, source) => {
    if (!source || typeof source !== 'object') return merged;
    const sourceRecord = source as Record<string, unknown>;
    for (const field of ['title', 'text', 'description', 'image']) {
      if (!stringFrom(merged[field]) && stringFrom(sourceRecord[field])) merged[field] = stringFrom(sourceRecord[field]);
    }
    return merged;
  }, {});
  const resolvedOwnerData = Object.values(ownerData).some(Boolean) ? ownerData : undefined;

  return {
    ...cleanData,
    heroPrimaryCtaText: textFrom('heroPrimaryCtaText', heroLinks[0]?.label, cleanData.ctaText, 'View Suites'),
    heroPrimaryCtaHref: textFrom('heroPrimaryCtaHref', heroLinks[0]?.url, '#suites'),
    heroSecondaryCtaText: textFrom('heroSecondaryCtaText', heroLinks[1]?.label, 'Our Care Approach'),
    heroSecondaryCtaHref: textFrom('heroSecondaryCtaHref', heroLinks[1]?.url, '#care'),
    whyChooseUsHeading: textFrom('whyChooseUsHeading', normalized.whyChooseUsData?.whyChooseUsHeading, normalized.whyChooseUsData?.heading, block('why-choose-us')?.title),
    whyChooseUsText: textFrom('whyChooseUsText', normalized.whyChooseUsData?.whyChooseUsText, normalized.whyChooseUsData?.text, block('why-choose-us')?.text),
    aboutHeading: textFrom('aboutHeading', normalized.aboutHeading, normalized.aboutData?.heading, block('why-choose-us')?.title, block('facilities')?.title, block('hero')?.title),
    aboutText: textFrom('aboutText', normalized.aboutText, normalized.aboutData?.text, block('why-choose-us')?.text, block('facilities')?.text, block('hero')?.text),
    aboutImage: imageFieldFrom(
      'aboutImage',
      normalized.aboutImage,
      normalized.aboutData?.image,
      normalized.facilitiesData?.facilitiesImage,
      blockImages('facilities')[0]?.url,
      blockImages('gallery')[0]?.url,
      record?.media.galleryImages?.[0]?.url,
    ),
    facilitiesHeading: textFrom('facilitiesHeading', normalized.facilitiesData?.facilitiesHeading, normalized.facilitiesData?.heading, block('facilities')?.title),
    facilitiesText: textFrom('facilitiesText', normalized.facilitiesData?.facilitiesText, normalized.facilitiesData?.text, block('facilities')?.text),
    facilitiesImage: imageFieldFrom('facilitiesImage', normalized.facilitiesData?.facilitiesImage, normalized.facilitiesData?.image, blockImages('facilities')[0]?.url),
    suitesHeading: textFrom('suitesHeading', normalized.suitesData?.suitesHeading, normalized.suitesData?.heading, block('rooms')?.title),
    additionalServicesHeading: textFrom('additionalServicesHeading', normalized.servicesData?.servicesHeading, normalized.servicesData?.heading, block('services')?.title),
    galleryHeading: textFrom('galleryHeading', normalized.galleryData?.galleryHeading, normalized.galleryData?.heading, block('gallery')?.title),
    testimonialsHeading: textFrom('testimonialsHeading', normalized.testimonialsData?.testimonialsHeading, normalized.testimonialsData?.heading, block('reviews')?.title),
    faqHeading: textFrom('faqHeading', normalized.faqData?.faqHeading, normalized.faqData?.heading, block('faqs')?.title),
    ownerData: resolvedOwnerData,
    locationData: cleanData.locationData ?? normalized.locationData ?? (locationBlock ? {
      heading: locationBlock.title,
      text: locationBlock.text,
      directions: locationBlock.items?.[0]?.text,
    } : undefined),
    hours: textFrom('hours', normalized.hours, normalized.contactData?.hours, contactBlock?.items?.find((item) => /hour/i.test(item.title))?.text),
    socialLinks: cleanData.socialLinks ?? normalized.socialLinks ?? normalized.contactData?.socialLinks ?? {
      facebook: socialBlock?.links?.find((link) => /facebook/i.test(link.label || link.url))?.url,
      instagram: socialBlock?.links?.find((link) => /instagram/i.test(link.label || link.url))?.url,
    },
    virtualTourUrl: textFrom('virtualTourUrl', normalized.virtualTourUrl, normalized.locationData?.virtualTourUrl, cleanData.locationData?.virtualTourUrl),
    whyChooseUsFeatures: arrayFrom(
      'whyChooseUsFeatures',
      normalized.whyChooseUsData?.whyChooseUsFeatures,
      normalized.whyChooseUsData?.features,
      mapItemsToFeatures(blockItems('why-choose-us')),
      record?.content.highlights,
    ),
    facilityFeatures: arrayFrom(
      'facilityFeatures',
      normalized.facilitiesData?.facilityFeatures,
      normalized.facilitiesData?.features,
      mapItemsToFeatures(blockItems('facilities')),
    ),
    suites: richArrayFrom(
      'suites',
      mapItemsToSuites(blockItems('rooms')),
      normalized.suitesData?.suites,
      mapItemsToSuites(record?.rooms ?? []),
    ),
    roomTypes: arrayFrom('roomTypes'),
    pricingRates: arrayFrom('pricingRates'),
    additionalServices: richArrayFrom(
      'additionalServices',
      mapItemsToServices(blockItems('services')),
      normalized.servicesData?.services,
      mapItemsToServices(record?.services ?? []),
    ),
    discounts: arrayFrom('discounts'),
    blockOutDates: arrayFrom('blockOutDates'),
    galleryImages: richArrayFrom(
      'galleryImages',
      mapImagesToUrls(blockImages('gallery')),
      mapImagesToUrls(record?.media.galleryImages ?? []),
      mapImagesToUrls(normalized.galleryData?.galleryImages ?? []),
      mapImagesToUrls(normalized.galleryData?.images ?? []),
      record?.media.images,
    ),
    testimonials: arrayFrom(
      'testimonials',
      normalized.testimonialsData?.testimonials,
      mapItemsToReviews(blockItems('reviews')),
      mapItemsToReviews(record?.contentLibrary?.blocks.find((candidate) => candidate.category === 'reviews')?.items ?? []),
    ),
    faqs: arrayFrom(
      'faqs',
      normalized.faqData?.faqs,
      mapItemsToFaqs(blockItems('faqs')),
      record?.faqs,
    ),
    customSections: arrayFrom('customSections'),
  };
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

function embeddableVirtualTourUrl(rawUrl: string, sourceHost?: string): string {
  if (!rawUrl) return '';
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase();
    const source = (sourceHost || '').replace(/^www\./, '').toLowerCase();
    if (source && hostname === source && url.hash) return '';
    if (/google\.[^/]+\/maps\/embed|my\.matterport\.com|kuula\.co|cloudpano\.com|realsee\.ai|eyespy360\.com/i.test(url.href)) {
      return url.href;
    }
    if (/virtual|tour|360|streetview|matterport/i.test(url.href) && hostname !== source) {
      return url.href;
    }
  } catch {
    return '';
  }
  return '';
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

function uniqueGalleryItems(items: Array<{ url?: string; image?: string; caption?: string }>) {
  const seen = new Set<string>();
  const result: Array<{ url: string; caption?: string }> = [];

  for (const item of items) {
    const url = stringFrom(item.url, item.image);
    const key = normalizedImageKey(url);
    if (!url || seen.has(key)) continue;
    seen.add(key);
    result.push({ url, caption: stringFrom(item.caption) });
  }

  return result;
}

function normaliseMediaAssets(...sources: unknown[]): CatteryMediaAsset[] {
  const seen = new Set<string>();
  const assets: CatteryMediaAsset[] = [];
  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const item of source) {
      if (!item || typeof item !== 'object') continue;
      const asset = item as CatteryMediaAsset;
      const url = stringFrom(asset.url);
      if (!/^https?:\/\//i.test(url)) continue;
      const key = normalizedImageKey(url);
      if (seen.has(key)) continue;
      seen.add(key);
      assets.push({
        ...asset,
        url,
        tags: Array.isArray(asset.tags) ? asset.tags.map((tag) => stringFrom(tag)).filter(Boolean) : [],
      });
    }
  }
  return assets;
}

function normaliseContentSnippets(...sources: unknown[]): CatteryContentSnippet[] {
  const seen = new Set<string>();
  const snippets: CatteryContentSnippet[] = [];
  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const item of source) {
      if (!item || typeof item !== 'object') continue;
      const snippet = item as Partial<CatteryContentSnippet>;
      const text = stringFrom(snippet.text);
      if (!text) continue;
      const key = `${stringFrom(snippet.category)}:${text.toLowerCase().slice(0, 160)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      snippets.push({
        sourceUrl: stringFrom(snippet.sourceUrl),
        sourcePageTitle: stringFrom(snippet.sourcePageTitle),
        heading: stringFrom(snippet.heading),
        category: stringFrom(snippet.category) || 'general',
        tags: Array.isArray(snippet.tags) ? snippet.tags.map((tag) => stringFrom(tag)).filter(Boolean) : [],
        title: stringFrom(snippet.title, snippet.heading, snippet.sourcePageTitle, 'Imported content'),
        text,
      });
    }
  }
  return snippets;
}

function snippetTextFor(snippets: CatteryContentSnippet[], categories: string[]): string {
  return snippets
    .find((snippet) => categories.includes(snippet.category) && snippet.text)
    ?.text || '';
}

const copyDedupeStopWords = new Set([
  'about',
  'again',
  'also',
  'and',
  'are',
  'away',
  'both',
  'but',
  'care',
  'cat',
  'cats',
  'cattery',
  'deloraine',
  'for',
  'from',
  'has',
  'have',
  'home',
  'into',
  'new',
  'not',
  'our',
  'that',
  'the',
  'their',
  'this',
  'to',
  'with',
  'your',
]);

function pickUniqueCopy(usedCopy: string[], candidates: unknown[], fallback: unknown = '') {
  for (const candidate of uniqueStrings(candidates)) {
    if (isDuplicateCopy(candidate, usedCopy)) continue;
    usedCopy.push(candidate);
    return candidate;
  }

  const fallbackText = stringFrom(fallback);
  if (fallbackText && !isDuplicateCopy(fallbackText, usedCopy)) {
    usedCopy.push(fallbackText);
    return fallbackText;
  }

  return '';
}

function isDuplicateCopy(candidate: string, usedCopy: string[]) {
  const normalizedCandidate = normalizeCopyForDedupe(candidate);
  if (!normalizedCandidate) return true;

  const candidateTokens = copyTokens(normalizedCandidate);
  return usedCopy.some((used) => {
    const normalizedUsed = normalizeCopyForDedupe(used);
    if (!normalizedUsed) return false;
    if (normalizedCandidate === normalizedUsed) return true;
    if (Math.min(normalizedCandidate.length, normalizedUsed.length) > 80) {
      if (normalizedCandidate.includes(normalizedUsed) || normalizedUsed.includes(normalizedCandidate)) return true;
    }

    const usedTokens = copyTokens(normalizedUsed);
    if (candidateTokens.length < 5 || usedTokens.length < 5) return false;
    const overlap = candidateTokens.filter((token) => usedTokens.includes(token)).length;
    return overlap / Math.min(candidateTokens.length, usedTokens.length) >= 0.72;
  });
}

function normalizeCopyForDedupe(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function copyTokens(value: string) {
  return value
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !copyDedupeStopWords.has(token));
}

function ownerCandidateImages(
  mediaAssets: CatteryMediaAsset[],
  candidates: Array<{ url?: unknown; label?: unknown }>,
): string[] {
  const scored = new Map<string, { url: string; score: number }>();
  const ownerPattern = /\b(owner|owners|host|hosts|team|staff|people|person|family|paul|vanessa|wilson)\b/i;

  const addCandidate = (urlValue: unknown, labelValue: unknown, baseScore = 0) => {
    const url = stringFrom(urlValue);
    if (!url) return;
    const key = normalizedImageKey(url);
    const label = stringFrom(labelValue);
    const haystack = safeDecode(`${url} ${label}`).toLowerCase();
    const matchScore = ownerPattern.test(haystack) ? 30 : 0;
    const score = baseScore + matchScore;
    if (score <= 0) return;
    const existing = scored.get(key);
    if (!existing || score > existing.score) scored.set(key, { url, score });
  };

  for (const asset of mediaAssets) {
    addCandidate(
      asset.url,
      [
        asset.caption,
        asset.alt,
        asset.title,
        asset.nearbyText,
        asset.sourcePageTitle,
        asset.tags?.join(' '),
      ].filter(Boolean).join(' '),
      asset.category === 'owner' ? 50 : 0,
    );
  }

  for (const candidate of candidates) {
    addCandidate(candidate.url, candidate.label);
  }

  return Array.from(scored.values())
    .sort((left, right) => right.score - left.score)
    .map((candidate) => candidate.url);
}

function isPreviewSafeMedia(asset: CatteryMediaAsset): boolean {
  if (!asset.url) return false;
  if (asset.isLogo || asset.isDecorative || asset.containsText) return false;
  return !isLikelyTextHeavyImage(asset.url);
}

function mediaImageForCategories(mediaAssets: CatteryMediaAsset[], categories: CatteryMediaCategory[]): string {
  return mediaImagesForCategories(mediaAssets, categories)[0] || '';
}

function mediaImagesForCategories(mediaAssets: CatteryMediaAsset[], categories: CatteryMediaCategory[]): string[] {
  return mediaAssets
    .filter((asset) => categories.includes((asset.category ?? 'unknown') as CatteryMediaCategory))
    .filter((asset) => isPreviewSafeMedia(asset))
    .sort((left, right) => (right.score ?? 0) - (left.score ?? 0))
    .map((asset) => asset.url);
}

function firstSafeImage(images: unknown[], mediaAssets: CatteryMediaAsset[]): string {
  return uniqueStrings(images).find((image) => !isTextHeavyImage(image, mediaAssets) && isUsableGalleryImage(image)) || '';
}

function isTextHeavyImage(image: string, mediaAssets: CatteryMediaAsset[]): boolean {
  const key = normalizedImageKey(image);
  const asset = mediaAssets.find((candidate) => normalizedImageKey(candidate.url) === key);
  return Boolean(asset?.containsText || asset?.isLogo || asset?.isDecorative || isLikelyTextHeavyImage(image));
}

function isLikelyTextHeavyImage(image: string): boolean {
  const decoded = safeDecode(image).toLowerCase();
  return /\b(logo|wordmark|text|copy|typography|words|poster|flyer|brochure|menu|pricing|prices|rates|sign|banner|header|social|share|og-image|open-graph|facebook|instagram|screenshot|screen|card|quote|review-graphic|testimonial-graphic|business-card|map|directions|driveway|bus.?stop|route|gps|landmark)\b/i.test(decoded);
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isUsableGalleryImage(image: string, logoImage?: string): boolean {
  const normalized = image.split('?')[0].toLowerCase();
  const logoKey = logoImage?.split('?')[0].toLowerCase();
  if (!normalized) return false;
  if (logoKey && normalized === logoKey) return false;
  const decoded = safeDecode(normalized);
  if (isLikelyTextHeavyImage(decoded)) return false;
  return !/logo|favicon|apple-touch-icon|icon|placeholder|silhouette|black.?cat|catstays|\/cat(?:[-_][a-z0-9]+)?\.png$/i.test(decoded);
}

function ensureImageCount(images: string[], heroImage: string, allowGenericFallback = true): string[] {
  const fallback = allowGenericFallback
    ? [
        heroImage,
        'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1200&h=900&fit=crop',
        'https://images.unsplash.com/photo-1573865526739-10c1de0e0ef2?w=1200&h=900&fit=crop',
        'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&h=900&fit=crop',
      ]
    : [heroImage];
  return uniqueStrings([...images, ...fallback]);
}

function normalizedImageKey(image: string) {
  return image.split('?')[0].trim().toLowerCase();
}

function rememberImage(usedImages: Set<string>, image: string) {
  if (!image) return;
  usedImages.add(normalizedImageKey(image));
}

function hasSeenImage(usedImages: Set<string>, image: string) {
  return image ? usedImages.has(normalizedImageKey(image)) : false;
}

function pickUniqueImage(usedImages: Set<string>, preferred: unknown[], fallbackImages: string[]) {
  const preferredImages = uniqueStrings(preferred).filter((image) => isUsableGalleryImage(image));
  for (const image of preferredImages) {
    if (hasSeenImage(usedImages, image)) continue;
    rememberImage(usedImages, image);
    return image;
  }

  for (const image of fallbackImages) {
    if (!image || hasSeenImage(usedImages, image)) continue;
    if (!isUsableGalleryImage(image)) continue;
    rememberImage(usedImages, image);
    return image;
  }

  const fallback = preferredImages[0] || fallbackImages[0] || '';
  rememberImage(usedImages, fallback);
  return fallback;
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
    { title: 'Clear Routines', text: 'Consistent feeding, cleaning, and comfort checks help cats settle.' },
  ]
    .filter((feature) => feature.title || feature.text)
    .slice(0, 5)
    .map((feature, index) => ({
      title: feature.title || ['Fully Licensed', 'Premium Care', 'Daily Enrichment', 'Photo Updates', 'Clear Routines'][index],
      text: feature.text || 'A calm, professional cattery experience.',
    }));
}

function ensureSuiteCount(
  rooms: any[],
  images: string[],
  fallbackPrice?: string,
  usedImages?: Set<string>,
  allowImageFallback = true,
) {
  const fallbackSuites = [
    { name: 'Standard Suites', description: 'Comfortable and cosy suites perfect for a relaxing stay.' },
    { name: 'Deluxe Suites', description: 'Extra comfort and premium features for added calm.' },
    { name: 'Executive Suites', description: 'Spacious accommodation with personalised care.' },
    { name: 'Family Suites', description: 'Ideal for multi-cat families staying together.' },
  ];
  const sourceRooms = rooms.length ? rooms.slice(0, 8) : fallbackSuites;

  return sourceRooms.map((room, index) => {
    const fallback = fallbackSuites[index % fallbackSuites.length];
    const title = stringFrom(room.name, room.title, fallback.name);
    const price = stringFrom(room.price, fallbackPrice);
    const priceUnit = stringFrom(room.priceUnit);
    const priceLabel = price && priceUnit ? `${price} ${priceUnit}` : price;
    const roomImage = stringFrom(room.image);
    const hasContextualRoomImage = isUsableGalleryImage(roomImage);
    const resolvedImage = hasContextualRoomImage
      ? roomImage
      : !allowImageFallback
        ? ''
        : usedImages
          ? pickUniqueImage(usedImages, [images[index + 1], images[index], images[0]], images)
          : imageFrom(images[index + 1], images[index], images[0]);
    if (hasContextualRoomImage && usedImages) rememberImage(usedImages, roomImage);
    return {
      image: resolvedImage,
      title,
      text: stringFrom(room.description, priceLabel ? `${fallback.description} ${priceLabel}.` : fallback.description),
      price: priceLabel,
      features: Array.isArray(room.amenities)
        ? room.amenities.map((feature: unknown) => stringFrom(feature)).filter(Boolean).slice(0, 6)
        : Array.isArray(room.features)
          ? room.features.map((feature: unknown) => stringFrom(feature)).filter(Boolean).slice(0, 6)
          : [],
    };
  });
}

function ensureTestimonials(
  testimonials: any[],
  businessName: string,
  images: string[],
  heroImage: string,
  testimonialImage?: unknown,
  allowFallback = true,
) {
  const mapped = testimonials
    .map((testimonial: any, index: number) => ({
      quote: stringFrom(testimonial.text, testimonial.quote),
      author: stringFrom(testimonial.name, testimonial.author, testimonial.customer, 'Guest family'),
      image: imageFrom(testimonial.image, index === 0 ? testimonialImage : undefined, images[index + 4], images[index], heroImage),
      location: stringFrom(testimonial.location),
    }))
    .filter((testimonial) => testimonial.quote);

  if (mapped.length) return mapped.slice(0, 10);

  return allowFallback ? [
    {
      quote: "I built this because I needed it, and now I wouldn't run my cattery without it.",
      author: 'Vanessa',
      image: imageFrom(testimonialImage, images[3], heroImage),
      location: businessName,
    },
  ] : [];
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
