import {
  buildPreviewDataFromScrape,
  currentDeloraineAssets,
  fallbackDeloraineScrape,
  migrateDeloraineAssetsInValue,
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

export const previewTemplateCards: PreviewTemplateOption[] = [
  {
    id: 'original',
    name: 'Original',
    description: 'The scraped website exactly as it appears now',
    image: currentDeloraineAssets.hero,
    sourceOnly: true,
  },
  {
    id: 'conversion-focus',
    name: 'Focus',
    description: 'Conversion-first layout with booking widget below the hero',
    image: currentDeloraineAssets.building,
  },
  {
    id: 'editorial-guide',
    name: 'Editorial',
    description: 'Story-led checkerboard sections with magazine-style pacing',
    image: currentDeloraineAssets.owner,
  },
  {
    id: 'modern-showcase',
    name: 'Showcase',
    description: 'Image-first pages with minimal copy and strong visual rhythm',
    image: currentDeloraineAssets.kitty,
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
  const migratedScrape = migrateDeloraineAssetsInValue(scrape);
  const normalizedPreviewData = buildPreviewDataFromScrape(migratedScrape);
  const sourceUrl = migratedScrape.sourceUrl || '';
  const sourceHost = migratedScrape.sourceHost || hostFromUrl(sourceUrl);
  const businessName = normalizedPreviewData.businessName;

  return {
    id: `${slugify(sourceHost || businessName)}-${Date.now()}`,
    status: 'preview',
    selectedTemplate: 'original',
    createdAt: new Date().toISOString(),
    source: {
      url: sourceUrl,
      host: sourceHost,
      extractedFrom: migratedScrape.extractedFrom,
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
      city: migratedScrape.city || normalizedPreviewData.location,
    },
    media: {
      heroImage: normalizedPreviewData.heroImage,
      logoImage: migratedScrape.logoImage,
      images: migratedScrape.images ?? [],
      galleryImages: migratedScrape.galleryImages ?? [],
    },
    content: {
      title: migratedScrape.title || businessName,
      description: migratedScrape.description || normalizedPreviewData.aboutText,
      heading: migratedScrape.heading || normalizedPreviewData.heroHeading,
      heroHeading: normalizedPreviewData.heroHeading,
      heroSubheading: normalizedPreviewData.heroSubheading,
      aboutHeading: normalizedPreviewData.aboutHeading,
      aboutText: normalizedPreviewData.aboutText,
      highlights: migratedScrape.highlights ?? [],
    },
    rooms: migratedScrape.rooms ?? [],
    services: migratedScrape.services ?? [],
    faqs: migratedScrape.faqs ?? [],
    contentLibrary: normalizedPreviewData.siteContentLibrary ?? emptyContentLibrary(sourceUrl, sourceHost, businessName),
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
  sessionStorage.setItem(previewImportTableStorageKey, serialized);
  localStorage.setItem(previewImportTableStorageKey, serialized);
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
  const normalizedRecord = normalized as Record<string, any>;
  const businessName = stringFrom(data.businessName, normalized.businessName, record?.identity.businessName, 'Your Cattery');
  const contentLibrary =
    record?.contentLibrary ??
    normalized.siteContentLibrary ??
    data.siteContentLibrary ??
    emptyContentLibrary(stringFrom(record?.source.url, data.sourceUrl, normalized.sourceUrl), stringFrom(record?.source.host, data.sourceHost, normalized.sourceHost), businessName);
  const libraryRooms = libraryItems(contentLibrary, 'rooms');
  const libraryServices = libraryItems(contentLibrary, 'services');
  const libraryReviews = libraryItems(contentLibrary, 'reviews');
  const libraryFaqs = libraryItems(contentLibrary, 'faqs');
  const libraryGalleryImages = libraryImages(contentLibrary, 'gallery');
  const isDeloraineSource = isDelorainePreview(record, contentLibrary, businessName);
  const deloraineSemanticImages = isDeloraineSource
    ? [currentDeloraineAssets.hero, currentDeloraineAssets.ownerPortrait, currentDeloraineAssets.buildingThumb, currentDeloraineAssets.grooming]
    : [];
  const importedMediaImages = uniqueStrings([
    ...(record?.media.images ?? []),
    ...(record?.media.galleryImages ?? []).map((image) => image.url),
    ...libraryGalleryImages.map((image) => image.url),
    ...deloraineSemanticImages,
  ]);
  const heroBlock = libraryBlock(contentLibrary, 'hero');
  const heroLinks = heroBlock?.links ?? [];
  const whyChooseBlock = libraryBlock(contentLibrary, 'why-choose-us');
  const facilitiesBlock = libraryBlock(contentLibrary, 'facilities');
  const dailyCareBlock = libraryBlock(contentLibrary, 'daily-care');
  const locationBlock = libraryBlock(contentLibrary, 'location');
  const logoImage = stringFrom(data.logoImage, normalizedRecord.logoImage, record?.media.logoImage);
  const heroImage = selectHeroImage(
    [
      data.heroImage,
      normalized.heroImage,
      heroBlock?.images?.[0]?.url,
      record?.media.heroImage,
      record?.media.images?.[0],
      record?.media.galleryImages?.[0]?.url,
    ],
    importedMediaImages,
  );
  const editedGalleryImages = Array.isArray(data.galleryImages) ? data.galleryImages : [];
  const galleryImages = uniqueStrings([
    ...editedGalleryImages,
    ...importedMediaImages,
    data.facilitiesImage,
    data.aboutImage,
    data.ownerData?.image,
    heroImage,
  ]).filter((image) => isUsableGalleryImage(image, logoImage));
  const fallbackImages = ensureImageCount(galleryImages, heroImage);
  const usedImages = new Set<string>();
  rememberImage(usedImages, heroImage);
  const editedHighlights = Array.isArray(data.whyChooseUsFeatures) ? data.whyChooseUsFeatures : undefined;
  const highlights = (editedHighlights ?? record?.content.highlights ?? []).filter(Boolean);
  const editedRooms = Array.isArray(data.suites)
    ? data.suites
    : Array.isArray(data.roomTypes)
      ? data.roomTypes
      : undefined;
  const rooms = (editedRooms ?? (record?.rooms?.length ? record.rooms : libraryRooms.length ? libraryRoomsToRooms(libraryRooms) : [])).filter(Boolean);
  const editedServices = Array.isArray(data.additionalServices) ? data.additionalServices : undefined;
  const normalizedServices = normalizedRecord.servicesData?.services ?? data.servicesData?.services ?? [];
  const services = (editedServices ?? (record?.services?.length ? record.services : libraryServices.length ? libraryItemsToServices(libraryServices) : normalizedServices)).filter(Boolean);
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
  const ownerData = data.ownerData ?? normalizedRecord.ownerData ?? {};
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
  const primaryDescription = stringFrom(
    data.aboutText,
    normalized.aboutText,
    record?.content.aboutText,
    record?.content.description,
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
    ? mappedHighlights.filter((feature) => feature.title || feature.text).slice(0, 4)
    : ensureFeatureCount(mappedHighlights, mappedServices);
  const whyChooseItems = editedHighlights
    ? featureItems
    : ensureFeatureCount(
        (whyChooseBlock?.items?.length ? whyChooseBlock.items : featureItems).map((item: any) => ({
          title: stringFrom(item.title, item.name),
          text: stringFrom(item.text, item.description),
          icon: stringFrom(item.icon),
        })),
        featureItems,
      ).slice(0, 4);
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
  const ownerImageCandidates = imagesMatching(fallbackImages, /paul|vanessa|owner|portrait|host|team|staff/i);
  const facilityImageCandidates = imagesMatching(fallbackImages, /building|facility|exterior|accommodation/i);
  const serviceImageCandidates = imagesMatching(fallbackImages, /groom|brush|medicine|service|transport|airport|vet|flea|worm/i);
  const aboutImage = pickUniqueImage(
    usedImages,
    [
      ownerData.image,
      normalizedRecord.ownerData?.image,
      ...ownerImageCandidates,
      imageMatches(data.aboutImage, /paul|vanessa|owner|portrait|host|team|staff/i) ? data.aboutImage : '',
      imageMatches(normalizedRecord.aboutImage, /paul|vanessa|owner|portrait|host|team|staff/i) ? normalizedRecord.aboutImage : '',
      imageMatches(normalizedRecord.aboutData?.image, /paul|vanessa|owner|portrait|host|team|staff/i) ? normalizedRecord.aboutData?.image : '',
      fallbackImages.find((image) => image !== heroImage),
    ],
    fallbackImages,
  );
  const facilityImage = pickUniqueImage(
    usedImages,
    [
      ...facilityImageCandidates,
      imageMatches(data.facilitiesImage, /building|facility|exterior|accommodation/i) ? data.facilitiesImage : '',
      imageMatches(facilitiesBlock?.images?.[0]?.url, /building|facility|exterior|accommodation/i) ? facilitiesBlock?.images?.[0]?.url : '',
      imageMatches(normalizedRecord.facilitiesData?.facilitiesImage, /building|facility|exterior|accommodation/i) ? normalizedRecord.facilitiesData?.facilitiesImage : '',
      fallbackImages[2],
    ],
    fallbackImages,
  );
  const ownerImage = pickUniqueImage(
    usedImages,
    [
      ownerData.image,
      normalizedRecord.ownerData?.image,
      ...ownerImageCandidates,
      fallbackImages[5],
      fallbackImages[1],
    ],
    fallbackImages,
  );
  const virtualTourUrl = embeddableVirtualTourUrl(
    stringFrom(locationData.virtualTourUrl, normalized.virtualTourUrl, data.virtualTourUrl, data.contactData?.virtualTourUrl),
    contentLibrary.sourceHost,
  );
  const suiteContent = editedRooms && editedRooms.length === 0
    ? []
    : ensureSuiteCount(rooms, fallbackImages, data.pricePerNight || normalized.pricePerNight, usedImages);
  const usedServiceImages = new Set<string>();
  const serviceContent = services.map((service: any, index: number) => ({
    image: serviceImageFor(service, serviceImageCandidates, usedServiceImages),
    title: stringFrom(service.title, service.name, `Care service ${index + 1}`),
    text: stringFrom(service.description, service.text, 'Additional support available during the stay.'),
    price: stringFrom(service.price),
  }));
  const remainingGalleryImages = fallbackImages.filter((image) => !hasSeenImage(usedImages, image));
  const galleryPreferredImages = imagesMatching(remainingGalleryImages, /kitty|wally|lola|gallery/i);
  const gallerySourceImages = uniqueImagesByKey(galleryPreferredImages.length ? galleryPreferredImages : remainingGalleryImages.length ? remainingGalleryImages : fallbackImages);
  const galleryContent = gallerySourceImages.slice(0, 12).map((image, index) => ({
    image,
    caption: stringFrom(record?.media.galleryImages?.[index]?.caption, `${businessName} photo ${index + 1}`),
  }));

  return {
    business: {
      name: businessName,
      tagline: stringFrom(data.tagline, 'Luxury holiday retreat for cats'),
      location: stringFrom(data.location, normalized.location, record?.identity.location),
    },
    hero: {
      eyebrow: stringFrom(data.heroEyebrow, 'A home away from home'),
      heading: stringFrom(data.heroHeading, normalized.heroHeading, record?.content.heroHeading, `Welcome to ${businessName}`),
      text: stringFrom(data.heroSubheading, normalized.heroSubheading, record?.content.heroSubheading, primaryDescription),
      image: heroImage,
      button: stringFrom(data.ctaText, data.heroPrimaryCtaText, heroLinks[0]?.label, 'Book Now'),
      primaryButton: stringFrom(data.heroPrimaryCtaText, heroLinks[0]?.label, 'Discover Our Suites'),
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
      text: stringFrom(data.whyChooseUsText, whyChooseBlock?.text, primaryDescription),
      items: whyChooseItems,
    },
    facilities: {
      title: stringFrom(data.facilitiesHeading, facilitiesBlock?.title, 'Our Facilities'),
      text: stringFrom(data.facilitiesText, facilitiesBlock?.text, 'Comfortable, secure spaces designed around daily cat care, quiet routines, and peace of mind.'),
      image: facilityImage,
      items: facilityItems.length || editedFacilityItems ? facilityItems : featureItems.slice(0, 4),
    },
    services: serviceContent,
    about: {
      title: stringFrom(data.aboutHeading, normalized.aboutHeading, record?.content.aboutHeading, `About ${businessName}`),
      text: primaryDescription,
      image: aboutImage,
    },
    gallery: galleryContent,
    suites: suiteContent,
    testimonials: ensureTestimonials(testimonials, businessName, fallbackImages, heroImage, data.testimonialImage),
    faqs: faqs.map((faq: any) => ({
      question: stringFrom(faq.question),
      answer: stringFrom(faq.answer),
    })).filter((faq) => faq.question && faq.answer),
    owner: {
      title: stringFrom(ownerData.title, `Meet the people behind ${businessName}`),
      text: stringFrom(ownerData.text, ownerData.description, primaryDescription),
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
      about: stringFrom(data.footerAbout, primaryDescription),
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

  return {
    ...cleanData,
    heroPrimaryCtaText: textFrom('heroPrimaryCtaText', heroLinks[0]?.label, cleanData.ctaText, 'Discover Our Suites'),
    heroPrimaryCtaHref: textFrom('heroPrimaryCtaHref', heroLinks[0]?.url, '#suites'),
    heroSecondaryCtaText: textFrom('heroSecondaryCtaText', heroLinks[1]?.label, 'Our Care Approach'),
    heroSecondaryCtaHref: textFrom('heroSecondaryCtaHref', heroLinks[1]?.url, '#care'),
    whyChooseUsHeading: textFrom('whyChooseUsHeading', normalized.whyChooseUsData?.whyChooseUsHeading, normalized.whyChooseUsData?.heading, block('why-choose-us')?.title),
    whyChooseUsText: textFrom('whyChooseUsText', normalized.whyChooseUsData?.whyChooseUsText, normalized.whyChooseUsData?.text, block('why-choose-us')?.text),
    aboutHeading: textFrom('aboutHeading', normalized.aboutHeading, normalized.aboutData?.heading, block('hero')?.title),
    aboutText: textFrom('aboutText', normalized.aboutText, normalized.aboutData?.text, block('hero')?.text),
    aboutImage: imageFieldFrom(
      'aboutImage',
      normalized.aboutImage,
      normalized.aboutData?.image,
      blockImages('gallery')[0]?.url,
      record?.media.galleryImages?.[0]?.url,
      normalized.facilitiesData?.facilitiesImage,
      blockImages('facilities')[0]?.url,
    ),
    facilitiesHeading: textFrom('facilitiesHeading', normalized.facilitiesData?.facilitiesHeading, normalized.facilitiesData?.heading, block('facilities')?.title),
    facilitiesText: textFrom('facilitiesText', normalized.facilitiesData?.facilitiesText, normalized.facilitiesData?.text, block('facilities')?.text),
    facilitiesImage: imageFieldFrom('facilitiesImage', normalized.facilitiesData?.facilitiesImage, normalized.facilitiesData?.image, blockImages('facilities')[0]?.url),
    suitesHeading: textFrom('suitesHeading', normalized.suitesData?.suitesHeading, normalized.suitesData?.heading, block('rooms')?.title),
    additionalServicesHeading: textFrom('additionalServicesHeading', normalized.servicesData?.servicesHeading, normalized.servicesData?.heading, block('services')?.title),
    galleryHeading: textFrom('galleryHeading', normalized.galleryData?.galleryHeading, normalized.galleryData?.heading, block('gallery')?.title),
    testimonialsHeading: textFrom('testimonialsHeading', normalized.testimonialsData?.testimonialsHeading, normalized.testimonialsData?.heading, block('reviews')?.title),
    faqHeading: textFrom('faqHeading', normalized.faqData?.faqHeading, normalized.faqData?.heading, block('faqs')?.title),
    ownerData: cleanData.ownerData ?? normalized.ownerData ?? (ownerBlock ? { title: ownerBlock.title, text: ownerBlock.text, image: ownerBlock.images?.[0]?.url } : undefined),
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
    suites: arrayFrom(
      'suites',
      normalized.suitesData?.suites,
      mapItemsToSuites(blockItems('rooms')),
      mapItemsToSuites(record?.rooms ?? []),
    ),
    roomTypes: arrayFrom('roomTypes'),
    pricingRates: arrayFrom('pricingRates'),
    additionalServices: arrayFrom(
      'additionalServices',
      normalized.servicesData?.services,
      mapItemsToServices(blockItems('services')),
      mapItemsToServices(record?.services ?? []),
    ),
    discounts: arrayFrom('discounts'),
    blockOutDates: arrayFrom('blockOutDates'),
    galleryImages: arrayFrom(
      'galleryImages',
      mapImagesToUrls(normalized.galleryData?.galleryImages ?? []),
      mapImagesToUrls(normalized.galleryData?.images ?? []),
      mapImagesToUrls(blockImages('gallery')),
      mapImagesToUrls(record?.media.galleryImages ?? []),
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

function selectHeroImage(preferred: unknown[], allImages: string[]): string {
  const candidates = uniqueStrings([...preferred, ...allImages]).filter((image) => isUsableGalleryImage(image));
  const nonOpenGraphImages = candidates.filter((image) => !imageMatches(image, /(?:^|[-_/])og(?:[-_.]|image)|open.?graph|social.?card/i));
  return imageFrom(
    imagesMatching(nonOpenGraphImages, /hero|banner|background|bg/i)[0],
    imagesMatching(nonOpenGraphImages, /building|exterior|facility/i)[0],
    nonOpenGraphImages[0],
    candidates[0],
  );
}

function isDelorainePreview(
  record: PreviewImportRecord | null | undefined,
  contentLibrary: CatterySiteContentLibrary,
  businessName: string,
) {
  const source = `${record?.source.host || ''} ${contentLibrary.sourceHost || ''} ${businessName}`;
  return /delorainecattery\.com|deloraine cattery/i.test(source);
}

function imageMatches(value: unknown, pattern: RegExp): boolean {
  const image = stringFrom(value);
  if (!image) return false;
  try {
    return pattern.test(decodeURIComponent(image));
  } catch {
    return pattern.test(image);
  }
}

function imagesMatching(images: string[], pattern: RegExp): string[] {
  return images.filter((image) => imageMatches(image, pattern));
}

function serviceImageFor(service: any, serviceImages: string[], usedServiceImages?: Set<string>) {
  const title = stringFrom(service.title, service.name);
  const currentImage = stringFrom(service.image);
  const titlePattern = serviceTitlePattern(title);
  const firstUnused = (images: string[]) => {
    for (const image of images) {
      if (!image || usedServiceImages?.has(normalizedImageKey(image))) continue;
      usedServiceImages?.add(normalizedImageKey(image));
      return image;
    }
    return '';
  };

  if (titlePattern) {
    return firstUnused([
      imageMatches(currentImage, titlePattern) ? currentImage : '',
      ...imagesMatching(serviceImages, titlePattern),
    ]);
  }

  const specificServiceImage = imagesMatching([currentImage], /groom|brush|medicine|medical|vet|transport|airport|flea|worm/i)[0];
  return firstUnused([specificServiceImage]);
}

function serviceTitlePattern(title: string): RegExp | null {
  if (/groom|brush|matting/i.test(title)) return /groom|brush|maincoone|matting/i;
  if (/medicine|medication|medical|vet/i.test(title)) return /medicine|medical|vet|stethoscope/i;
  if (/transport|pickup|drop.?off|airport/i.test(title)) return /transport|pickup|airport|vehicle/i;
  if (/flea|worm/i.test(title)) return /flea|worm/i;
  return null;
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

function uniqueImagesByKey(images: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const image of images) {
    if (!image) continue;
    const key = normalizedImageKey(image);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(image);
  }
  return result;
}

function isUsableGalleryImage(image: string, logoImage?: string): boolean {
  const normalized = image.split('?')[0].toLowerCase();
  const logoKey = logoImage?.split('?')[0].toLowerCase();
  if (!normalized) return false;
  if (logoKey && normalized === logoKey) return false;
  const decoded = decodeURIComponent(normalized);
  return !/logo|favicon|apple-touch-icon|icon|avatar|profile|placeholder|silhouette|black.?cat|catstays|\/cat(?:[-_][a-z0-9]+)?\.png$/i.test(decoded);
}

function ensureImageCount(images: string[], heroImage: string): string[] {
  const importedImages = uniqueStrings([...images, heroImage]);
  if (importedImages.length) return importedImages;

  const fallback = [
    heroImage,
    'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1573865526739-10c1de0e0ef2?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&h=900&fit=crop',
  ];
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
  ]
    .filter((feature) => feature.title || feature.text)
    .slice(0, 4)
    .map((feature, index) => ({
      title: feature.title || ['Fully Licensed', 'Premium Care', 'Daily Enrichment', 'Photo Updates'][index],
      text: feature.text || 'A calm, professional cattery experience.',
    }));
}

function ensureSuiteCount(rooms: any[], images: string[], fallbackPrice?: string, usedImages?: Set<string>) {
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
    const roomImageCandidates = suiteImageCandidates(title, roomImage, images);
    return {
      image: usedImages
        ? pickUniqueImage(usedImages, [...roomImageCandidates, images[index + 1], images[index], images[0]], images)
        : imageFrom(...roomImageCandidates, images[index + 1], images[index], images[0]),
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

function suiteImageCandidates(title: string, currentImage: string, images: string[]) {
  const semanticPattern = suiteTitlePattern(title);
  const candidates = semanticPattern
    ? [
        imageMatches(currentImage, semanticPattern) ? currentImage : '',
        ...imagesMatching(images, semanticPattern),
      ]
    : [isUsableGalleryImage(currentImage) ? currentImage : ''];

  return uniqueImagesByKey(candidates.filter(Boolean));
}

function suiteTitlePattern(title: string): RegExp | null {
  if (/private/i.test(title)) return /private/i;
  if (/indoor/i.test(title)) return /indoor/i;
  if (/communal|shared/i.test(title)) return /communal|shared/i;
  return null;
}

function ensureTestimonials(
  testimonials: any[],
  businessName: string,
  images: string[],
  heroImage: string,
  testimonialImage?: unknown,
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

  return [
    {
      quote: "I built this because I needed it, and now I wouldn't run my cattery without it.",
      author: 'Vanessa',
      image: imageFrom(testimonialImage, images[3], heroImage),
      location: businessName,
    },
  ];
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
