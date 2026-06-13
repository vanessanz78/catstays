import {
  buildCatstaysTemplateContent,
  normalizePreviewTemplateId,
  type CatstaysTemplateContent,
  type PreviewImportRecord,
  type PreviewTemplateId,
} from './previewTemplates';

export type ContentCoverageCategory =
  | 'business'
  | 'hero'
  | 'features'
  | 'facilities'
  | 'rooms'
  | 'services'
  | 'gallery'
  | 'testimonials'
  | 'faqs'
  | 'owner'
  | 'commitment'
  | 'location'
  | 'virtualTour'
  | 'contact';

export type ContentCoverageStatus = 'covered' | 'partial' | 'missing' | 'not-found';

export interface ContentCoverageAuditItem {
  category: ContentCoverageCategory;
  label: string;
  sourceCount: number;
  preparedCount: number;
  status: ContentCoverageStatus;
  destinations: string[];
  notes: string[];
}

export interface ContentCoverageAuditSummary {
  totalCategories: number;
  coveredCategories: number;
  partialCategories: number;
  missingCategories: number;
  sourceItems: number;
  preparedItems: number;
}

export interface ContentCoverageAudit {
  businessName: string;
  sourceUrl?: string;
  templateId: PreviewTemplateId;
  summary: ContentCoverageAuditSummary;
  items: ContentCoverageAuditItem[];
  recommendations: string[];
}

type AuditInput = Record<string, any>;

interface CountAuditOptions {
  category: ContentCoverageCategory;
  label: string;
  sourceCount: number;
  preparedCount: number;
  destinations: string[];
  notes?: string[];
}

