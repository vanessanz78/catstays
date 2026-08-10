import {
  buildWebsiteUnderstandingModel,
  type SourceTruthImage,
  type WebsiteUnderstandingModel,
  type WebsiteUnderstandingSection,
} from './sourceUnderstanding';

export type ContentClusterRole =
  | 'opening'
  | 'primary_offer'
  | 'property'
  | 'host'
  | 'pet_suitability'
  | 'rooms'
  | 'amenities'
  | 'rules'
  | 'pricing'
  | 'availability'
  | 'trust'
  | 'testimonials'
  | 'location'
  | 'faq'
  | 'contact'
  | 'secondary_offer'
  | 'footer'
  | 'source_archive';

export type TemplateSlot =
  | 'hero'
  | 'trust'
  | 'primary-offer'
  | 'rooms'
  | 'pet-fit'
  | 'amenities'
  | 'story'
  | 'visual-proof'
  | 'location'
  | 'booking'
  | 'faq'
  | 'footer';

export interface CapturedTextBlock {
  heading: string;
  text: string;
  sourceSectionId: string;
  sourcePageUrl: string;
}

export interface CapturedImage {
  url: string;
  originalUrl?: string;
  caption?: string;
  alt?: string;
  sourcePageUrl?: string;
  sourceSectionId?: string;
  sourceOrder: number;
  nearbyHeading?: string;
  nearbyText?: string;
}

export interface CapturedMedia {
  url: string;
  type: 'image' | 'video' | 'document' | 'unknown';
  sourcePageUrl?: string;
  sourceOrder: number;
}

export interface CapturedLink {
  label: string;
  url: string;
}

export interface CapturedForm {
  label: string;
  action?: string;
  sourcePageUrl?: string;
}

export interface SourceProvenance {
  source: 'sourceArchive.pages' | 'siteContentLibrary.blocks' | 'previewImportRecord' | 'derived';
  sourcePageUrl?: string;
  sourceSectionId?: string;
  sourceOrder: number;
}

export interface SourcePagePlan {
  url: string;
  title: string;
  sourceOrder: number;
  clusterIds: string[];
}

export interface AnchorNavItem {
  label: string;
  href: string;
  clusterId: string;
  role: ContentClusterRole;
}

export interface ContentCluster {
  id: string;
  role: ContentClusterRole;
  title: string;
  sourcePageUrl: string;
  sourceOrder: number;
  originalHeading?: string;
  blocks: CapturedTextBlock[];
  images: CapturedImage[];
  media: CapturedMedia[];
  links: CapturedLink[];
  forms: CapturedForm[];
  provenance: SourceProvenance[];
  priority: 'primary' | 'supporting' | 'secondary';
  confidence: 'high' | 'medium' | 'low';
}

export interface TemplateSlotPayload {
  slot: TemplateSlot;
  clusterIds: string[];
  renderingIntent: string;
}

export interface CompletenessMetrics {
  sourcePagesCaptured: number;
  textBlocksRepresented: number;
  imagesRepresented: number;
  mediaRepresented: number;
  linksRepresented: number;
  formsRepresented: number;
  faqsRepresented: number;
  clustersGenerated: number;
  templateSlotsPopulated: number;
  contentDeferredToSourceArchive: number;
  unsupportedFunctionality: number;
}

export interface UnsupportedItem {
  kind: 'stock_image' | 'low_confidence_import' | 'form' | 'script' | 'unknown';
  reason: string;
  sourcePageUrl?: string;
  value?: string;
}

export interface ContentIntelligencePlan {
  primaryPurpose: string;
  audienceIntent: string;
  sourcePages: SourcePagePlan[];
  onePageNav: AnchorNavItem[];
  clusters: ContentCluster[];
  templateSlots: TemplateSlotPayload[];
  completeness: CompletenessMetrics;
  unsupported: UnsupportedItem[];
}

export function buildContentIntelligencePlan(data: Record<string, unknown>): ContentIntelligencePlan {
  return contentIntelligencePlanFromModel(buildWebsiteUnderstandingModel(data));
}

