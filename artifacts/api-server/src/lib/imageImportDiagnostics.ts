import type { CatteryWebsiteScrapeResult } from './catteryWebsiteScraper';

type ImageImportStage =
  | 'discovery'
  | 'validation'
  | 'upload'
  | 'upload-result'
  | 'builder'
  | 'preview';

export type ImageDiagnosticUrl = {
  label: string;
  url: string;
  isSupabaseStorageUrl: boolean;
  reason?: string;
  blankReason?: string;
};

type ImageImportEvent = {
  stage: ImageImportStage;
  originalUrl?: string;
  section?: string;
  reason?: string;
  accepted?: boolean;
  bucket?: string | null;
  objectPath?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  storageUrl?: string | null;
  label?: string;
  builderUrl?: string;
  previewUrl?: string;
  blankReason?: string;
};

type DiagnosticError = {
  stage: ImageImportStage | 'scrape';
  reason: string;
  detail?: string;
  url?: string;
};

const DEBUG_PREFIX = '[catstays:image-import]';
const NO_UPLOAD_STAGE_REASON =
  'No Supabase Storage copy/upload function is called by the current website import path.';

export class ImageImportFlightRecorder {
  private readonly discovered = new Map<string, ImageImportEvent>();
  private readonly validation = new Map<string, ImageImportEvent>();
  private readonly uploadEvents: ImageImportEvent[] = [];
  private readonly builderEvents: ImageImportEvent[] = [];
  private readonly previewEvents: ImageImportEvent[] = [];
  private readonly diagnosticErrors: DiagnosticError[] = [];

  discover(originalUrl: string, section: string, reason: string) {
    const url = cleanUrl(originalUrl);
    if (!url || this.discovered.has(url)) return;

    const event: ImageImportEvent = {
      stage: 'discovery',
      originalUrl: url,
      section,
      reason,
    };
    this.discovered.set(url, event);
    logEvent(event);
  }

  recordValidation(rawImages: string[], acceptedImages: string[]) {
    const acceptedSet = new Set(acceptedImages.map(cleanUrl).filter(Boolean));
    const acceptedKeySet = new Set(acceptedImages.map(imageKeyForDiagnostics).filter(Boolean));
    const seen = new Set<string>();

    for (const rawImage of rawImages) {
      const image = cleanUrl(rawImage);
      if (!image || seen.has(image)) continue;
      seen.add(image);

      const decoded = safeDecode(image);
      const rejectedByFormat = /\.(svg|gif)(\?|$)/i.test(image);
      const rejectedByIcon =
        /favicon|apple-touch-icon|placeholder|avatar|profile|icon/i.test(decoded);
      const accepted = acceptedSet.has(image);
      const duplicate = !accepted && acceptedKeySet.has(imageKeyForDiagnostics(image));
      const reason = accepted
        ? validationAcceptanceReason(decoded)
        : rejectedByFormat
          ? 'unsupported mime or image format by URL extension'
          : rejectedByIcon
            ? iconRejectionReason(decoded)
            : duplicate
              ? 'duplicate'
              : 'not included after image curation cap or unsupported candidate';

      const event: ImageImportEvent = {
        stage: 'validation',
        originalUrl: image,
        section: this.discovered.get(image)?.section,
        reason,
        accepted,
      };
      this.validation.set(image, event);
      logEvent(event);
    }
  }

  recordUploadNotAttempted(images: string[]) {
    for (const image of uniqueUrls(images)) {
      const uploadEvent: ImageImportEvent = {
        stage: 'upload',
        originalUrl: image,
        reason: NO_UPLOAD_STAGE_REASON,
        bucket: null,
        objectPath: null,
        mimeType: null,
        fileSize: null,
      };
      this.uploadEvents.push(uploadEvent);
      logEvent(uploadEvent);

      const resultEvent: ImageImportEvent = {
        stage: 'upload-result',
        originalUrl: image,
        reason: 'FAILED: upload was not attempted because the upload stage is not wired.',
        storageUrl: null,
      };
      this.uploadEvents.push(resultEvent);
      logEvent(resultEvent);
    }

    if (images.length > 0) {
      this.error('upload', NO_UPLOAD_STAGE_REASON);
    }
  }

  builder(label: string, url: string, reason?: string) {
    const clean = cleanUrl(url);
    if (!clean) return;

    const event: ImageImportEvent = {
      stage: 'builder',
      label,
      builderUrl: clean,
      reason,
    };
    this.builderEvents.push(event);
    logEvent(event);
  }