export function createContentCoverageAudit(input: AuditInput): ContentCoverageAudit {
  const record = getPreviewRecord(input);
  const normalized = getNormalizedData(input, record);
  const content = buildCatstaysTemplateContent(input);
  const templateId = normalizePreviewTemplateId(input.selectedTemplateId ?? input.selectedTemplate ?? record?.selectedTemplate);

  const items: ContentCoverageAuditItem[] = [
    auditPresence({
      category: 'business',
      label: 'Business identity',
      sourcePresent: Boolean(
        record?.identity?.businessName ||
          normalized.businessName ||
          input.businessName ||
          content.business.name,
      ),
      preparedPresent: Boolean(content.business.name),
      destinations: ['Template header', 'Hero section', 'Footer'],
    }),
    auditPresence({
      category: 'hero',
      label: 'Hero content',
      sourcePresent: Boolean(record?.media?.heroImage || normalized.heroImage || input.heroImage),
      preparedPresent: Boolean(content.hero.image && content.hero.heading),
      destinations: ['Hero image', 'Hero heading', 'Primary call to action'],
    }),
    auditCount({
      category: 'features',
      label: 'Why choose / feature cards',
      sourceCount: maxCount(
        record?.content?.highlights,
        getLibraryItems(content, 'why-choose'),
        normalized.whyChooseData?.items,
        input.whyChooseData?.items,
      ),
      preparedCount: Math.max(content.features.length, content.whyChoose.items.length),
      destinations: ['FeatureRow', 'Why choose section'],
      notes: cappedNote(
        maxCount(
          record?.content?.highlights,
          getLibraryItems(content, 'why-choose'),
          normalized.whyChooseData?.items,
          input.whyChooseData?.items,
        ),
        content.whyChoose.items.length,
        'Feature cards are still tied to the current visual reference until adaptive grids are added.',
      ),
    }),
    auditCount({
      category: 'facilities',
      label: 'Facility and care details',
      sourceCount:
        maxCount(getLibraryItems(content, 'facilities'), normalized.facilitiesData?.items, input.facilitiesData?.items) +
        (hasBlock(content, 'daily-care') || normalized.dailyCareData ? 1 : 0),
      preparedCount: content.facilities.items.length,
      destinations: ['FacilitiesDetailSection', 'Care section'],
    }),
    auditCount({
      category: 'rooms',
      label: 'Rooms / suites',
      sourceCount: maxCount(record?.rooms, getLibraryItems(content, 'rooms'), normalized.suitesData?.suites, input.suitesData?.suites),
      preparedCount: content.suites.length,
      destinations: ['SuitesGrid', 'Room cards', 'Booking context'],
    }),
    auditCount({
      category: 'services',
      label: 'Additional services',
      sourceCount: maxCount(
        record?.services,
        getLibraryItems(content, 'services'),
        normalized.servicesData?.services,
        input.servicesData?.services,
      ),
      preparedCount: content.services.length,
      destinations: ['ServicesGrid', 'Extra care section'],
    }),
    auditCount({
      category: 'gallery',
      label: 'Gallery images',
      sourceCount: uniqueImageSources(input, record, content).length,
      preparedCount: content.gallery.length,
      destinations: ['GalleryStrip', 'ShowcaseGalleryRail', 'Image carousel'],
      notes: cappedNote(
        uniqueImageSources(input, record, content).length,
        content.gallery.length,
        'Prepared gallery is currently capped before rendering; adaptive gallery should keep every image accessible.',
      ),
    }),
    auditCount({
      category: 'testimonials',
      label: 'Reviews and testimonials',
      sourceCount: maxCount(
        record?.contentLibrary?.blocks?.find((block: any) => block.category === 'reviews')?.items,
        getLibraryItems(content, 'reviews'),
        normalized.testimonialsData?.testimonials,
        input.testimonialsData?.testimonials,
      ),
      preparedCount: content.testimonials.length,
      destinations: ['ReviewsSection', 'TestimonialBanner'],
      notes: content.testimonials.length > 10 ? ['Review rendering should remain carousel-based so every review stays accessible.'] : [],
    }),
    auditCount({
      category: 'faqs',
      label: 'FAQs',
      sourceCount: maxCount(record?.faqs, getLibraryItems(content, 'faqs'), normalized.faqData?.faqs, input.faqData?.faqs),
      preparedCount: content.faqs.length,
      destinations: ['Footer FAQ links', 'Future chatbot knowledge source'],
      notes: content.faqs.length > 8 ? ['Footer preview shows a small FAQ sample; adaptive routing should keep every FAQ accessible.'] : [],
    }),
    auditPresence({
      category: 'owner',
      label: 'Owner story',
      sourcePresent: Boolean(getLibraryBlock(content, 'owner-story') || normalized.ownerData || input.ownerData),
      preparedPresent: Boolean(content.owner?.title && content.owner?.text),
      destinations: ['OwnerStorySection', 'About section'],
    }),
    auditCount({
      category: 'commitment',
      label: 'Commitment / trust points',
      sourceCount: maxCount(getLibraryItems(content, 'commitment'), normalized.commitmentData?.items, input.commitmentData?.items),
      preparedCount: content.commitment.items.length,
      destinations: ['Commitment section', 'Trust point row'],
      notes: cappedNote(
        maxCount(getLibraryItems(content, 'commitment'), normalized.commitmentData?.items, input.commitmentData?.items),
        content.commitment.items.length,
        'Commitment items are currently capped to fit the visual reference.',
      ),
    }),
    auditPresence({
      category: 'location',
      label: 'Location and directions',
      sourcePresent: Boolean(getLibraryBlock(content, 'location') || normalized.locationData || input.locationData || record?.contact?.address),
      preparedPresent: Boolean(content.footer.address || content.locationDetails.text || content.locationDetails.directions),
      destinations: ['LocationSection', 'Footer contact details'],
    }),
    auditPresence({
      category: 'virtualTour',
      label: 'Virtual tour',
      sourcePresent: Boolean(
        normalized.locationData?.virtualTourUrl ||
          input.locationData?.virtualTourUrl ||
          getLibraryBlock(content, 'virtual-tour'),
      ),
      preparedPresent: Boolean(content.locationDetails.virtualTourUrl),
      destinations: ['VirtualTourSection'],
    }),
    auditPresence({
      category: 'contact',
      label: 'Contact details and enquiry form',
      sourcePresent: Boolean(
        record?.contact?.phone ||
          record?.contact?.email ||
          normalized.phone ||
          normalized.email ||
          input.phone ||
          input.email,
      ),
      preparedPresent: Boolean(content.footer.phone || content.footer.email || content.footer.address),
      destinations: ['ContactFormSection', 'Footer contact details'],
    }),
  ];

  const summary = buildSummary(items);

  return {
    businessName: content.business.name,
    sourceUrl: record?.source?.url ?? input.sourceUrl,
    templateId,
    summary,
    items,
    recommendations: buildRecommendations(items),
  };
}

