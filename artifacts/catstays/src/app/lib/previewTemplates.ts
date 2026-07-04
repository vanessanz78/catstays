import {
  buildPreviewDataFromScrape,
  fallbackDeloraineScrape,
  type CatterySiteContentIndexItem,
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
  contentIndex: CatterySiteContentIndexItem[];
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
    showPrimaryButton: boolean;
    showSecondaryButton: boolean;
    imagePosition: string;
    imagePositionX: number;
    imagePositionY: number;
    imageScale: number;
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
    faqs: string;
    contact: string;
  };
  sectionEyebrows: {
    services: string;
    reviews: string;
    faqs: string;
  };
  features: Array<{
    title: string;
    text: string;
    icon?: string;
  }>;
  whyChoose: {
    eyebrow: string;
    title: string;
    text: string;
  };
  careApproach: {
    eyebrow: string;
    title: string;
    text: string;
    items: Array<{
      title: string;
      text: string;
      icon?: string;
    }>;
  };
  facilities: {
    eyebrow: string;
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
    icon?: string;
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
    rating: number;
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
  customSections: Array<{
    id: string;
    title: string;
    text: string;
    items: Array<{
      title: string;
      text: string;
    }>;
    images: string[];
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
    facebook: string;
    instagram: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  };
  contentLibrary: CatterySiteContentLibrary;
  contentIndex: CatterySiteContentIndexItem[];
}

export const previewImportTableStorageKey = 'catstays_preview_import_table';

