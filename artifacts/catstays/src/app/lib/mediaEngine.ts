import type { ImportedMediaCatalogueItem, ImportedMediaCategory } from './deloraineDemo';

export const MEDIA_CATALOGUE_SCHEMA_VERSION = 1;
export const MEDIA_ASSIGNMENTS_SCHEMA_VERSION = 1;

export interface MediaEngineImages {
  schemaVersion: number;
  mediaCatalogueVersion: number;
  hero: string;
  about: string;
  facilities: string;
  suites: string[];
  services: string[];
  gallery: string[];
  reviews: string[];
  owner: string;
  contact: string;
  logo: string;
  catalogue: ImportedMediaCatalogueItem[];
  metadata: {
    confidence: Partial<Record<keyof Omit<MediaEngineImages, 'metadata' | 'catalogue'>, number>>;
    source: Partial<Record<keyof Omit<MediaEngineImages, 'metadata' | 'catalogue'>, string>>;
    pool: string[];
  };
}

export interface MediaEngineInput {
  mediaCatalogue?: unknown;
  heroImage?: unknown;
  logoImage?: unknown;
  images?: unknown[];
  galleryImages?: unknown[];
  aboutImage?: unknown;
  facilitiesImage?: unknown;
  ownerImage?: unknown;
  contactImage?: unknown;
  testimonialImage?: unknown;
  suiteImages?: unknown[];
  serviceImages?: unknown[];
  fallbackImages?: unknown[];
  suiteCount?: number;
  serviceCount?: number;
  reviewCount?: number;
}

export interface MediaAssignmentMigrationResult {
  mediaAssignments: MediaEngineImages;
  repairedCategories: string[];
}

interface CatalogueOptions {
  allowOpenGraph?: boolean;
  excludeFromHero?: boolean;
  requireNoVisibleText?: boolean;
  requireHeroContext?: boolean;
}

const defaultPlaceholderImages = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&h=900&fit=crop',
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1200&h=900&fit=crop',
  'https://images.unsplash.com/photo-1573865526739-10c1de0e0ef2?w=1200&h=900&fit=crop',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&h=900&fit=crop',
];

export function buildMediaEngineImages(input: MediaEngineInput): MediaEngineImages {
  const catalogue = normalizeMediaCatalogue(input.mediaCatalogue);
  const logo = imageUrlFrom(input.logoImage);
  const sourceImages = uniqueMediaUrls([
    ...catalogueImageUrls(catalogue),
    ...flatValues(input.images),
    ...flatValues(input.galleryImages),
    ...flatValues(input.fallbackImages),
  ]);
  const hero = selectHeroCatalogueImage(catalogue) || imageFrom(input.heroImage, sourceImages[0], input.fallbackImages, defaultPlaceholderImages[0]);
  const pool = ensureImagePool(
    uniqueMediaUrls([
      ...sourceImages,
      input.facilitiesImage,
      input.aboutImage,
      input.ownerImage,
      input.contactImage,
      hero,
    ]).filter((image) => isUsableContentImage(image, logo)),
    hero,
  );
  const usedImages = new Set<string>();
  rememberImage(usedImages, hero);

  const about = pickUniqueImage(
    usedImages,
    [
      input.aboutImage,
      preferredCatalogueImage(catalogue, ['Facilities', 'Owner', 'About'], 0),
      pool.find((image) => normalizedImageKey(image) !== normalizedImageKey(hero)),
    ],
    pool,
  );
  const facilities = pickUniqueImage(
    usedImages,
    [
      input.facilitiesImage,
      preferredCatalogueImage(catalogue, ['Facilities'], 0, { excludeFromHero: true, requireNoVisibleText: true }),
      pool[2],
    ],
    pool,
  );
  const owner = pickUniqueImage(
    usedImages,
    [
      input.ownerImage,
      preferredCatalogueImage(catalogue, ['Owner', 'About'], 0),
      pool[5],
      pool[1],
    ],
    pool,
  );
  const serviceCount = Math.max(input.serviceCount ?? 0, flatValues(input.serviceImages).length);
  const services = Array.from({ length: serviceCount }, (_, index) =>
    pickUniqueImage(
      usedImages,
      [
        preferredCatalogueImage(catalogue, ['Services'], index),
        flatValues(input.serviceImages)[index],
        pool[index + 3],
        pool[index],
      ],
      pool,
    ),
  );
  const galleryCandidates = categoryImages(catalogue, ['Gallery'], pool);
  const gallery = galleryCandidates
    .filter((image) => !hasSeenImage(usedImages, image))
    .slice(0, 24);
  const suitePool = categoryImages(catalogue, ['Suites / Rooms'], pool);
  const suiteCount = Math.max(input.suiteCount ?? 0, flatValues(input.suiteImages).length);
  const suites = Array.from({ length: suiteCount }, (_, index) => {
    const suiteImage = flatValues(input.suiteImages)[index];
    return pickUniqueImage(
      usedImages,
      [
        isUsableContentImage(imageUrlFrom(suiteImage), logo) ? suiteImage : '',
        suitePool[index + 1],
        suitePool[index],
        suitePool[0],
      ],
      suitePool,
    );
  });
  const reviewPool = categoryImages(catalogue, ['Gallery'], pool);
  const reviewCount = Math.max(input.reviewCount ?? 0, 1);
  const reviews = Array.from({ length: reviewCount }, (_, index) =>
    imageFrom(
      index === 0 ? input.testimonialImage : undefined,
      reviewPool[index + 4],
      reviewPool[index],
      hero,
    ),
  );
  const contact = imageFrom(input.contactImage, facilities, about, hero);

  return {
    schemaVersion: MEDIA_ASSIGNMENTS_SCHEMA_VERSION,
    mediaCatalogueVersion: MEDIA_CATALOGUE_SCHEMA_VERSION,
    hero,
    about,
    facilities,
    suites,
    services,
    gallery: gallery.length ? gallery : galleryCandidates.slice(0, 24),
    reviews,
    owner,
    contact,
    logo,
    catalogue,
    metadata: {
      confidence: {
        hero: confidenceForUrl(catalogue, hero),
        about: confidenceForUrl(catalogue, about),
        facilities: confidenceForUrl(catalogue, facilities),
        owner: confidenceForUrl(catalogue, owner),
        contact: confidenceForUrl(catalogue, contact),
      },
      source: {
        hero: categoryForUrl(catalogue, hero),
        about: categoryForUrl(catalogue, about),
        facilities: categoryForUrl(catalogue, facilities),
        owner: categoryForUrl(catalogue, owner),
        contact: categoryForUrl(catalogue, contact),
      },
      pool,
    },
  };
}

