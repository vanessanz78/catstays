import type { CatterySiteContentLibrary } from './deloraineDemo';

export type SourceSemanticRole =
  | 'hero'
  | 'introduction'
  | 'about'
  | 'story'
  | 'accommodation'
  | 'rooms'
  | 'services'
  | 'facilities'
  | 'daily-care'
  | 'health-care'
  | 'grooming'
  | 'pricing'
  | 'policies'
  | 'features'
  | 'gallery'
  | 'testimonials'
  | 'faq'
  | 'booking'
  | 'contact'
  | 'location'
  | 'cta'
  | 'footer';

export interface SourceTruthImage {
  url: string;
  originalUrl?: string;
  sourcePage?: string;
  sourceSectionId?: string;
  sourceOrder: number;
  nearbyHeading?: string;
  nearbyText?: string;
  caption?: string;
  semanticRole: SourceSemanticRole | 'media';
}

export interface WebsiteUnderstandingSection {
  id: string;
  semanticRole: SourceSemanticRole;
  sourcePage?: string;
  sourceOrder: number;
  heading: string;
  body: string;
  items: Array<{ title: string; text: string; price?: string; image?: string }>;
  images: SourceTruthImage[];
  links: Array<{ label: string; url: string }>;
  importance: number;
  relationships: Record<string, unknown>;
}

export interface WebsiteUnderstandingModel {
  isImported: boolean;
  platform?: {
    platform: string;
    confidence: string;
    builders: string[];
    signals: string[];
    contentQuality?: {
      score?: number;
      level?: string;
      canBuildPreview?: boolean;
      shouldAvoidGenericFallback?: boolean;
      reasons?: string[];
    };
    extractionRoutes?: Array<{
      name?: string;
      status?: string;
      detail?: string;
      pages?: number;
      images?: number;
      textCharacters?: number;
    }>;
  };
  identity: {
    businessName: string;
    sourceUrl: string;
    sourceHost: string;
    tagline: string;
    location: string;
  };
  navigation: Array<{ label: string; href: string; semanticRole: SourceSemanticRole }>;
  sections: WebsiteUnderstandingSection[];
  contact: {
    phone: string;
    email: string;
    address: string;
    hours: string;
    socialLinks: Record<string, string>;
  };
  booking: {
    url: string;
    label: string;
  };
  faq: Array<{ question: string; answer: string; sourceSectionId?: string }>;
  testimonials: Array<{ name: string; text: string; rating?: number; location?: string }>;
  media: {
    images: SourceTruthImage[];
    stockImages: string[];
  };
  footer: {
    about: string;
  };
  diagnostics: {
    previewSourceId: string;
    contentSourceId: string;
    pagesPersisted: number;
    sourceSections: number;
    contentBlocks: number;
    importedImages: number;
    stockImagesRendered: number;
    importPlatform: string;
    importConfidence: string;
    contentQualityScore: number;
    shouldAvoidGenericFallback: boolean;
  };
}

type AnyRecord = Record<string, any>;