export const previewTemplateCards: PreviewTemplateOption[] = [
  {
    id: 'original',
    name: 'Original',
    description: 'The scraped website exactly as it appears now',
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
    contentLibrary: normalizedPreviewData.siteContentLibrary ?? emptyContentLibrary(sourceUrl, sourceHost, businessName),
    contentIndex: normalizedPreviewData.siteContentIndex ?? [],
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
  const importedAddress = record.contact.address || normalized.address || currentData.address || '';
  const selectedTemplate = normalizePreviewTemplateId(templateId);
  const shouldPreferImportedCollections = !currentData.importComplete && !currentData.previewImportRecordId;
  const updatedRecord: PreviewImportRecord = {
    ...record,
    status: 'in_progress',
    selectedTemplate,
  };
  savePreviewImportRecord(updatedRecord);

  return withOnboardingCollections({
    ...normalized,
    ...currentData,
    ...templateStyle(selectedTemplate),
    __preferImportedCollections: shouldPreferImportedCollections,
    selectedTemplate,
    previewImportRecord: updatedRecord,
    previewImportRecordId: record.id,
    previewRecordStatus: 'in_progress',
    importComplete: true,
    importSourceUrl: record.source.url,
    sourceUrl: record.source.url,
    sourceHost: record.source.host,
    businessName: record.identity.businessName,
    location: importedAddress || record.identity.location,
    subdomain: currentData.subdomain || record.identity.subdomain,
    phone: record.contact.phone || currentData.phone,
    email: record.contact.email || currentData.email,
    address: importedAddress,
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
  const contentIndex =
    record?.contentIndex ??
    normalized.siteContentIndex ??
    data.siteContentIndex ??
    [];
  const libraryRooms = libraryItems(contentLibrary, 'rooms');
  const libraryServices = libraryItems(contentLibrary, 'services');
  const libraryReviews = libraryItems(contentLibrary, 'reviews');
  const libraryFaqs = libraryItems(contentLibrary, 'faqs');
  const libraryGalleryImages = libraryImages(contentLibrary, 'gallery');
  const heroBlock = libraryBlock(contentLibrary, 'hero');
  const heroLinks = heroBlock?.links ?? [];
  const whyChooseBlock = libraryBlock(contentLibrary, 'why-choose-us');
  const facilitiesBlock = libraryBlock(contentLibrary, 'facilities');
  const dailyCareBlock = libraryBlock(contentLibrary, 'daily-care');
  const ownerBlock = libraryBlock(contentLibrary, 'owner-story');
  const locationBlock = libraryBlock(contentLibrary, 'location');
  const sourceSections = sourceContentSections(contentLibrary);
  const logoImage = stringFrom(data.logoImage, normalizedRecord.logoImage, record?.media.logoImage, data.logo);
  const heroImage = heroImageFrom(
    logoImage,
    data.heroImageOwned ? data.heroImage : '',
    normalized.heroImage,
    record?.media.heroImage,
    heroBlock?.images?.[0]?.url,
    record?.media.galleryImages?.[0]?.url,
    record?.media.images?.[0],
    data.heroImage,
  );
  const editedGalleryImages = Array.isArray(data.galleryImages) ? data.galleryImages : undefined;
  const galleryImages = uniqueStrings([
    ...(editedGalleryImages ?? [
      ...(record?.media.galleryImages ?? []).map((image) => image.url),
      ...libraryGalleryImages.map((image) => image.url),
      ...(record?.media.images ?? []),
    ]),
    data.facilitiesImage,
    data.aboutImage,
    data.ownerData?.image,
    heroImage,
  ]).filter((image) => isUsableGalleryImage(image, logoImage));
  const sectionImages = ensureImageCount(galleryImages, heroImage);
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
    normalizeEditableReviews(
      (
        editedTestimonials ??
        normalizedRecord.testimonialsData?.testimonials ??
        data.testimonialsData?.testimonials ??
        libraryItemsToReviews(libraryReviews) ??
        []
      ).filter(Boolean),
    ),
    businessName,
    stringFrom(record?.source.host, normalized.sourceHost, data.sourceHost),
  );
  const editedFaqs = Array.isArray(data.faqs) ? data.faqs : undefined;
  const faqs = normalizeEditableFaqs(
    (editedFaqs ?? normalizedRecord.faqData?.faqs ?? data.faqData?.faqs ?? record?.faqs ?? libraryItemsToFaqs(libraryFaqs) ?? []).filter(Boolean),
  );
  const ownerData = data.ownerData ?? normalizedRecord.ownerData ?? {};
  const ownerTitle = stringFrom(ownerData.title, ownerBlock?.title, `Meet the people behind ${businessName}`);
  const ownerText = contentStringFrom(ownerData.text, ownerData.description, ownerBlock?.text);
  const ownerImage = uniqueStrings([
    ownerData.image,
    normalizedRecord.ownerData?.image,
    ownerBlock?.images?.[0]?.url,
  ]).filter((image) => isUsableGalleryImage(image, logoImage))[0] || '';
  const commitmentData = data.commitmentData ?? normalizedRecord.commitmentData ?? {};
  const locationData = data.locationData ?? data.contactData?.locationDetails ?? normalizedRecord.locationData ?? normalizedRecord.contactData?.locationDetails ?? {};
  const socialLinks = {
    ...((normalizedRecord.socialLinks ?? normalizedRecord.contactData?.socialLinks ?? {}) as Record<string, unknown>),
    ...((data.socialLinks ?? {}) as Record<string, unknown>),
  };
  const hours = stringFrom(
    data.contactData?.hours,
    data.hours,
    normalizedRecord.hours,
    normalizedRecord.contactData?.hours,
    record?.normalizedPreviewData?.hours,
    'By appointment',
  );
  const primaryDescription = contentStringFrom(
    data.aboutText,
    normalized.aboutText,
    record?.content.aboutText,
    record?.content.description,
    'A calm, caring cat boarding experience designed around comfort, routine, and reassurance.',
  );
  const mappedHighlights = highlights.map((feature: any) => ({
    title: contentStringFrom(feature.title, feature.name),
    text: contentStringFrom(feature.description, feature.text),
    icon: stringFrom(feature.icon),
  }));
  const mappedServices = services.map((service: any) => ({
    title: contentStringFrom(service.title, service.name),
    text: contentStringFrom(service.description, service.text),
    icon: stringFrom(service.icon),
  }));
  const featureItems = editedHighlights
    ? mappedHighlights.filter((feature) => feature.title || feature.text).slice(0, 8)
    : ensureFeatureCount(mappedHighlights, mappedServices);
  const whyChooseItems = editedHighlights
    ? featureItems
    : ensureFeatureCount(
        (whyChooseBlock?.items?.length ? whyChooseBlock.items : featureItems).map((item: any) => ({
          title: contentStringFrom(item.title, item.name),
          text: contentStringFrom(item.text, item.description),
          icon: stringFrom(item.icon),
        })),
        featureItems,
      ).slice(0, 8);
  const editedFacilityItems = Array.isArray(data.facilityFeatures) ? data.facilityFeatures : undefined;
  const mappedFacilityItems = editedFacilityItems
    ? editedFacilityItems.map((item: any) => ({
        title: contentStringFrom(item.title, item.name),
        text: contentStringFrom(item.description, item.text),
        icon: stringFrom(item.icon),
      }))
    : [
        ...(facilitiesBlock?.items ?? []).map((item: any) => ({
          title: contentStringFrom(item.title, item.name),
          text: contentStringFrom(item.text, item.description),
          icon: stringFrom(item.icon),
        })),
        dailyCareBlock
          ? {
              title: contentStringFrom(dailyCareBlock.title, 'Daily Care Routine'),
              text: contentStringFrom(dailyCareBlock.text),
              icon: 'Clock',
            }
          : null,
      ];
  const facilityItems = mappedFacilityItems
    .filter((item) => Boolean(item?.title && item?.text))
    .map((item) => ({ title: item!.title, text: item!.text, icon: item!.icon }))
    .slice(0, 6);
  const aboutImage = pickUniqueImage(
    usedImages,
    [
      data.aboutImage,
      normalizedRecord.aboutImage,
      normalizedRecord.aboutData?.image,
      sectionImages.find((image) => image !== heroImage),
    ],
    sectionImages,
    logoImage,
  );
  const facilityImage = pickUniqueImage(
    usedImages,
    [
      data.facilitiesImage,
      facilitiesBlock?.images?.[0]?.url,
      normalizedRecord.facilitiesData?.facilitiesImage,
      sectionImages[2],
    ],
    sectionImages,
    logoImage,
  );
  const virtualTourUrl = embeddableVirtualTourUrl(
    stringFrom(locationData.virtualTourUrl, normalized.virtualTourUrl, data.virtualTourUrl, data.contactData?.virtualTourUrl),
    contentLibrary.sourceHost,
  );
  const heroPrimaryButton = editableString(data.heroPrimaryCtaText, normalizedRecord.heroPrimaryCtaText, heroLinks[0]?.label, 'Discover Our Suites');
  const heroPrimaryHref = editableString(data.heroPrimaryCtaHref, normalizedRecord.heroPrimaryCtaHref, heroLinks[0]?.url, '#suites');
  const heroSecondaryButton = editableString(data.heroSecondaryCtaText, normalizedRecord.heroSecondaryCtaText, heroLinks[1]?.label, 'Our Care Approach');
  const heroSecondaryHref = editableString(data.heroSecondaryCtaHref, normalizedRecord.heroSecondaryCtaHref, heroLinks[1]?.url, '#care');
  const heroImagePositionX = clampNumber(data.heroImageObjectPositionX, 0, 100, 50);
  const heroImagePositionY = clampNumber(data.heroImageObjectPositionY, 0, 100, 50);
  const heroImageScale = clampNumber(data.heroImageScale, 100, 180, 100);
  const whyChooseTitle = contentStringFrom(data.whyChooseUsHeading, whyChooseBlock?.title, `Why choose ${businessName}`);
  const whyChooseText = contentStringFrom(data.whyChooseUsText, whyChooseBlock?.text, primaryDescription);
  const careApproachTitle = contentStringFrom(data.careApproachHeading, normalizedRecord.careApproachHeading, data.whyChooseUsHeading, whyChooseBlock?.title, `Why choose ${businessName}`);
  const careApproachText = contentStringFrom(data.careApproachText, normalizedRecord.careApproachText, data.whyChooseUsText, whyChooseBlock?.text, primaryDescription);
  const facilitiesTitle = contentStringFrom(data.facilitiesHeading, facilitiesBlock?.title, 'Our Facilities');
  const facilitiesText = contentStringFrom(data.facilitiesText, facilitiesBlock?.text, 'Comfortable, secure spaces designed around daily cat care, quiet routines, and peace of mind.');

  const customSections = (Array.isArray(data.customSections) && data.customSections.length ? data.customSections : sourceSections)
    .map((section: any) => ({
      id: slugify(stringFrom(section.id, section.title, section.heading, 'source-section')),
      title: contentStringFrom(section.title, section.heading),
      text: contentStringFrom(section.text, section.description, section.content),
      items: Array.isArray(section.items)
        ? section.items
            .map((item: any) => ({
              title: contentStringFrom(item.title, item.name),
              text: contentStringFrom(item.text, item.description, item.answer),
            }))
            .filter((item: any) => item.title || item.text)
        : [],
      images: uniqueStrings([
        section.media,
        ...(Array.isArray(section.images) ? section.images.map((image: any) => stringFrom(image.url, image.image, image)) : []),
      ])
        .filter((image: string) => isUsableGalleryImage(image, logoImage))
        .slice(0, 6),
    }))
    .filter((section) => section.title && section.text)
    .slice(0, 8);
  const footerLinks = normalizeFooterLinks(
    Array.isArray(data.footerLinks) && data.footerLinks.length
      ? data.footerLinks
      : defaultFooterLinks({
          hasAbout: Boolean(primaryDescription || aboutImage),
          hasCare: Boolean(careApproachTitle || whyChooseItems.length),
          hasFacilities: Boolean(facilitiesTitle || facilityImage),
          hasSuites: Boolean(rooms.length || (editedRooms?.length ?? 0)),
          hasServices: Boolean(services.length),
          hasGallery: Boolean(galleryImages.length),
          hasReviews: Boolean(testimonials.some((review) => review.showOnWebsite !== false)),
          hasFaqs: Boolean(faqs.some((faq) => faq.showOnWebsite !== false)),
          hasLocation: Boolean(locationData || data.address || normalized.address),
          hasVirtualTour: Boolean(virtualTourUrl),
          customSections,
        }),
  );

  return {
    business: {
      name: businessName,
      tagline: stringFrom(data.tagline, 'Luxury holiday retreat for cats'),
      location: stringFrom(data.location, normalized.location, record?.identity.location),
    },
    hero: {
      eyebrow: editableString(data.heroEyebrow, normalizedRecord.heroEyebrow, 'A home away from home'),
      heading: contentStringFrom(data.heroHeading, normalized.heroHeading, record?.content.heroHeading, `Welcome to ${businessName}`),
      text: contentStringFrom(data.heroSubheading, normalized.heroSubheading, record?.content.heroSubheading, primaryDescription),
      image: heroImage,
      button: stringFrom(data.ctaText, heroPrimaryButton, heroLinks[0]?.label, 'Book Now'),
      primaryButton: heroPrimaryButton,
      primaryHref: heroPrimaryHref,
      secondaryButton: heroSecondaryButton,
      secondaryHref: heroSecondaryHref,
      showPrimaryButton: Boolean(heroPrimaryButton && heroPrimaryHref),
      showSecondaryButton: Boolean(heroSecondaryButton && heroSecondaryHref),
      imagePosition: `${heroImagePositionX}% ${heroImagePositionY}%`,
      imagePositionX: heroImagePositionX,
      imagePositionY: heroImagePositionY,
      imageScale: heroImageScale,
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
      care: careApproachTitle,
      facilities: facilitiesTitle,
      suites: contentStringFrom(data.suitesHeading, 'Beautiful suites for every kind of cat'),
      services: contentStringFrom(data.additionalServicesHeading, 'Extra care when your cat needs it'),
      gallery: contentStringFrom(data.galleryHeading, 'A closer look at the stay'),
      reviews: contentStringFrom(data.testimonialsHeading, 'Trusted by cat families'),
      faqs: contentStringFrom(data.faqHeading, 'Frequently Asked Questions'),
      contact: contentStringFrom(data.contactHeading, 'Send us a message'),
    },
    sectionEyebrows: {
      services: stringFrom(data.additionalServicesEyebrow, normalizedRecord.additionalServicesEyebrow, normalizedRecord.servicesData?.servicesEyebrow, 'Additional Services'),
      reviews: stringFrom(data.testimonialsEyebrow, normalizedRecord.testimonialsEyebrow, normalizedRecord.testimonialsData?.testimonialsEyebrow, 'Reviews'),
      faqs: stringFrom(data.faqEyebrow, normalizedRecord.faqEyebrow, normalizedRecord.faqData?.faqEyebrow, 'Questions and answers'),
    },
    features: featureItems,
    whyChoose: {
      eyebrow: contentStringFrom(data.whyChooseEyebrow, normalizedRecord.whyChooseEyebrow, normalizedRecord.whyChooseUsData?.whyChooseEyebrow, 'Why choose us'),
      title: whyChooseTitle,
      text: whyChooseText,
    },
    careApproach: {
      eyebrow: contentStringFrom(data.careApproachEyebrow, normalizedRecord.careApproachEyebrow, normalizedRecord.whyChooseUsData?.careApproachEyebrow, 'Care Approach'),
      title: careApproachTitle,
      text: careApproachText,
      items: whyChooseItems,
    },
    facilities: {
      eyebrow: contentStringFrom(data.facilitiesEyebrow, normalizedRecord.facilitiesEyebrow, normalizedRecord.facilitiesData?.facilitiesEyebrow, 'Premium accommodation'),
      title: facilitiesTitle,
      text: facilitiesText,
      image: facilityImage,
      items: facilityItems,
    },
    services: services.map((service: any, index: number) => ({
      image: pickUniqueImage(
        usedImages,
        [service.image, sectionImages[index + 3], sectionImages[index]],
        sectionImages,
        logoImage,
      ),
      title: contentStringFrom(service.title, service.name, `Care service ${index + 1}`),
      text: contentStringFrom(service.description, service.text),
      price: stringFrom(service.price),
      icon: stringFrom(service.icon),
    })).filter((service) => service.title || service.text || service.price),
    about: {
      title: contentStringFrom(data.aboutHeading, normalized.aboutHeading, record?.content.aboutHeading, `About ${businessName}`),
      text: primaryDescription,
      image: aboutImage,
    },
    gallery: galleryImages.slice(0, 12).map((image, index) => ({
      image,
      caption: stringFrom(record?.media.galleryImages?.[index]?.caption, `${businessName} photo ${index + 1}`),
    })),
    suites: editedRooms && editedRooms.length === 0 ? [] : ensureSuiteCount(rooms, sectionImages, data.pricePerNight || normalized.pricePerNight, usedImages, logoImage),
    testimonials: ensureTestimonials(testimonials.filter((review) => review.showOnWebsite !== false), businessName, sectionImages, heroImage, data.testimonialImage, logoImage),
    faqs: faqs
      .filter((faq) => faq.showOnWebsite !== false)
      .map((faq: any) => ({
        question: contentStringFrom(faq.question),
        answer: contentStringFrom(faq.answer),
      }))
      .filter((faq) => faq.question && faq.answer),
    owner: {
      title: ownerTitle,
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
    customSections,
    booking: {
      text: stringFrom(data.bookingText, "Check availability and secure your cat's holiday today."),
      bannerText: stringFrom(data.bookingBannerText, "Check availability and secure your cat's stay today."),
      primaryCta: stringFrom(data.primaryCta, 'Check Availability'),
    },
    footer: {
      about: contentStringFrom(data.footerAbout, primaryDescription),
      phone: stringFrom(data.phone, normalized.phone, record?.contact.phone),
      email: stringFrom(data.email, normalized.email, record?.contact.email),
      address: stringFrom(data.address, normalized.address, record?.contact.address),
      hours,
      facebook: stringFrom(data.facebookUrl, socialLinks.facebook),
      instagram: stringFrom(data.instagramUrl, socialLinks.instagram),
      links: footerLinks,
    },
    contentLibrary,
    contentIndex,
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

function sourceContentSections(library: CatterySiteContentLibrary) {
  const coreCategories = new Set([
    'hero',
    'why-choose-us',
    'facilities',
    'daily-care',
    'rooms',
    'services',
    'gallery',
    'reviews',
    'faqs',
    'owner-story',
    'commitment',
    'location',
    'contact',
    'social',
  ]);

  return library.blocks
    .filter((block) => !coreCategories.has(block.category))
    .map((block) => ({
      id: block.id,
      title: contentStringFrom(block.title),
      heading: contentStringFrom(block.title),
      text: contentStringFrom(block.text),
      description: contentStringFrom(block.text),
      items: (block.items ?? []).map((item) => ({
        title: contentStringFrom(item.title),
        text: contentStringFrom(item.text, item.answer),
      })),
      images: (block.images ?? []).map((image) => image.url).filter(Boolean),
      media: (block.images ?? [])[0]?.url || '',
    }))
    .filter((block) => block.title && block.text);
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
    icon: item.icon,
  }));
}

function normalizeEditableServices(items: unknown): Array<{ title: string; description: string; price: string; image: string; icon: string }> {
  if (!Array.isArray(items)) return [];
  return items
    .map((item: any) => ({
      title: contentStringFrom(item?.title, item?.name),
      description: contentStringFrom(item?.description, item?.text),
      price: stringFrom(item?.price),
      image: stringFrom(item?.image),
      icon: stringFrom(item?.icon),
    }))
    .filter((item) => item.title || item.description || item.price || item.image);
}

function normalizeEditableReviews(items: unknown): Array<{ name: string; text: string; rating: number; location: string; image: string; showOnWebsite: boolean }> {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  return items
    .map((item: any) => {
      const name = contentStringFrom(item?.name, item?.author, item?.customer, item?.title);
      const text = contentStringFrom(item?.text, item?.quote, item?.description);
      const rating = clampNumber(item?.rating, 1, 5, 5);
      const location = contentStringFrom(item?.location, item?.meta);
      const image = stringFrom(item?.image);
      const showOnWebsite = item?.showOnWebsite !== false && item?.hiddenOnWebsite !== true && item?.websiteHidden !== true;
      return { name, text, rating, location, image, showOnWebsite };
    })
    .filter((item) => item.name || item.text)
    .filter((item) => {
      const key = `${item.name.toLowerCase()}-${item.text.toLowerCase().slice(0, 100)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeEditableFaqs(items: unknown): Array<{ question: string; answer: string; showOnWebsite: boolean }> {
  if (!Array.isArray(items)) return [];
  const seenQuestions = new Set<string>();
  const seenAnswers = new Set<string>();
  return items
    .map((item: any) => {
      const question = contentStringFrom(item?.question, item?.title);
      const answer = contentStringFrom(item?.answer, item?.text, item?.description);
      const showOnWebsite = item?.showOnWebsite !== false && item?.hiddenOnWebsite !== true && item?.websiteHidden !== true;
      return { question, answer, showOnWebsite };
    })
    .filter((item) => item.question && item.answer && !looksLikeNavigationCopy(item.answer))
    .filter((item) => {
      const questionKey = item.question.toLowerCase();
      const answerKey = item.answer.toLowerCase();
      if (seenQuestions.has(questionKey)) return false;
      if (answerKey.length > 60 && seenAnswers.has(answerKey)) return false;
      seenQuestions.add(questionKey);
      if (answerKey.length > 60) seenAnswers.add(answerKey);
      return true;
    });
}

function normalizeFooterLinks(items: unknown): Array<{ label: string; href: string }> {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  return items
    .map((item: any) => ({
      label: contentStringFrom(item?.label, item?.title, item?.name),
      href: normalizeFooterHref(stringFrom(item?.href, item?.anchor, item?.url)),
    }))
    .filter((item) => item.label && item.href)
    .filter((item) => {
      const key = `${item.label.toLowerCase()}-${item.href.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 16);
}

function normalizeFooterHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('#')) return trimmed;
  if (/^[a-z0-9-]+$/i.test(trimmed)) return `#${trimmed}`;
  return '';
}

function defaultFooterLinks({
  hasAbout,
  hasCare,
  hasFacilities,
  hasSuites,
  hasServices,
  hasGallery,
  hasReviews,
  hasFaqs,
  hasLocation,
  hasVirtualTour,
  customSections,
}: {
  hasAbout: boolean;
  hasCare: boolean;
  hasFacilities: boolean;
  hasSuites: boolean;
  hasServices: boolean;
  hasGallery: boolean;
  hasReviews: boolean;
  hasFaqs: boolean;
  hasLocation: boolean;
  hasVirtualTour: boolean;
  customSections: Array<{ id: string; title: string }>;
}) {
  return [
    { label: 'Home', href: '#home' },
    hasAbout ? { label: 'About', href: '#about' } : null,
    hasCare ? { label: 'Care', href: '#care' } : null,
    hasFacilities ? { label: 'Facilities', href: '#facilities' } : null,
    hasSuites ? { label: 'Suites', href: '#suites' } : null,
    hasServices ? { label: 'Extra Care', href: '#services' } : null,
    hasGallery ? { label: 'Gallery', href: '#gallery' } : null,
    hasReviews ? { label: 'Reviews', href: '#reviews' } : null,
    ...customSections.map((section) => ({ label: section.title, href: `#${section.id}` })),
    hasFaqs ? { label: 'FAQs', href: '#faqs' } : null,
    hasLocation ? { label: 'Location', href: '#location' } : null,
    hasVirtualTour ? { label: 'Virtual Tour', href: '#virtual-tour' } : null,
    { label: 'Contact', href: '#contact' },
  ].filter(Boolean);
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
      ? contentStringFrom(...importedSources, cleanData[key], fallback[key])
      : contentStringFrom(cleanData[key], ...importedSources, fallback[key])
  );

  const editableTextFrom = (key: string, ...importedSources: unknown[]) => {
    if (!preferImportedCollections && typeof cleanData[key] === 'string') return cleanImportedCopy(cleanData[key]);

    const importedValue = contentStringFrom(...importedSources);
    if (preferImportedCollections && importedValue) return importedValue;
    if (typeof cleanData[key] === 'string') return cleanImportedCopy(cleanData[key]);
    return contentStringFrom(cleanData[key], ...importedSources, fallback[key]);
  };

  const imageFieldFrom = (key: string, ...importedSources: unknown[]) => (
    preferImportedCollections
      ? stringFrom(...importedSources, cleanData[key], fallback[key])
      : stringFrom(cleanData[key], ...importedSources, fallback[key])
  );

  const mapItemsToFeatures = (items: any[] = []) => items.map((item) => ({
    title: contentStringFrom(item.title, item.name),
    description: contentStringFrom(item.description, item.text),
    icon: stringFrom(item.icon),
  })).filter((item) => item.title || item.description);

  const mapItemsToSuites = (items: any[] = []) => items.map((item) => ({
    name: contentStringFrom(item.name, item.title),
    description: contentStringFrom(item.description, item.text),
    price: stringFrom(item.price),
    image: stringFrom(item.image),
    amenities: Array.isArray(item.amenities) ? item.amenities : Array.isArray(item.features) ? item.features : [],
  })).filter((item) => item.name || item.description || item.image);

  const mapItemsToServices = (items: any[] = []) => items.map((item) => ({
    title: contentStringFrom(item.title, item.name),
    description: contentStringFrom(item.description, item.text),
    price: stringFrom(item.price),
    image: stringFrom(item.image),
    icon: stringFrom(item.icon),
  })).filter((item) => item.title || item.description || item.image);

  const mapItemsToReviews = (items: any[] = []) => items.map((item) => ({
    name: contentStringFrom(item.name, item.title, item.author),
    text: contentStringFrom(item.text, item.quote, item.description),
    rating: typeof item.rating === 'number' ? item.rating : 5,
    location: contentStringFrom(item.location, item.meta),
  })).filter((item) => item.name || item.text);

  const mapItemsToFaqs = (items: any[] = []) => items.map((item) => ({
    question: contentStringFrom(item.question, item.title),
    answer: contentStringFrom(item.answer, item.text, item.description),
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
    siteContentIndex: record?.contentIndex ?? normalized.siteContentIndex ?? cleanData.siteContentIndex ?? fallback.siteContentIndex ?? [],
    logoImage: imageFieldFrom('logoImage', normalized.logoImage, record?.media.logoImage),
    heroEyebrow: editableTextFrom('heroEyebrow', normalized.heroEyebrow, 'A home away from home'),
    heroPrimaryCtaText: editableTextFrom('heroPrimaryCtaText', heroLinks[0]?.label, cleanData.ctaText, 'Discover Our Suites'),
    heroPrimaryCtaHref: editableTextFrom('heroPrimaryCtaHref', heroLinks[0]?.url, '#suites'),
    heroSecondaryCtaText: editableTextFrom('heroSecondaryCtaText', heroLinks[1]?.label, 'Our Care Approach'),
    heroSecondaryCtaHref: editableTextFrom('heroSecondaryCtaHref', heroLinks[1]?.url, '#care'),
    whyChooseEyebrow: textFrom('whyChooseEyebrow', normalized.whyChooseEyebrow, normalized.whyChooseUsData?.whyChooseEyebrow),
    whyChooseUsHeading: textFrom('whyChooseUsHeading', normalized.whyChooseUsData?.whyChooseUsHeading, normalized.whyChooseUsData?.heading, block('why-choose-us')?.title),
    whyChooseUsText: textFrom('whyChooseUsText', normalized.whyChooseUsData?.whyChooseUsText, normalized.whyChooseUsData?.text, block('why-choose-us')?.text),
    careApproachEyebrow: textFrom('careApproachEyebrow', normalized.careApproachEyebrow, normalized.whyChooseUsData?.careApproachEyebrow),
    careApproachHeading: textFrom('careApproachHeading', normalized.careApproachHeading, normalized.whyChooseUsData?.careApproachHeading, normalized.whyChooseUsData?.whyChooseUsHeading, block('why-choose-us')?.title),
    careApproachText: textFrom('careApproachText', normalized.careApproachText, normalized.whyChooseUsData?.careApproachText, normalized.whyChooseUsData?.whyChooseUsText, normalized.whyChooseUsData?.text, block('why-choose-us')?.text),
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
    facilitiesEyebrow: textFrom('facilitiesEyebrow', normalized.facilitiesEyebrow, normalized.facilitiesData?.facilitiesEyebrow),
    facilitiesText: textFrom('facilitiesText', normalized.facilitiesData?.facilitiesText, normalized.facilitiesData?.text, block('facilities')?.text),
    facilitiesImage: imageFieldFrom('facilitiesImage', normalized.facilitiesData?.facilitiesImage, normalized.facilitiesData?.image, blockImages('facilities')[0]?.url),
    suitesHeading: textFrom('suitesHeading', normalized.suitesData?.suitesHeading, normalized.suitesData?.heading, block('rooms')?.title),
    additionalServicesEyebrow: textFrom('additionalServicesEyebrow', normalized.servicesData?.servicesEyebrow, normalized.servicesData?.eyebrow, block('services')?.eyebrow),
    additionalServicesHeading: textFrom('additionalServicesHeading', normalized.servicesData?.servicesHeading, normalized.servicesData?.heading, block('services')?.title),
    galleryHeading: textFrom('galleryHeading', normalized.galleryData?.galleryHeading, normalized.galleryData?.heading, block('gallery')?.title),
    testimonialsEyebrow: textFrom('testimonialsEyebrow', normalized.testimonialsData?.testimonialsEyebrow, normalized.testimonialsData?.eyebrow, block('reviews')?.eyebrow),
    testimonialsHeading: textFrom('testimonialsHeading', normalized.testimonialsData?.testimonialsHeading, normalized.testimonialsData?.heading, block('reviews')?.title),
    faqEyebrow: textFrom('faqEyebrow', normalized.faqData?.faqEyebrow, normalized.faqData?.eyebrow, block('faqs')?.eyebrow),
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
    additionalServices: normalizeEditableServices(arrayFrom(
      'additionalServices',
      normalizeEditableServices(normalized.servicesData?.services),
      mapItemsToServices(blockItems('services')),
      mapItemsToServices(record?.services ?? []),
    )),
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
    testimonials: normalizeEditableReviews(arrayFrom(
      'testimonials',
      normalized.testimonialsData?.testimonials,
      mapItemsToReviews(blockItems('reviews')),
      mapItemsToReviews(record?.contentLibrary?.blocks.find((candidate) => candidate.category === 'reviews')?.items ?? []),
    )),
    faqs: normalizeEditableFaqs(arrayFrom(
      'faqs',
      normalized.faqData?.faqs,
      mapItemsToFaqs(blockItems('faqs')),
      record?.faqs,
    )),
    footerLinks: normalizeFooterLinks(arrayFrom('footerLinks', normalized.footerLinks)),
    customSections: arrayFrom('customSections', sourceContentSections(contentLibrary)),
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

function contentStringFrom(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    if (typeof value !== 'string') continue;
    const cleaned = cleanImportedCopy(value);
    if (cleaned) return cleaned;
  }
  return '';
}

function editableString(value: unknown, ...fallbackValues: unknown[]): string {
  if (typeof value === 'string') return value.trim();
  return stringFrom(...fallbackValues);
}

function cleanImportedCopy(value: string): string {
  const withoutMenuTrails = stripTopOfPageMenuTrail(value)
    .replace(/\btop of page\b(?:[\s,;/|&-]+(?:home|about|accomodation|accommodation|homestay|fees|feline|health|care|hyperbaric|oxygen|pulsed|electric|magnetic|field|therapy|pemf|hbot|integrative|gallery|professional|cat|grooming|rates|more|contact|suites|facilities|services|booking|book|faq|q|a|use|tab|navigate|through|menu|items)){3,}/gi, ' ')
    .replace(/\bHome\s+About\s+(?:Accomodation|Accommodation)\b[\s\S]{0,500}?\b(?:More|Contact|Grooming Rates)\b/gi, ' ')
    .replace(/\bUse tab to navigate through the menu items\.?/gi, ' ')
    .replace(/\bbottom of page\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const lower = withoutMenuTrails.toLowerCase();
  if (!withoutMenuTrails || /^(home|about|contact|gallery|more|top of page|bottom of page)$/i.test(withoutMenuTrails)) return '';
  if (/^top of page\b/.test(lower)) return '';
  if (looksLikeNavigationCopy(withoutMenuTrails)) return '';
  return withoutMenuTrails;
}

function stripTopOfPageMenuTrail(value: string): string {
  return value.replace(/\btop of page\b[\s\S]{0,650}/gi, (match) => {
    const words = match.toLowerCase().split(/[^a-z]+/).filter(Boolean);
    const navWords = new Set([
      'top',
      'page',
      'home',
      'about',
      'accomodation',
      'accommodation',
      'homestay',
      'fees',
      'feline',
      'health',
      'care',
      'hyperbaric',
      'oxygen',
      'pulsed',
      'electric',
      'magnetic',
      'field',
      'therapy',
      'pemf',
      'hbot',
      'integrative',
      'gallery',
      'professional',
      'cat',
      'grooming',
      'rates',
      'more',
      'contact',
      'booking',
      'book',
      'faq',
      'use',
      'tab',
      'navigate',
      'menu',
      'items',
    ]);
    const navCount = words.filter((word) => navWords.has(word)).length;
    return navCount >= 8 ? ' ' : match;
  });
}

function looksLikeNavigationCopy(value: string): boolean {
  const words = value.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  if (words.length < 6) return false;
  const navWords = new Set([
    'top',
    'page',
    'home',
    'about',
    'accomodation',
    'accommodation',
    'homestay',
    'fees',
    'feline',
    'health',
    'care',
    'hyperbaric',
    'oxygen',
    'pulsed',
    'electric',
    'magnetic',
    'field',
    'therapy',
    'pemf',
    'hbot',
    'integrative',
    'gallery',
    'professional',
    'cat',
    'grooming',
    'rates',
    'more',
    'contact',
    'booking',
    'book',
    'faq',
  ]);
  const navCount = words.filter((word) => navWords.has(word)).length;
  return navCount >= 8 && navCount / words.length > 0.65;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function imageFrom(...values: unknown[]): string {
  for (const value of values) {
    const image = stringFrom(value);
    if (/^https?:\/\//i.test(image) || /^data:image\//i.test(image)) return image;
  }
  return '';
}

function heroImageFrom(logoImage: string, ...values: unknown[]): string {
  for (const value of values) {
    const image = imageFrom(value);
    if (image && isUsableGalleryImage(image, logoImage)) return image;
  }
  return '';
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

function isUsableGalleryImage(image: string, logoImage?: string): boolean {
  const normalized = image.split('?')[0].toLowerCase();
  const logoKey = logoImage?.split('?')[0].toLowerCase();
  if (!normalized) return false;
  if (logoKey && normalized === logoKey) return false;
  const decoded = safeDecodeURIComponent(normalized);
  if (!/^https?:\/\//i.test(image) && !/^data:image\//i.test(image)) return false;
  if (/%60|`|:o\(|media\/\W/.test(decoded)) return false;
  if (/logo|wordmark|brand|cardb|favicon|apple-touch-icon|header-logo|site-logo|lettermark|masthead|icon|avatar|profile|placeholder|silhouette|black.?cat|catstays|\/cat(?:[-_][a-z0-9]+)?\.png$/i.test(decoded)) return false;
  return true;
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function ensureImageCount(images: string[], heroImage: string): string[] {
  return uniqueStrings([...images, heroImage]);
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

function pickUniqueImage(usedImages: Set<string>, preferred: unknown[], fallbackImages: string[], logoImage = '') {
  const preferredImages = uniqueStrings(preferred).filter((image) => isUsableGalleryImage(image, logoImage));
  for (const image of preferredImages) {
    if (hasSeenImage(usedImages, image)) continue;
    rememberImage(usedImages, image);
    return image;
  }

  for (const image of fallbackImages) {
    if (!image || !isUsableGalleryImage(image, logoImage) || hasSeenImage(usedImages, image)) continue;
    rememberImage(usedImages, image);
    return image;
  }

  const fallback = preferredImages[0] || fallbackImages.find((image) => isUsableGalleryImage(image, logoImage)) || '';
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
    .slice(0, 8)
    .map((feature, index) => ({
      title: feature.title || ['Fully Licensed', 'Premium Care', 'Daily Enrichment', 'Photo Updates', 'Comfort Checks', 'Owner Updates', 'Calm Spaces', 'Personalised Care'][index] || 'Care feature',
      text: feature.text || 'A calm, professional cattery experience.',
    }));
}

function ensureSuiteCount(rooms: any[], images: string[], fallbackPrice?: string, usedImages?: Set<string>, logoImage = '') {
  const fallbackSuites = [
    { name: 'Standard Suites', description: 'Comfortable and cosy suites perfect for a relaxing stay.' },
    { name: 'Deluxe Suites', description: 'Extra comfort and premium features for added calm.' },
    { name: 'Executive Suites', description: 'Spacious accommodation with personalised care.' },
    { name: 'Family Suites', description: 'Ideal for multi-cat families staying together.' },
  ];
  const sourceRooms = rooms.length ? rooms.slice(0, 8) : fallbackSuites;

  return sourceRooms.map((room, index) => {
    const fallback = fallbackSuites[index % fallbackSuites.length];
    const title = contentStringFrom(room.name, room.title, fallback.name);
    const price = stringFrom(room.price, fallbackPrice);
    const priceUnit = stringFrom(room.priceUnit);
    const priceLabel = price && priceUnit ? `${price} ${priceUnit}` : price;
    const roomImage = stringFrom(room.image);
    return {
      image: usedImages
        ? pickUniqueImage(usedImages, [isUsableGalleryImage(roomImage, logoImage) ? roomImage : '', images[index + 1], images[index], images[0]], images, logoImage)
        : imageFrom(isUsableGalleryImage(roomImage, logoImage) ? roomImage : '', images[index + 1], images[index], images[0]),
      title,
      text: contentStringFrom(room.description, priceLabel ? `${fallback.description} ${priceLabel}.` : fallback.description),
      price: priceLabel,
      features: Array.isArray(room.amenities)
        ? room.amenities.map((feature: unknown) => contentStringFrom(feature)).filter(Boolean).slice(0, 8)
        : Array.isArray(room.features)
          ? room.features.map((feature: unknown) => contentStringFrom(feature)).filter(Boolean).slice(0, 8)
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
  logoImage = '',
) {
  const mapped = testimonials
    .map((testimonial: any, index: number) => {
      const image = imageFrom(testimonial.image, index === 0 ? testimonialImage : undefined, images[index + 4], images[index], heroImage);
      return {
        quote: contentStringFrom(testimonial.text, testimonial.quote),
        author: contentStringFrom(testimonial.name, testimonial.author, testimonial.customer, 'Guest family'),
        image: isUsableGalleryImage(image, logoImage) ? image : '',
        location: contentStringFrom(testimonial.location),
        rating: clampNumber(testimonial.rating, 1, 5, 5),
      };
    })
    .filter((testimonial) => testimonial.quote);

  if (mapped.length) return mapped.slice(0, 10);

  return [];
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