export function contentIntelligencePlanFromModel(model: WebsiteUnderstandingModel): ContentIntelligencePlan {
  const clusters = model.sections
    .map((section) => clusterFromSection(section, model))
    .sort((left, right) => left.sourceOrder - right.sourceOrder);
  const sourcePages = sourcePagesFromClusters(clusters);
  const templateSlots = templateSlotsFromClusters(clusters);
  const onePageNav = clusters
    .filter((cluster) => cluster.priority !== 'secondary')
    .slice(0, 8)
    .map((cluster) => ({
      label: navLabelForCluster(cluster),
      href: `#${cluster.id}`,
      clusterId: cluster.id,
      role: cluster.role,
    }));
  const unsupported = unsupportedItemsFromModel(model);

  return {
    primaryPurpose: inferPrimaryPurpose(model, clusters),
    audienceIntent: inferAudienceIntent(model, clusters),
    sourcePages,
    onePageNav,
    clusters,
    templateSlots,
    completeness: {
      sourcePagesCaptured: sourcePages.length,
      textBlocksRepresented: clusters.reduce((sum, cluster) => sum + cluster.blocks.length, 0),
      imagesRepresented: uniqueImageCount(clusters.flatMap((cluster) => cluster.images)),
      mediaRepresented: clusters.reduce((sum, cluster) => sum + cluster.media.length, 0),
      linksRepresented: clusters.reduce((sum, cluster) => sum + cluster.links.length, 0),
      formsRepresented: clusters.reduce((sum, cluster) => sum + cluster.forms.length, 0),
      faqsRepresented: clusters.filter((cluster) => cluster.role === 'faq').reduce((sum, cluster) => sum + cluster.blocks.length, 0),
      clustersGenerated: clusters.length,
      templateSlotsPopulated: templateSlots.filter((slot) => slot.clusterIds.length).length,
      contentDeferredToSourceArchive: clusters.filter((cluster) => cluster.role === 'source_archive').length,
      unsupportedFunctionality: unsupported.length,
    },
    unsupported,
  };
}

function clusterFromSection(section: WebsiteUnderstandingSection, model: WebsiteUnderstandingModel): ContentCluster {
  const role = clusterRoleForSection(section);
  const blocks = blocksFromSection(section, model.identity.sourceUrl);
  const images = imagesFromSection(section);

  return {
    id: section.id,
    role,
    title: section.heading || roleLabel(role),
    sourcePageUrl: section.sourcePage || model.identity.sourceUrl,
    sourceOrder: section.sourceOrder,
    originalHeading: section.heading,
    blocks,
    images,
    media: images.map((image) => ({
      url: image.url,
      type: 'image',
      sourcePageUrl: image.sourcePageUrl,
      sourceOrder: image.sourceOrder,
    })),
    links: section.links,
    forms: [],
    provenance: [{
      source: provenanceSource(section),
      sourcePageUrl: section.sourcePage,
      sourceSectionId: section.id,
      sourceOrder: section.sourceOrder,
    }],
    priority: priorityForRole(role, section.sourceOrder),
    confidence: confidenceForSection(section, role),
  };
}

function blocksFromSection(section: WebsiteUnderstandingSection, fallbackSourceUrl: string): CapturedTextBlock[] {
  const sourcePageUrl = section.sourcePage || fallbackSourceUrl;
  const blocks: CapturedTextBlock[] = [];
  if (section.body) {
    blocks.push({
      heading: section.heading,
      text: section.body,
      sourceSectionId: section.id,
      sourcePageUrl,
    });
  }

  section.items.forEach((item, index) => {
    const text = [item.text, item.price].filter(Boolean).join(item.text && item.price ? ' ' : '');
    if (!item.title && !text) return;
    blocks.push({
      heading: item.title || section.heading,
      text,
      sourceSectionId: `${section.id}__item_${index}`,
      sourcePageUrl,
    });
  });

  return blocks;
}