export function buildWebsiteUnderstandingModel(data: AnyRecord): WebsiteUnderstandingModel {
  const record = data.previewImportRecord as AnyRecord | undefined;
  const normalized = (record?.normalizedPreviewData ?? data) as AnyRecord;
  const sourceArchive = (record?.source?.sourceArchive ?? normalized.sourceArchive ?? data.sourceArchive) as AnyRecord | undefined;
  const platform = platformIntelligenceFromArchive(sourceArchive);
  const contentLibrary = (record?.contentLibrary ?? normalized.siteContentLibrary ?? data.siteContentLibrary) as CatterySiteContentLibrary | undefined;
  const sourceUrl = stringFrom(record?.source?.url, data.sourceUrl, data.importSourceUrl, normalized.sourceUrl);
  const sourceHost = stringFrom(record?.source?.host, data.sourceHost, normalized.sourceHost, hostFromUrl(sourceUrl));
  const isImported = Boolean(sourceUrl && (sourceArchive || record || contentLibrary));
  const businessName = stringFrom(data.businessName, normalized.businessName, record?.identity?.businessName, contentLibrary?.businessName, businessNameFromHost(sourceHost), 'Your Cattery');
  const pages = arrayFrom(sourceArchive?.pages);
  const blocks = arrayFrom(contentLibrary?.blocks);
  const blockSections = sectionsFromBlocks(blocks, sourceUrl);
  const pageSections = pages.map((page, index) => sectionFromPage(page as AnyRecord, index, businessName));
  const sections = mergeSections(pageSections, blockSections);
  const images = collectSourceImages({
    sections,
    record,
    normalized,
    data,
    contentLibrary,
  });
  const contact = contactFromEvidence(data, normalized, record, sections, blocks);
  const faq = faqFromEvidence(data, normalized, record, sections, blocks);
  const testimonials = testimonialsFromEvidence(data, normalized, record, blocks);
  const description = stringFrom(
    data.aboutText,
    normalized.aboutText,
    record?.content?.description,
    sections.find((section) => section.semanticRole === 'hero')?.body,
    sections.find((section) => section.semanticRole === 'introduction')?.body,
  );

  return {
    isImported,
    platform,
    identity: {
      businessName,
      sourceUrl,
      sourceHost,
      tagline: taglineFromDescription(description),
      location: stringFrom(data.location, normalized.location, record?.identity?.location, contact.address),
    },
    navigation: navigationFromSections(sections),
    sections,
    contact,
    booking: {
      url: stringFrom(data.bookingUrl, normalized.bookingUrl, record?.source?.sourceArchive?.sourceUrl, linkFromBlocks(blocks, /book|enquire|contact/i)),
      label: 'Book / Enquire',
    },
    faq,
    testimonials,
    media: {
      images,
      stockImages: images.filter((image) => isStockImage(image.url)).map((image) => image.url),
    },
    footer: {
      about: description,
    },
    diagnostics: {
      previewSourceId: stringFrom(data.previewSourceId, record?.source?.previewSourceId),
      contentSourceId: stringFrom(data.contentSourceId, record?.source?.contentSourceId),
      pagesPersisted: pages.length,
      sourceSections: sections.length,
      contentBlocks: blocks.length,
      importedImages: images.length,
      stockImagesRendered: 0,
      importPlatform: stringFrom(platform?.platform),
      importConfidence: stringFrom(platform?.confidence),
      contentQualityScore: Number(platform?.contentQuality?.score || 0),
      shouldAvoidGenericFallback: Boolean(platform?.contentQuality?.shouldAvoidGenericFallback),
    },
  };
}

function platformIntelligenceFromArchive(sourceArchive: AnyRecord | undefined): WebsiteUnderstandingModel['platform'] | undefined {
  const platform = sourceArchive?.platform as AnyRecord | undefined;
  if (!platform) return undefined;
  const contentQuality = platform.contentQuality as AnyRecord | undefined;
  return {
    platform: stringFrom(platform.platform),
    confidence: stringFrom(platform.confidence),
    builders: arrayFrom(platform.builders).map((item) => stringFrom(item)).filter(Boolean),
    signals: arrayFrom(platform.signals).map((item) => stringFrom(item)).filter(Boolean),
    extractionRoutes: arrayFrom(platform.extractionRoutes).map((route) => {
      const record = route as AnyRecord;
      return {
        name: stringFrom(record.name),
        status: stringFrom(record.status),
        detail: stringFrom(record.detail),
        pages: typeof record.pages === 'number' ? record.pages : undefined,
        images: typeof record.images === 'number' ? record.images : undefined,
        textCharacters: typeof record.textCharacters === 'number' ? record.textCharacters : undefined,
      };
    }),
    contentQuality: contentQuality
      ? {
          score: typeof contentQuality.score === 'number' ? contentQuality.score : undefined,
          level: stringFrom(contentQuality.level),
          canBuildPreview: typeof contentQuality.canBuildPreview === 'boolean' ? contentQuality.canBuildPreview : undefined,
          shouldAvoidGenericFallback: typeof contentQuality.shouldAvoidGenericFallback === 'boolean' ? contentQuality.shouldAvoidGenericFallback : undefined,
          reasons: arrayFrom(contentQuality.reasons).map((item) => stringFrom(item)).filter(Boolean),
        }
      : undefined,
  };
}

function sectionFromPage(page: AnyRecord, index: number, businessName: string): WebsiteUnderstandingSection {
  const sourcePage = stringFrom(page.sourceUrl, page.url);
  const heading = pageHeading(page, businessName);
  const body = cleanImportedText(stringFrom(page.textSample, page.bodyText));
  const semanticRole = semanticRoleForPage(sourcePage, stringFrom(page.title), heading, body, index);
  const images = arrayFrom(page.images)
    .map((url, imageIndex) => sourceImageFromUrl(stringFrom(url), {
      sourcePage,
      sourceOrder: index * 100 + imageIndex,
      nearbyHeading: heading,
      nearbyText: body,
      semanticRole,
    }))
    .filter((image): image is SourceTruthImage => Boolean(image));

  return {
    id: slugify(`${semanticRole}-${index}-${heading || sourcePage}`),
    semanticRole,
    sourcePage,
    sourceOrder: index,
    heading,
    body,
    items: itemsFromPageText(body, semanticRole),
    images,
    links: linksFromText(body),
    importance: index === 0 ? 1 : semanticRole === 'contact' ? 0.9 : 0.75,
    relationships: {
      source: 'sourceArchive.pages',
      imageCount: images.length,
      bodyTextLength: Number(page.bodyTextLength || body.length),
    },
  };
}