export function summarizeContentCoverage(audit: ContentCoverageAudit): string {
  const missing = audit.items.filter((item) => item.status === 'missing' || item.status === 'partial');
  if (!missing.length) {
    return `${audit.businessName}: all ${audit.summary.totalCategories} tracked content categories are prepared for preview rendering.`;
  }

  const labels = missing.map((item) => `${item.label} (${item.preparedCount}/${item.sourceCount})`).join(', ');
  return `${audit.businessName}: ${missing.length} content categories need adaptive layout attention: ${labels}.`;
}

function getPreviewRecord(input: AuditInput): PreviewImportRecord | undefined {
  return (input.previewImportRecord ?? input.__previewImportRecord) as PreviewImportRecord | undefined;
}

function getNormalizedData(input: AuditInput, record?: PreviewImportRecord): Record<string, any> {
  return ((record?.normalizedPreviewData ?? input) as Record<string, any>) || {};
}

function auditCount(options: CountAuditOptions): ContentCoverageAuditItem {
  const sourceCount = normalizeCount(options.sourceCount);
  const preparedCount = normalizeCount(options.preparedCount);

  return {
    category: options.category,
    label: options.label,
    sourceCount,
    preparedCount,
    status: statusFor(sourceCount, preparedCount),
    destinations: options.destinations,
    notes: options.notes ?? [],
  };
}

function auditPresence(options: {
  category: ContentCoverageCategory;
  label: string;
  sourcePresent: boolean;
  preparedPresent: boolean;
  destinations: string[];
  notes?: string[];
}): ContentCoverageAuditItem {
  return auditCount({
    category: options.category,
    label: options.label,
    sourceCount: options.sourcePresent ? 1 : 0,
    preparedCount: options.preparedPresent ? 1 : 0,
    destinations: options.destinations,
    notes: options.notes,
  });
}

function statusFor(sourceCount: number, preparedCount: number): ContentCoverageStatus {
  if (!sourceCount) return 'not-found';
  if (!preparedCount) return 'missing';
  if (preparedCount < sourceCount) return 'partial';
  return 'covered';
}

function buildSummary(items: ContentCoverageAuditItem[]): ContentCoverageAuditSummary {
  return {
    totalCategories: items.length,
    coveredCategories: items.filter((item) => item.status === 'covered').length,
    partialCategories: items.filter((item) => item.status === 'partial').length,
    missingCategories: items.filter((item) => item.status === 'missing').length,
    sourceItems: items.reduce((total, item) => total + item.sourceCount, 0),
    preparedItems: items.reduce((total, item) => total + item.preparedCount, 0),
  };
}

function buildRecommendations(items: ContentCoverageAuditItem[]): string[] {
  return items
    .filter((item) => item.status === 'partial' || item.status === 'missing')
    .map((item) => {
      const missing = Math.max(item.sourceCount - item.preparedCount, 0);
      return `${item.label}: route ${missing || 'all'} additional source item(s) into an adaptive section before publishing.`;
    });
}

function normalizeCount(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function maxCount(...values: unknown[]): number {
  return Math.max(0, ...values.map((value) => arrayFrom(value).length));
}

function cappedNote(sourceCount: number, preparedCount: number, note: string): string[] {
  return sourceCount > preparedCount ? [note] : [];
}

function arrayFrom(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function getLibraryBlock(content: CatstaysTemplateContent, category: string): any | undefined {
  const blocks = arrayFrom(content.contentLibrary?.blocks);
  return blocks.find((block) => block?.category === category);
}

function getLibraryItems(content: CatstaysTemplateContent, category: string): any[] {
  return arrayFrom(getLibraryBlock(content, category)?.items);
}

function hasBlock(content: CatstaysTemplateContent, category: string): boolean {
  return Boolean(getLibraryBlock(content, category));
}

function uniqueImageSources(input: AuditInput, record: PreviewImportRecord | undefined, content: CatstaysTemplateContent): string[] {
  const candidates = [
    ...arrayFrom(record?.media?.images),
    ...arrayFrom(input.galleryImages),
    ...arrayFrom((record?.normalizedPreviewData as Record<string, any> | undefined)?.galleryImages),
    ...arrayFrom(getLibraryBlock(content, 'gallery')?.images),
    ...arrayFrom(getLibraryItems(content, 'gallery')),
  ];

  return Array.from(
    new Set(
      candidates
        .map((image) => imageUrlFrom(image))
        .filter((url): url is string => Boolean(url)),
    ),
  );
}

function imageUrlFrom(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, any>;
  const url = record.url ?? record.src ?? record.image ?? record.imageUrl;
  return typeof url === 'string' && url.trim() ? url.trim() : undefined;
}