export function normalizeMediaCatalogue(value: unknown): ImportedMediaCatalogueItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): ImportedMediaCatalogueItem | null => {
      if (!item || typeof item !== 'object') return null;
      const candidate = item as Partial<ImportedMediaCatalogueItem>;
      if (!candidate.originalUrl || typeof candidate.originalUrl !== 'string') return null;
      return {
        originalUrl: candidate.originalUrl,
        supabaseStorageUrl: typeof candidate.supabaseStorageUrl === 'string' ? candidate.supabaseStorageUrl : undefined,
        category: candidate.category || 'Unknown',
        confidence: typeof candidate.confidence === 'number' ? candidate.confidence : 0,
        sourcePage: typeof candidate.sourcePage === 'string' ? candidate.sourcePage : '',
        altText: typeof candidate.altText === 'string' ? candidate.altText : '',
        nearbyHeading: typeof candidate.nearbyHeading === 'string' ? candidate.nearbyHeading : '',
        nearbyParagraph: typeof candidate.nearbyParagraph === 'string' ? candidate.nearbyParagraph : '',
        isLogo: Boolean(candidate.isLogo),
        containsVisibleText: Boolean(candidate.containsVisibleText),
        width: typeof candidate.width === 'number' ? candidate.width : undefined,
        height: typeof candidate.height === 'number' ? candidate.height : undefined,
        excludeFromHeroSelection: Boolean(candidate.excludeFromHeroSelection),
      };
    })
    .filter((item): item is ImportedMediaCatalogueItem => Boolean(item));
}

export function normalizeMediaEngineImages(value: unknown): MediaEngineImages | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<MediaEngineImages>;
  if (typeof candidate.hero !== 'string') return null;
  return {
    schemaVersion: typeof candidate.schemaVersion === 'number' ? candidate.schemaVersion : 0,
    mediaCatalogueVersion: typeof candidate.mediaCatalogueVersion === 'number' ? candidate.mediaCatalogueVersion : 0,
    hero: candidate.hero,
    about: typeof candidate.about === 'string' ? candidate.about : '',
    facilities: typeof candidate.facilities === 'string' ? candidate.facilities : '',
    suites: Array.isArray(candidate.suites) ? candidate.suites.filter((image): image is string => typeof image === 'string') : [],
    services: Array.isArray(candidate.services) ? candidate.services.filter((image): image is string => typeof image === 'string') : [],
    gallery: Array.isArray(candidate.gallery) ? candidate.gallery.filter((image): image is string => typeof image === 'string') : [],
    reviews: Array.isArray(candidate.reviews) ? candidate.reviews.filter((image): image is string => typeof image === 'string') : [],
    owner: typeof candidate.owner === 'string' ? candidate.owner : '',
    contact: typeof candidate.contact === 'string' ? candidate.contact : '',
    logo: typeof candidate.logo === 'string' ? candidate.logo : '',
    catalogue: normalizeMediaCatalogue(candidate.catalogue),
    metadata: candidate.metadata ?? {
      confidence: {},
      source: {},
      pool: [],
    },
  };
}