function sectionsFromBlocks(blocks: AnyRecord[], sourceUrl: string): WebsiteUnderstandingSection[] {
  return blocks.map((block, index) => {
    const semanticRole = semanticRoleForBlock(block);
    const heading = stringFrom(block.title, semanticRole);
    const body = cleanImportedText(stringFrom(block.text));
    const sourceSectionId = stringFrom(block.id, slugify(`${semanticRole}-${index}`));
    const images = arrayFrom(block.images)
      .map((image, imageIndex) => {
        const imageRecord = typeof image === 'string' ? { url: image } : image as AnyRecord;
        return sourceImageFromUrl(stringFrom(imageRecord.url, imageRecord.image), {
          sourcePage: sourceUrl,
          sourceSectionId,
          sourceOrder: index * 100 + imageIndex,
          nearbyHeading: heading,
          nearbyText: body,
          caption: stringFrom(imageRecord.caption),
          semanticRole,
        });
      })
      .filter((image): image is SourceTruthImage => Boolean(image));
    const items = arrayFrom(block.items).map((item) => ({
      title: stringFrom((item as AnyRecord).title, (item as AnyRecord).name),
      text: cleanImportedText(stringFrom((item as AnyRecord).text, (item as AnyRecord).description, (item as AnyRecord).answer)),
      price: stringFrom((item as AnyRecord).price),
      image: stringFrom((item as AnyRecord).image),
    })).filter((item) => item.title || item.text || item.image);

    return {
      id: sourceSectionId,
      semanticRole,
      sourcePage: sourceUrl,
      sourceOrder: 1000 + index,
      heading,
      body,
      items,
      images,
      links: arrayFrom(block.links).map((link) => ({
        label: stringFrom((link as AnyRecord).label, (link as AnyRecord).url),
        url: stringFrom((link as AnyRecord).url),
      })).filter((link) => link.url),
      importance: 0.6,
      relationships: {
        source: 'siteContentLibrary.blocks',
        sourceBlockId: sourceSectionId,
      },
    };
  });
}

function mergeSections(pageSections: WebsiteUnderstandingSection[], blockSections: WebsiteUnderstandingSection[]) {
  if (!pageSections.length) return blockSections.sort((a, b) => a.sourceOrder - b.sourceOrder);

  const merged = [...pageSections];
  for (const block of blockSections) {
    if (!sectionHasEvidence(block)) continue;
    const duplicateIndex = merged.findIndex((page) => shouldMergeSourceSections(page, block));
    if (duplicateIndex >= 0) {
      merged[duplicateIndex] = mergeSourceSectionEvidence(merged[duplicateIndex], block);
    } else {
      merged.push(block);
    }
  }

  return merged.sort((a, b) => a.sourceOrder - b.sourceOrder);
}

function sectionHasEvidence(section: WebsiteUnderstandingSection) {
  return Boolean(section.heading || section.body || section.items.length || section.images.length || section.links.length);
}

function shouldMergeSourceSections(page: WebsiteUnderstandingSection, block: WebsiteUnderstandingSection) {
  if (page.semanticRole !== block.semanticRole) return false;
  const pageHeading = normalizedTextKey(page.heading);
  const blockHeading = normalizedTextKey(block.heading);
  if (pageHeading && blockHeading && pageHeading === blockHeading) return true;
  if (page.sourcePage && block.sourcePage && hostFromUrl(page.sourcePage) !== hostFromUrl(block.sourcePage)) return false;
  if (hasMeaningfulTextOverlap(page.body, block.body)) return true;
  return Boolean(block.items.length || block.images.length || block.links.length) && !hasConflictingHeadings(page.heading, block.heading);
}