  preview(label: string, url: string, blankReason?: string) {
    const clean = cleanUrl(url);
    const event: ImageImportEvent = {
      stage: 'preview',
      label,
      previewUrl: clean,
      blankReason: clean ? blankReason : blankReason || 'blank URL',
    };
    this.previewEvents.push(event);
    logEvent(event);
  }

  error(stage: DiagnosticError['stage'], reason: string, detail?: string, url?: string) {
    this.diagnosticErrors.push({ stage, reason, detail, url });
  }

  toResponse() {
    const validationEvents = Array.from(this.validation.values());
    const acceptedImages = validationEvents
      .filter((event) => event.accepted && event.originalUrl)
      .map((event) => event.originalUrl!);
    const rejectedImages = validationEvents
      .filter((event) => !event.accepted && event.originalUrl)
      .map((event) => ({
        url: event.originalUrl!,
        section: event.section,
        reason: event.reason || 'rejected',
      }));

    return {
      imagesFound: this.discovered.size,
      accepted: uniqueUrls(acceptedImages).length,
      rejected: rejectedImages.length,
      uploaded: 0,
      storedUrls: [] as string[],
      builderUrls: this.builderEvents
        .map((event) => toDiagnosticUrl(event.label || 'Builder image', event.builderUrl || '', event.reason))
        .filter(Boolean) as ImageDiagnosticUrl[],
      previewUrls: this.previewEvents
        .map((event) => toDiagnosticUrl(event.label || 'Preview image', event.previewUrl || '', event.reason, event.blankReason))
        .filter(Boolean) as ImageDiagnosticUrl[],
      rejectedImages,
      events: [
        ...this.discovered.values(),
        ...validationEvents,
        ...this.uploadEvents,
        ...this.builderEvents,
        ...this.previewEvents,
      ],
      errors: this.diagnosticErrors,
    };
  }
}

export function recordBuilderDiagnostics(
  recorder: ImageImportFlightRecorder,
  scrape: CatteryWebsiteScrapeResult,
) {
  recorder.builder('Hero image', scrape.heroImage, 'Written from scrape.heroImage into builder data.');
  recorder.builder('Logo image', scrape.logoImage, 'Written from scrape.logoImage into preview import media.');

  scrape.images.forEach((url, index) => {
    recorder.builder(`Builder media image ${index + 1}`, url, 'Written into previewImportRecord.media.images.');
  });

  scrape.galleryImages.forEach((image, index) => {
    recorder.builder(`Builder gallery image ${index + 1}`, image.url, 'Written into previewImportRecord.media.galleryImages.');
  });

  scrape.rooms.forEach((room, index) => {
    recorder.builder(`Builder room image ${index + 1}`, room.image || '', 'Written into builder room/suite data.');
  });

  scrape.services.forEach((service, index) => {
    recorder.builder(`Builder service image ${index + 1}`, service.image || '', 'Written into builder service data.');
  });

  recorder.builder('Builder owner image', scrape.owner.image, 'Written into owner story data.');
}

export function recordPreviewDiagnostics(
  recorder: ImageImportFlightRecorder,
  scrape: CatteryWebsiteScrapeResult,
) {
  collectPreviewUrls(scrape).forEach((image) => {
    recorder.preview(image.label, image.url, image.blankReason);
  });
}

export function collectImportImageUrls(scrape: CatteryWebsiteScrapeResult): string[] {
  return uniqueUrls([
    scrape.heroImage,
    scrape.logoImage,
    ...scrape.images,
    ...scrape.galleryImages.map((image) => image.url),
    ...scrape.rooms.map((room) => room.image || ''),
    ...scrape.services.map((service) => service.image || ''),
    scrape.owner.image,
    ...scrape.siteContentLibrary.blocks.flatMap((block) => [
      ...(block.images ?? []).map((image) => image.url),
      ...(block.items ?? []).map((item) => item.image || ''),
    ]),
  ]);
}