export function migrateMediaAssignments(input: MediaEngineInput, existingValue: unknown): MediaAssignmentMigrationResult {
  const fresh = buildMediaEngineImages(input);
  const existing = normalizeMediaEngineImages(existingValue);
  if (!existing) {
    return {
      mediaAssignments: fresh,
      repairedCategories: ['Hero', 'About', 'Facilities', 'Suites', 'Services', 'Gallery', 'Reviews', 'Contact'],
    };
  }

  const schemaOutdated =
    existing.schemaVersion !== MEDIA_ASSIGNMENTS_SCHEMA_VERSION ||
    existing.mediaCatalogueVersion !== MEDIA_CATALOGUE_SCHEMA_VERSION;
  const repairedCategories: string[] = [];
  const suiteCount = Math.max(input.suiteCount ?? 0, fresh.suites.length);
  const serviceCount = Math.max(input.serviceCount ?? 0, fresh.services.length);
  const reviewCount = Math.max(input.reviewCount ?? 0, fresh.reviews.length);

  const repaired: MediaEngineImages = {
    ...fresh,
    hero: validScalar(existing.hero) && !schemaOutdated ? existing.hero : repairScalar('Hero', fresh.hero),
    about: validScalar(existing.about) && !schemaOutdated ? existing.about : repairScalar('About', fresh.about),
    facilities: validScalar(existing.facilities) && !schemaOutdated ? existing.facilities : repairScalar('Facilities', fresh.facilities),
    suites: validArray(existing.suites, suiteCount) && !schemaOutdated ? existing.suites : repairArray('Suites', fresh.suites),
    services: validArray(existing.services, serviceCount) && !schemaOutdated ? existing.services : repairArray('Services', fresh.services),
    gallery: validArray(existing.gallery, 1) && !schemaOutdated ? existing.gallery : repairArray('Gallery', fresh.gallery),
    reviews: validArray(existing.reviews, reviewCount) && !schemaOutdated ? existing.reviews : repairArray('Reviews', fresh.reviews),
    contact: validScalar(existing.contact) && !schemaOutdated ? existing.contact : repairScalar('Contact', fresh.contact),
    owner: validScalar(existing.owner) && !schemaOutdated ? existing.owner : fresh.owner,
    logo: typeof existing.logo === 'string' && !schemaOutdated ? existing.logo : fresh.logo,
  };

  if (schemaOutdated) {
    repairedCategories.splice(0, repairedCategories.length, 'Hero', 'About', 'Facilities', 'Suites', 'Services', 'Gallery', 'Reviews', 'Contact');
  }

  return {
    mediaAssignments: repaired,
    repairedCategories: [...new Set(repairedCategories)],
  };

  function repairScalar(category: string, value: string) {
    repairedCategories.push(category);
    return value;
  }

  function repairArray(category: string, value: string[]) {
    repairedCategories.push(category);
    return value;
  }
}

export function selectHeroCatalogueImage(mediaCatalogue: ImportedMediaCatalogueItem[]): string {
  return (
    preferredCatalogueImage(mediaCatalogue, ['Hero'], 0, { excludeFromHero: true, requireNoVisibleText: true }) ||
    preferredCatalogueImage(mediaCatalogue, ['Background'], 0, { excludeFromHero: true, requireNoVisibleText: true, requireHeroContext: true }) ||
    preferredCatalogueImage(mediaCatalogue, ['Hero'], 0, { excludeFromHero: true }) ||
    preferredCatalogueImage(mediaCatalogue, ['Facilities'], 0, { excludeFromHero: true, requireNoVisibleText: true }) ||
    preferredCatalogueImage(mediaCatalogue, ['Social / Open Graph'], 0, { allowOpenGraph: true }) ||
    ''
  );
}

export function preferredCatalogueImage(
  mediaCatalogue: ImportedMediaCatalogueItem[],
  categories: ImportedMediaCategory[],
  offset = 0,
  options: CatalogueOptions = {},
): string {
  const matches = mediaCatalogue
    .filter((item) => categories.includes(item.category))
    .filter((item) => !item.isLogo && item.category !== 'Logo' && item.category !== 'Decorative')
    .filter((item) => options.allowOpenGraph || item.category !== 'Social / Open Graph')
    .filter((item) => !options.excludeFromHero || !item.excludeFromHeroSelection)
    .filter((item) => !options.requireNoVisibleText || !item.containsVisibleText)
    .filter((item) => !options.requireHeroContext || /\b(hero|main|welcome|home|cover)\b/i.test(`${item.originalUrl} ${item.nearbyHeading} ${item.nearbyParagraph}`))
    .sort((a, b) => {
      const categoryDelta = categories.indexOf(a.category) - categories.indexOf(b.category);
      if (categoryDelta !== 0) return categoryDelta;
      return b.confidence - a.confidence;
    });

  return mediaDisplayUrl(matches[offset]);
}