function mergeSourceSectionEvidence(page: WebsiteUnderstandingSection, block: WebsiteUnderstandingSection): WebsiteUnderstandingSection {
  const body = bestSectionBody(page.body, block.body);
  return {
    ...page,
    heading: stringFrom(page.heading, block.heading),
    body,
    items: uniqueSectionItems([...page.items, ...block.items]),
    images: uniqueSectionImages([...page.images, ...block.images]),
    links: uniqueSectionLinks([...page.links, ...block.links]),
    sourceOrder: Math.min(page.sourceOrder, block.sourceOrder),
    importance: Math.max(page.importance, block.importance),
    relationships: {
      ...page.relationships,
      mergedSources: [
        ...arrayFrom(page.relationships?.mergedSources),
        page.relationships?.source,
        block.relationships?.source,
      ].filter(Boolean),
      mergedBlockIds: [
        ...arrayFrom(page.relationships?.mergedBlockIds),
        block.relationships?.sourceBlockId,
      ].filter(Boolean),
    },
  };
}

function bestSectionBody(pageBody: string, blockBody: string) {
  if (!pageBody) return blockBody;
  if (!blockBody) return pageBody;
  if (pageBody.includes(blockBody)) return pageBody;
  if (blockBody.includes(pageBody)) return blockBody;
  return pageBody.length >= blockBody.length ? pageBody : blockBody;
}