function collectPreviewUrls(scrape: CatteryWebsiteScrapeResult): ImageDiagnosticUrl[] {
  const heroImage = imageFrom(scrape.heroImage, scrape.images[0], scrape.galleryImages[0]?.url);
  const logoImage = scrape.logoImage;
  const galleryImages = uniqueUrls([
    ...scrape.images,
    ...scrape.galleryImages.map((image) => image.url),
    scrape.owner.image,
    heroImage,
  ]).filter((image) => isUsableGalleryImage(image, logoImage));
  const fallbackImages = ensureImageCount(galleryImages, heroImage);
  const usedImages = new Set<string>();
  rememberImage(usedImages, heroImage);

  const aboutImage = pickUniqueImage(usedImages, [fallbackImages.find((image) => image !== heroImage)], fallbackImages);
  const facilityImage = pickUniqueImage(usedImages, [fallbackImages[2]], fallbackImages);
  const ownerImage = pickUniqueImage(usedImages, [scrape.owner.image, fallbackImages[5], fallbackImages[1]], fallbackImages);

  const urls: ImageDiagnosticUrl[] = [
    toPreviewUrl('Preview hero image', heroImage),
    toPreviewUrl('Preview about image', aboutImage),
    toPreviewUrl('Preview facilities image', facilityImage),
    toPreviewUrl('Preview owner image', ownerImage),
  ];

  scrape.rooms.slice(0, 6).forEach((room, index) => {
    urls.push(toPreviewUrl(`Preview suite image ${index + 1}`, pickUniqueImage(usedImages, [room.image, fallbackImages[index]], fallbackImages)));
  });

  scrape.services.slice(0, 12).forEach((service, index) => {
    urls.push(toPreviewUrl(`Preview service image ${index + 1}`, pickUniqueImage(usedImages, [service.image, fallbackImages[index + 3], fallbackImages[index]], fallbackImages)));
  });

  fallbackImages
    .filter((image) => !hasSeenImage(usedImages, image))
    .slice(0, 12)
    .forEach((url, index) => urls.push(toPreviewUrl(`Preview gallery image ${index + 1}`, url)));

  return urls;
}

function toPreviewUrl(label: string, url: string): ImageDiagnosticUrl {
  return {
    label,
    url,
    isSupabaseStorageUrl: isSupabaseStorageUrl(url),
    blankReason: url ? undefined : 'blank URL',
  };
}

function toDiagnosticUrl(
  label: string,
  url: string,
  reason?: string,
  blankReason?: string,
): ImageDiagnosticUrl | null {
  const clean = cleanUrl(url);
  if (!clean && !blankReason) return null;
  return {
    label,
    url: clean,
    isSupabaseStorageUrl: isSupabaseStorageUrl(clean),
    reason,
    blankReason,
  };
}

function validationAcceptanceReason(decodedUrl: string) {
  if (/logo/i.test(decodedUrl)) return 'accepted as logo candidate by current scraper URL rules';
  return 'accepted by current scraper URL rules';
}

function iconRejectionReason(decodedUrl: string) {
  if (/favicon|apple-touch-icon/i.test(decodedUrl)) return 'favicon';
  if (/placeholder/i.test(decodedUrl)) return 'placeholder';
  if (/avatar|profile/i.test(decodedUrl)) return 'profile/avatar';
  return 'icon';
}

function isSupabaseStorageUrl(url: string) {
  return /supabase\.co\/storage\/v1\/object\//i.test(url);
}

function uniqueUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const url of urls) {
    const clean = cleanUrl(url);
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    result.push(clean);
  }
  return result;
}

function cleanUrl(url: string) {
  return typeof url === 'string' ? url.trim() : '';
}

function safeDecode(url: string) {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

function imageKeyForDiagnostics(image?: string): string {
  if (!image) return '';
  try {
    const url = new URL(image);
    const normalizedPath = url.pathname.replace(/-\d+x\d+(?=\.[^.]+$)/i, '');
    return `${url.origin}${normalizedPath}`.toLowerCase();
  } catch {
    return image.split('?')[0].replace(/-\d+x\d+(?=\.[^.]+$)/i, '').toLowerCase();
  }
}

function imageFrom(...values: unknown[]): string {
  for (const value of values) {
    const image = typeof value === 'string' ? value.trim() : '';
    if (/^https?:\/\//i.test(image) || /^data:image\//i.test(image)) return image;
  }
  return '';
}

function isUsableGalleryImage(image: string, logoImage?: string): boolean {
  const normalized = image.split('?')[0].toLowerCase();
  const logoKey = logoImage?.split('?')[0].toLowerCase();
  if (!normalized) return false;
  if (logoKey && normalized === logoKey) return false;
  const decoded = safeDecode(normalized);
  return !/logo|favicon|apple-touch-icon|icon|avatar|profile|placeholder|silhouette|black.?cat|catstays|\/cat(?:[-_][a-z0-9]+)?\.png$/i.test(decoded);
}

function ensureImageCount(images: string[], heroImage: string): string[] {
  return uniqueUrls([
    ...images,
    heroImage,
    'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1573865526739-10c1de0e0ef2?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&h=900&fit=crop',
  ]);
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
  const preferredImages = uniqueUrls(preferred.map((value) => (typeof value === 'string' ? value : ''))).filter((image) =>
    isUsableGalleryImage(image),
  );
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

function logEvent(event: ImageImportEvent) {
  console.info(`${DEBUG_PREFIX} ${event.stage}`, event);
}