export function catalogueImageUrls(mediaCatalogue: ImportedMediaCatalogueItem[]): string[] {
  const primary = mediaCatalogue
    .filter((item) => item.category !== 'Logo' && item.category !== 'Decorative' && item.category !== 'Social / Open Graph')
    .sort((a, b) => b.confidence - a.confidence)
    .map(mediaDisplayUrl);
  const openGraph = mediaCatalogue
    .filter((item) => item.category === 'Social / Open Graph')
    .sort((a, b) => b.confidence - a.confidence)
    .map(mediaDisplayUrl);

  return uniqueMediaUrls([...primary, ...openGraph]);
}

export function preferCatalogueImages<T extends { image?: string }>(
  items: T[],
  mediaCatalogue: ImportedMediaCatalogueItem[],
  categories: ImportedMediaCategory[],
): T[] {
  if (!mediaCatalogue.length) return items;
  return items.map((item, index) => ({
    ...item,
    image: preferredCatalogueImage(mediaCatalogue, categories, index) || item.image,
  }));
}

export function imageUrlFrom(value: unknown): string {
  for (const item of flatValues(value)) {
    if (typeof item !== 'string') continue;
    const image = item.trim();
    if (/^https?:\/\//i.test(image) || /^data:image\//i.test(image)) return image;
  }
  return '';
}

export function uniqueMediaUrls(values: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of flatValues(values)) {
    const image = imageUrlFrom(value);
    if (!image) continue;
    const key = normalizedImageKey(image);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(image);
  }
  return result;
}

function categoryImages(mediaCatalogue: ImportedMediaCatalogueItem[], categories: ImportedMediaCategory[], fallbackImages: string[]) {
  return uniqueMediaUrls([
    ...categories.flatMap((category) =>
      mediaCatalogue
        .filter((item) => item.category === category && item.category !== 'Logo' && item.category !== 'Decorative')
        .sort((a, b) => b.confidence - a.confidence)
        .map(mediaDisplayUrl),
    ),
    ...fallbackImages,
  ]);
}

function mediaDisplayUrl(item?: ImportedMediaCatalogueItem): string {
  return item?.supabaseStorageUrl || item?.originalUrl || '';
}

function imageFrom(...values: unknown[]): string {
  return imageUrlFrom(values) || defaultPlaceholderImages[0];
}

function validScalar(value: unknown): value is string {
  return typeof value === 'string' && isValidImageUrl(value);
}

function validArray(value: unknown, minimumLength: number): value is string[] {
  if (!Array.isArray(value) || value.length < minimumLength) return false;
  return value.every((item) => isValidImageUrl(item));
}

function isValidImageUrl(value: unknown) {
  if (typeof value !== 'string') return false;
  const image = value.trim();
  return /^https?:\/\//i.test(image) || /^data:image\//i.test(image);
}

function ensureImagePool(images: string[], heroImage: string): string[] {
  const importedImages = uniqueMediaUrls([...images, heroImage]);
  if (importedImages.length) return importedImages;
  return uniqueMediaUrls([...images, heroImage, ...defaultPlaceholderImages]);
}

function pickUniqueImage(usedImages: Set<string>, preferred: unknown[], fallbackImages: string[]) {
  const preferredImages = uniqueMediaUrls(preferred).filter((image) => isUsableContentImage(image));
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

function isUsableContentImage(image: string, logoImage?: string): boolean {
  const normalized = image.split('?')[0].toLowerCase();
  const logoKey = logoImage?.split('?')[0].toLowerCase();
  if (!normalized) return false;
  if (logoKey && normalized === logoKey) return false;
  const decoded = decodeURIComponent(normalized);
  return !/logo|favicon|apple-touch-icon|icon|avatar|profile|placeholder|silhouette|black.?cat|catstays|\/cat(?:[-_][a-z0-9]+)?\.png$/i.test(decoded);
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

function confidenceForUrl(mediaCatalogue: ImportedMediaCatalogueItem[], image: string): number | undefined {
  return mediaCatalogue.find((item) => normalizedImageKey(mediaDisplayUrl(item)) === normalizedImageKey(image))?.confidence;
}

function categoryForUrl(mediaCatalogue: ImportedMediaCatalogueItem[], image: string): string | undefined {
  return mediaCatalogue.find((item) => normalizedImageKey(mediaDisplayUrl(item)) === normalizedImageKey(image))?.category;
}

function flatValues(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [value];
  return value.flatMap((item) => flatValues(item));
}