function uniqueSectionItems(items: WebsiteUnderstandingSection['items']) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizedTextKey(`${item.title}|${item.text}|${item.price || ''}|${item.image || ''}`);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueSectionImages(images: SourceTruthImage[]) {
  const seen = new Set<string>();
  return images.filter((image) => {
    const key = sourceImageIdentityKey(image.url, image.originalUrl);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueSectionLinks(links: WebsiteUnderstandingSection['links']) {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = normalizedTextKey(link.url || link.label);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function hasConflictingHeadings(left: string, right: string) {
  const leftKey = normalizedTextKey(left);
  const rightKey = normalizedTextKey(right);
  if (!leftKey || !rightKey || leftKey === rightKey) return false;
  return !leftKey.includes(rightKey) && !rightKey.includes(leftKey);
}

function hasMeaningfulTextOverlap(left: string, right: string) {
  const leftWords = new Set(normalizedTextKey(left).split(' ').filter((word) => word.length > 4));
  const rightWords = normalizedTextKey(right).split(' ').filter((word) => word.length > 4);
  if (!leftWords.size || !rightWords.length) return false;
  const overlap = rightWords.filter((word) => leftWords.has(word)).length;
  return overlap >= Math.min(8, Math.ceil(rightWords.length * 0.45));
}

function normalizedTextKey(value: string) {
  return cleanImportedText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function collectSourceImages(input: {
  sections: WebsiteUnderstandingSection[];
  record?: AnyRecord;
  normalized: AnyRecord;
  data: AnyRecord;
  contentLibrary?: CatterySiteContentLibrary;
}): SourceTruthImage[] {
  const imagesByIdentity = new Map<string, SourceTruthImage>();
  const originalByStored = importedOriginalUrlMap(input.record, input.normalized, input.data);
  const add = (url: unknown, meta: Partial<SourceTruthImage> = {}) => {
    const cleanUrl = stringFrom(url);
    if (!cleanUrl || !isUsableImportedImage(cleanUrl)) return;
    const originalUrl = stringFrom(meta.originalUrl, originalByStored.get(normalizedImageKey(cleanUrl)), cleanUrl);
    const candidate = {
      url: cleanUrl,
      originalUrl: originalUrl === cleanUrl ? undefined : originalUrl,
      sourceOrder: imagesByIdentity.size,
      semanticRole: 'media',
      ...meta,
    } satisfies SourceTruthImage;
    const identity = sourceImageIdentityKey(candidate.url, candidate.originalUrl);
    const existing = imagesByIdentity.get(identity);
    if (!existing || imageQualityScore(candidate) > imageQualityScore(existing)) {
      imagesByIdentity.set(identity, {
        ...candidate,
        sourceOrder: existing?.sourceOrder ?? candidate.sourceOrder,
      });
    }
  };

  for (const section of input.sections) {
    for (const image of section.images) add(image.url, image);
    for (const item of section.items) add(item.image, {
      sourcePage: section.sourcePage,
      sourceSectionId: section.id,
      nearbyHeading: item.title || section.heading,
      nearbyText: item.text || section.body,
      semanticRole: section.semanticRole,
    });
  }

  add(input.record?.media?.heroImage, { semanticRole: 'hero' });
  arrayFrom(input.record?.media?.images).forEach((url) => add(url));
  arrayFrom(input.record?.media?.galleryImages).forEach((image) => add((image as AnyRecord).url, {
    caption: stringFrom((image as AnyRecord).caption),
    semanticRole: 'gallery',
  }));
  add(input.normalized.heroImage, { semanticRole: 'hero' });
  add(input.normalized.aboutImage, { semanticRole: 'about' });
  add(input.normalized.facilitiesImage, { semanticRole: 'facilities' });
  add(input.normalized.ownerData?.image, { semanticRole: 'story' });
  add(input.data.heroImage, { semanticRole: 'hero' });
  add(input.data.aboutImage, { semanticRole: 'about' });
  add(input.data.facilitiesImage, { semanticRole: 'facilities' });
  add(input.data.ownerData?.image, { semanticRole: 'story' });
  arrayFrom(input.normalized.images).forEach((url) => add(url));
  arrayFrom(input.normalized.media?.images).forEach((url) => add(url));
  arrayFrom(input.data.images).forEach((url) => add(url));
  arrayFrom(input.data.media?.images).forEach((url) => add(url));
  arrayFrom(input.normalized.galleryImages).forEach((image) => add(typeof image === 'string' ? image : (image as AnyRecord).url, {
    caption: typeof image === 'string' ? '' : stringFrom((image as AnyRecord).caption),
    semanticRole: 'gallery',
  }));
  arrayFrom(input.normalized.media?.galleryImages).forEach((image) => add(typeof image === 'string' ? image : (image as AnyRecord).url, {
    caption: typeof image === 'string' ? '' : stringFrom((image as AnyRecord).caption),
    semanticRole: 'gallery',
  }));
  arrayFrom(input.normalized.galleryData?.galleryImages).forEach((image) => add((image as AnyRecord).url, {
    caption: stringFrom((image as AnyRecord).caption),
    semanticRole: 'gallery',
  }));
  arrayFrom(input.data.galleryImages).forEach((image) => add(typeof image === 'string' ? image : (image as AnyRecord).url, {
    semanticRole: 'gallery',
  }));
  arrayFrom(input.data.galleryData?.galleryImages).forEach((image) => add(typeof image === 'string' ? image : (image as AnyRecord).url, {
    caption: typeof image === 'string' ? '' : stringFrom((image as AnyRecord).caption),
    semanticRole: 'gallery',
  }));

  return Array.from(imagesByIdentity.values())
    .filter((image) => !isStockImage(image.url))
    .sort((a, b) => a.sourceOrder - b.sourceOrder);
}

function importedOriginalUrlMap(...sources: Array<AnyRecord | undefined>) {
  const map = new Map<string, string>();
  for (const source of sources) {
    for (const asset of [
      ...arrayFrom(source?.source?.importedImageAssets),
      ...arrayFrom(source?.assetManifest?.importedImageAssets),
      ...arrayFrom(source?.websiteSettings?.importedImageAssets),
    ]) {
      const record = asset as AnyRecord;
      const storedUrl = stringFrom(record.storedUrl);
      const originalUrl = stringFrom(record.originalUrl);
      if (storedUrl && originalUrl) map.set(normalizedImageKey(storedUrl), originalUrl);
    }
  }
  return map;
}

function contactFromEvidence(data: AnyRecord, normalized: AnyRecord, record: AnyRecord | undefined, sections: WebsiteUnderstandingSection[], blocks: AnyRecord[]) {
  const contactSection = sections.find((section) => section.semanticRole === 'contact');
  const contactText = [contactSection?.body, ...contactSection?.items.map((item) => `${item.title} ${item.text}`) ?? []].join(' ');
  const blockContact = blocks.find((block) => semanticRoleForBlock(block) === 'contact') as AnyRecord | undefined;
  const blockItems = arrayFrom(blockContact?.items);
  const blockText = [blockContact?.text, ...blockItems.map((item) => `${(item as AnyRecord).title} ${(item as AnyRecord).text}`)].join(' ');
  const sourceText = `${contactText} ${blockText}`;
  return {
    phone: stringFrom(data.phone, normalized.phone, record?.contact?.phone, sourceText.match(/\b0(?:2\d|9|7|6|4|3)(?:[\s-]?\d){6,8}\b/)?.[0]),
    email: stringFrom(data.email, normalized.email, record?.contact?.email, sourceText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/)?.[0]),
    address: stringFrom(data.address, normalized.address, record?.contact?.address, sourceText.match(/\b\d{1,5}\s+[A-Z][A-Za-z0-9' -]{2,80}(?:Road|Rd|Street|St|Avenue|Ave|Drive|Dr|Lane|Ln|Way)\b[^|.]*/)?.[0]),
    hours: stringFrom(data.hours, normalized.hours, normalized.contactData?.hours),
    socialLinks: {
      ...((normalized.socialLinks ?? normalized.contactData?.socialLinks ?? {}) as Record<string, string>),
      ...((data.socialLinks ?? {}) as Record<string, string>),
    },
  };
}

function faqFromEvidence(data: AnyRecord, normalized: AnyRecord, record: AnyRecord | undefined, sections: WebsiteUnderstandingSection[], blocks: AnyRecord[]) {
  const fromRecord = arrayFrom(record?.faqs).map((faq) => ({
    question: stringFrom((faq as AnyRecord).question),
    answer: cleanImportedText(stringFrom((faq as AnyRecord).answer)),
  }));
  const fromNormalized = arrayFrom(normalized.faqData?.faqs ?? data.faqs).map((faq) => ({
    question: stringFrom((faq as AnyRecord).question),
    answer: cleanImportedText(stringFrom((faq as AnyRecord).answer)),
  }));
  const fromBlocks = blocks
    .filter((block) => semanticRoleForBlock(block) === 'faq')
    .flatMap((block) => arrayFrom((block as AnyRecord).items))
    .map((item) => ({
      question: stringFrom((item as AnyRecord).question, (item as AnyRecord).title),
      answer: cleanImportedText(stringFrom((item as AnyRecord).answer, (item as AnyRecord).text)),
    }));
  const fromPages = sections
    .filter((section) => section.semanticRole === 'faq')
    .flatMap((section) => itemsFromPageText(section.body, 'faq').map((item) => ({
      question: item.title,
      answer: item.text,
      sourceSectionId: section.id,
    })));
  return uniqueByQuestion([...fromRecord, ...fromNormalized, ...fromBlocks, ...fromPages]).filter((faq) => faq.question && faq.answer).slice(0, 20);
}

function testimonialsFromEvidence(data: AnyRecord, normalized: AnyRecord, record: AnyRecord | undefined, blocks: AnyRecord[]) {
  const rows = [
    ...arrayFrom(record?.reviews),
    ...arrayFrom(normalized.testimonialsData?.testimonials),
    ...arrayFrom(data.testimonials),
    ...blocks.filter((block) => semanticRoleForBlock(block) === 'testimonials').flatMap((block) => arrayFrom((block as AnyRecord).items)),
  ];
  return rows.map((review) => ({
    name: stringFrom((review as AnyRecord).name, (review as AnyRecord).title, (review as AnyRecord).author),
    text: cleanImportedText(stringFrom((review as AnyRecord).text, (review as AnyRecord).quote)),
    rating: typeof (review as AnyRecord).rating === 'number' ? (review as AnyRecord).rating : undefined,
    location: stringFrom((review as AnyRecord).location, (review as AnyRecord).meta),
  })).filter((review) => review.name || review.text).slice(0, 12);
}

function navigationFromSections(sections: WebsiteUnderstandingSection[]) {
  const orderedRoles: SourceSemanticRole[] = ['about', 'accommodation', 'health-care', 'grooming', 'services', 'pricing', 'faq', 'contact'];
  const labels: Record<string, string> = {
    about: 'About',
    accommodation: 'Accommodation',
    'health-care': 'Health Care',
    grooming: 'Grooming',
    services: 'Services',
    pricing: 'Pricing',
    faq: 'FAQ',
    contact: 'Contact',
  };
  return orderedRoles
    .filter((role) => sections.some((section) => section.semanticRole === role && (section.heading || section.body || section.items.length)))
    .map((role) => ({ label: labels[role], href: `#${role}`, semanticRole: role }));
}

function semanticRoleForPage(url: string, title: string, heading: string, body: string, index: number): SourceSemanticRole {
  const source = `${url} ${title} ${heading} ${body}`.toLowerCase();
  const path = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  })();
  const pageLabel = `${path} ${title} ${heading}`.toLowerCase();
  if (index === 0) return 'hero';
  if (/gallery|photos?/.test(pageLabel)) return 'gallery';
  if (/booking-engine|accomodation|accommodation/.test(path)) return 'accommodation';
  if (/homestay-fees/.test(path)) return 'pricing';
  if (/grooming-gallery|fancy-felines-services|prices/.test(path)) return 'grooming';
  if (/health-care|pemf|hbot|respite/.test(path)) return 'health-care';
  if (/boutique accommodation|suite|boarding|homely/i.test(source)) return 'accommodation';
  if (/groom|matting|shaving|sedation|ragdoll/i.test(source)) return 'grooming';
  if (/pemf|hbot|health care|health retreat|wellness/i.test(source)) return 'health-care';
  if (/faq|q\s*&?\s*a|question|without grooming|grooming only/i.test(source)) return 'faq';
  if (/homestay|fee|price|pricing|cost|\$\s*\d|per\s+24/i.test(source)) return 'pricing';
  if (/contact|call|txt|email|address|whareora/i.test(source)) return 'contact';
  if (/gallery/i.test(source)) return 'gallery';
  return 'about';
}

function semanticRoleForBlock(block: AnyRecord): SourceSemanticRole {
  const category = stringFrom(block.category, block.id).toLowerCase();
  if (category === 'rooms') return 'accommodation';
  if (category === 'faqs') return 'faq';
  if (category === 'reviews') return 'testimonials';
  if (category === 'owner-story') return 'story';
  if (category === 'why-choose-us') return 'features';
  if (category.includes('health')) return 'health-care';
  if (category.includes('groom')) return 'grooming';
  if (category.includes('price')) return 'pricing';
  return (category || 'about') as SourceSemanticRole;
}

function pageHeading(page: AnyRecord, businessName: string) {
  const heading = stringFrom(page.heading, page.title);
  const cleaned = heading.replace(/\s*\|\s*Fancy Felines.*$/i, '').replace(/\s*\|\s*Cattery.*$/i, '').trim();
  if (!cleaned || /top of page|bottom of page/i.test(cleaned)) return businessName;
  return cleaned;
}

function itemsFromPageText(text: string, role: SourceSemanticRole) {
  if (!text) return [];
  if (role === 'pricing' || role === 'grooming' || role === 'health-care' || role === 'accommodation') {
    const accommodationItems = accommodationPriceItems(text);
    if (accommodationItems.length) return accommodationItems;

    return uniquePriceItems([
      ...['Basic Care', 'Moderate Care', 'Intense Care', 'Short Hair', 'Medium Hair', 'Long Hair', 'Matting Removal', 'Standard Grooming']
        .flatMap((name) => {
          const match = text.match(new RegExp(`${name}[\\s\\S]{0,140}?\\$\\s*([0-9]{2,}(?:\\s*\\.\\s*[0-9]{2})?)`, 'i'));
          return match ? [{ title: name, price: `$${String(match[1]).replace(/\s+/g, '')}`, text: '' }] : [];
        }),
      ...[...text.matchAll(/\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,5})\s+\$?\s*([0-9]{2,}(?:\s*\.\s*[0-9]{2})?)(?:\s*\(([^)]{3,100})\))?/g)]
      .slice(0, 10)
      .map((match) => ({
        title: cleanPriceTitle(match[1]),
        price: `$${String(match[2]).replace(/\s+/g, '')}`,
        text: cleanImportedText(match[3] || ''),
      }))
      .filter((item) => item.title && !/page|fee|gst/i.test(item.title.toLowerCase())),
    ]);
  }
  if (role === 'faq') {
    return text
      .split(/(?=\b(?:Can|Do|Does|What|When|Where|How|Is|Are)\b[^?]{8,120}\?)/)
      .map((chunk) => {
        const match = chunk.match(/^([^?]{8,140}\?)\s*([\s\S]{8,500})/);
        return match ? { title: cleanImportedText(match[1]), text: cleanImportedText(match[2]) } : null;
      })
      .filter((item): item is { title: string; text: string } => Boolean(item?.title && item?.text))
      .slice(0, 12);
  }
  return [];
}

function accommodationPriceItems(text: string) {
  return uniquePriceItems(
    [...text.matchAll(/\b(Standard|Master Suite|Penthouse)\s*-\s*(\d+)\s*Cats?\s+\$?\s*([0-9]{2,}(?:\s*\.\s*[0-9]{2})?)\s*\/?\s*(Day|day)?/gi)]
      .map((match) => {
        const packageName = cleanImportedText(match[1]);
        const catCount = Number(match[2]);
        const price = `$${String(match[3]).replace(/\s+/g, '')}`;
        const unit = cleanImportedText(match[4] || 'day').toLowerCase();
        return {
          title: `${packageName} - ${catCount} ${catCount === 1 ? 'Cat' : 'Cats'}`,
          price,
          text: `Secure accommodation with indoor/outdoor access, full room service, customised feeding, and fresh water. Rate shown per ${unit}.`,
        };
      }),
  );
}

function sourceImageFromUrl(url: string, input: Omit<SourceTruthImage, 'url'>): SourceTruthImage | null {
  if (!isUsableImportedImage(url)) return null;
  return { url, ...input };
}

function isUsableImportedImage(url: string) {
  if (!/^https?:\/\//i.test(url) && !/^data:image\//i.test(url)) return false;
  if (isStockImage(url)) return false;
  const decoded = safelyDecodeUrlPath(url.split('?')[0].toLowerCase());
  return !/favicon|apple-touch-icon|placeholder|silhouette|catstays|(?:^|[-_/])logo(?:[-_.]|$)|cardb\.png/i.test(decoded);
}

export function isStockImage(url: string) {
  return /images\.unsplash\.com|premium-cattery-sleeping-cat-hero|\/assets\/marketing\//i.test(url);
}

function cleanImportedText(value: string) {
  return value
    .replace(/top\s*of\s*page/gi, ' ')
    .replace(/bottom\s*of\s*page/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniquePriceItems(items: Array<{ title: string; price?: string; text: string }>) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.title.toLowerCase()}|${item.price || ''}`;
    if (!item.title || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);
}

function cleanPriceTitle(value: string) {
  return cleanImportedText(value)
    .replace(/^.*?(Basic Care|Moderate Care|Intense Care|Short Hair|Medium Hair|Long Hair|Matting Removal|Standard Grooming)/i, '$1')
    .trim();
}

function linksFromText(text: string) {
  return [...text.matchAll(/https?:\/\/[^"'`\s)]+/g)]
    .map((match) => ({ label: match[0], url: match[0].replace(/[),.;]+$/g, '') }))
    .slice(0, 8);
}