function imagesFromSection(section: WebsiteUnderstandingSection): CapturedImage[] {
  const sectionImages = section.images.map((image) => ({
    url: image.url,
    originalUrl: image.originalUrl,
    caption: image.caption,
    alt: image.caption || image.nearbyHeading,
    sourcePageUrl: image.sourcePage,
    sourceSectionId: image.sourceSectionId || section.id,
    sourceOrder: image.sourceOrder,
    nearbyHeading: image.nearbyHeading,
    nearbyText: image.nearbyText,
  }));
  const itemImages: CapturedImage[] = [];
  section.items.forEach((item, index) => {
    if (!item.image) return;
    itemImages.push({
      url: item.image,
      caption: item.title,
      alt: item.title || section.heading,
      sourcePageUrl: section.sourcePage,
      sourceSectionId: `${section.id}__item_${index}`,
      sourceOrder: section.sourceOrder * 100 + index,
      nearbyHeading: item.title || section.heading,
      nearbyText: item.text || section.body,
    });
  });

  return uniqueCapturedImages([...sectionImages, ...itemImages]);
}

function uniqueCapturedImages(images: CapturedImage[]) {
  const seen = new Set<string>();
  return images.filter((image) => {
    const key = image.originalUrl || image.url;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function clusterRoleForSection(section: WebsiteUnderstandingSection): ContentClusterRole {
  switch (section.semanticRole) {
    case 'hero':
    case 'introduction':
      return 'opening';
    case 'about':
      return 'primary_offer';
    case 'story':
      return 'host';
    case 'accommodation':
      return 'rooms';
    case 'rooms':
      return 'rooms';
    case 'facilities':
    case 'daily-care':
    case 'features':
      return 'amenities';
    case 'health-care':
      return 'pet_suitability';
    case 'grooming':
    case 'services':
      return 'secondary_offer';
    case 'pricing':
      return 'pricing';
    case 'policies':
      return 'rules';
    case 'testimonials':
      return 'testimonials';
    case 'faq':
      return 'faq';
    case 'booking':
    case 'cta':
      return 'contact';
    case 'contact':
      return 'contact';
    case 'location':
      return 'location';
    case 'footer':
      return 'footer';
    case 'gallery':
      return 'source_archive';
    default:
      return 'source_archive';
  }
}

function templateSlotsFromClusters(clusters: ContentCluster[]): TemplateSlotPayload[] {
  return [
    slotPayload('hero', clusters, ['opening', 'primary_offer'], 'Lead with the source homepage promise and strongest contextual image.'),
    slotPayload('primary-offer', clusters, ['primary_offer', 'rooms'], 'Explain the core stay/service offer before secondary details.'),
    slotPayload('rooms', clusters, ['rooms', 'pricing'], 'Group accommodation, room, and fee evidence in source order.'),
    slotPayload('pet-fit', clusters, ['pet_suitability', 'rules'], 'Surface care, suitability, safety, and pet-specific policies.'),
    slotPayload('amenities', clusters, ['amenities'], 'Show facilities and inclusions with nearby source images.'),
    slotPayload('trust', clusters, ['host', 'trust', 'testimonials'], 'Build trust from host, reviews, and safety signals.'),
    slotPayload('story', clusters, ['host', 'primary_offer'], 'Tell the owner/business story without replacing the offer.'),
    slotPayload('visual-proof', clusters, ['source_archive', 'rooms', 'amenities'], 'Use remaining source photos as visual proof without misleading placement.'),
    slotPayload('location', clusters, ['location'], 'Keep area and address context together.'),
    slotPayload('booking', clusters, ['contact', 'pricing', 'availability'], 'Give the visitor a clear enquiry or booking path.'),
    slotPayload('faq', clusters, ['faq'], 'Preserve source FAQs as decision-support content.'),
    slotPayload('footer', clusters, ['footer', 'contact'], 'Close with contact, hours, social, and source links.'),
  ];
}

function slotPayload(slot: TemplateSlot, clusters: ContentCluster[], roles: ContentClusterRole[], renderingIntent: string): TemplateSlotPayload {
  return {
    slot,
    clusterIds: clusters.filter((cluster) => roles.includes(cluster.role)).map((cluster) => cluster.id),
    renderingIntent,
  };
}

function sourcePagesFromClusters(clusters: ContentCluster[]): SourcePagePlan[] {
  const pages = new Map<string, SourcePagePlan>();
  for (const cluster of clusters) {
    const url = cluster.sourcePageUrl || 'source';
    const existing = pages.get(url);
    if (existing) {
      existing.clusterIds.push(cluster.id);
      existing.sourceOrder = Math.min(existing.sourceOrder, cluster.sourceOrder);
    } else {
      pages.set(url, {
        url,
        title: cluster.originalHeading || cluster.title,
        sourceOrder: cluster.sourceOrder,
        clusterIds: [cluster.id],
      });
    }
  }
  return Array.from(pages.values()).sort((left, right) => left.sourceOrder - right.sourceOrder);
}

function unsupportedItemsFromModel(model: WebsiteUnderstandingModel): UnsupportedItem[] {
  return [
    ...(model.diagnostics.shouldAvoidGenericFallback
      ? [{
          kind: 'low_confidence_import' as const,
          reason: 'Imported source evidence is too thin for a trustworthy generated preview; do not replace it with generic template content.',
          value: model.platform?.contentQuality?.reasons?.join(' ') || model.diagnostics.importPlatform,
        }]
      : []),
    ...model.media.stockImages.map((url) => ({
      kind: 'stock_image' as const,
      reason: 'Stock/demo image was excluded from imported source placement.',
      value: url,
    })),
  ];
}

function inferPrimaryPurpose(model: WebsiteUnderstandingModel, clusters: ContentCluster[]) {
  const hasRooms = clusters.some((cluster) => cluster.role === 'rooms');
  const hasPetCare = clusters.some((cluster) => cluster.role === 'pet_suitability');
  if (hasRooms || hasPetCare) {
    return `Help a pet owner decide whether ${model.identity.businessName} is right for their pet, then enquire or book.`;
  }
  return `Help a visitor understand ${model.identity.businessName} and choose the right next step.`;
}

function inferAudienceIntent(model: WebsiteUnderstandingModel, clusters: ContentCluster[]) {
  const hasPricing = clusters.some((cluster) => cluster.role === 'pricing');
  const hasContact = clusters.some((cluster) => cluster.role === 'contact');
  if (hasPricing && hasContact) return 'Compare care, price, suitability, and booking details.';
  if (hasContact) return 'Understand the offer and make an enquiry.';
  return `Understand what ${model.identity.businessName} offers.`;
}

function priorityForRole(role: ContentClusterRole, sourceOrder: number): ContentCluster['priority'] {
  if (sourceOrder === 0 || ['opening', 'primary_offer', 'rooms', 'contact'].includes(role)) return 'primary';
  if (['source_archive', 'footer', 'secondary_offer'].includes(role)) return 'secondary';
  return 'supporting';
}

function confidenceForSection(section: WebsiteUnderstandingSection, role: ContentClusterRole): ContentCluster['confidence'] {
  if (section.heading && (section.body || section.items.length) && role !== 'source_archive') return 'high';
  if (section.heading || section.body || section.images.length) return 'medium';
  return 'low';
}

function provenanceSource(section: WebsiteUnderstandingSection): SourceProvenance['source'] {
  const source = String(section.relationships?.source || '');
  if (source === 'siteContentLibrary.blocks') return 'siteContentLibrary.blocks';
  if (source === 'sourceArchive.pages') return 'sourceArchive.pages';
  return 'derived';
}

function uniqueImageCount(images: CapturedImage[]) {
  return new Set(images.map((image) => image.originalUrl || image.url)).size;
}

function navLabelForCluster(cluster: ContentCluster) {
  return cluster.title || roleLabel(cluster.role);
}

function roleLabel(role: ContentClusterRole) {
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