function linkFromBlocks(blocks: AnyRecord[], pattern: RegExp) {
  for (const block of blocks) {
    const match = arrayFrom(block.links).find((link) => pattern.test(`${(link as AnyRecord).label} ${(link as AnyRecord).url}`));
    if (match) return stringFrom((match as AnyRecord).url);
  }
  return '';
}

function taglineFromDescription(description: string) {
  if (!description) return '';
  return description.split(/(?<=[.!?])\s+/)[0].slice(0, 120);
}

function uniqueByQuestion(items: Array<{ question: string; answer: string; sourceSectionId?: string }>) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.question.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stringFrom(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    if (typeof value !== 'string') continue;
    const trimmed = cleanImportedText(value);
    if (trimmed) return trimmed;
  }
  return '';
}

function arrayFrom(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function hostFromUrl(rawUrl: string) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function businessNameFromHost(host: string) {
  return host
    .replace(/^www\./, '')
    .split('.')[0]
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizedImageKey(image: string) {
  return image.split('?')[0].trim().toLowerCase();
}

export function sourceImageIdentityKey(url: string, originalUrl?: string) {
  const source = safelyDecodeUrlPath((originalUrl || url).split('?')[0].toLowerCase());
  const wixMedia = source.match(/static\.wixstatic\.com\/media\/([^/]+)/i)?.[1];
  if (wixMedia) return `wix:${wixMedia.replace(/~mv2.*$/i, '').replace(/\.(?:jpe?g|png|webp|avif|gif)$/i, '')}`;

  const wixTransform = source.match(/\/media\/([^/]+)\/v1\//i)?.[1];
  if (wixTransform) return `wix:${wixTransform.replace(/~mv2.*$/i, '').replace(/\.(?:jpe?g|png|webp|avif|gif)$/i, '')}`;

  const storagePath = source.match(/\/storage\/v1\/object\/public\/catstays-media\/(.+)$/i)?.[1];
  if (storagePath) return `storage:${storagePath}`;

  return source
    .replace(/\/v1\/(?:fill|fit|crop|resize)\/.*$/i, '')
    .replace(/(?:[?&](?:w|h|width|height|fit|crop|quality|q)=[^&]+)/gi, '')
    .replace(/\/+$/, '');
}

function imageQualityScore(image: SourceTruthImage) {
  const source = image.originalUrl || image.url;
  const dimensions = [...source.matchAll(/[/?&,](?:w|width)_?=?([0-9]{2,5})|[/?&,](?:h|height)_?=?([0-9]{2,5})/gi)]
    .map((match) => Number(match[1] || match[2]))
    .filter((value) => Number.isFinite(value));
  const dimensionScore = dimensions.reduce((sum, value) => sum + value, 0);
  return dimensionScore + (isCatstaysStorageUrl(image.url) ? 100000 : 0) + (image.caption ? 500 : 0);
}

function isCatstaysStorageUrl(value: string) {
  try {
    const url = new URL(value);
    return /\.supabase\.co$/i.test(url.hostname) && /\/storage\/v1\/object\/public\/catstays-media\//i.test(url.pathname);
  } catch {
    return false;
  }
}

function safelyDecodeUrlPath(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'source-section';
}
