import { createHash } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CatteryWebsiteScrapeResult } from './catteryWebsiteScraper';

export type OpenHomeContentSourceType =
  | 'website'
  | 'google_business'
  | 'facebook'
  | 'instagram'
  | 'booking_com'
  | 'uploaded_image'
  | 'pdf'
  | 'manual'
  | 'ai_generated'
  | 'other';

export type OpenHomeContentSourceStatus = 'pending' | 'importing' | 'ready' | 'failed' | 'archived';

export type ContentSourceRecord = {
  id: string;
  cattery_id: string;
  source_type: OpenHomeContentSourceType;
  source_url: string | null;
  source_name: string | null;
  raw_data: Record<string, unknown>;
  normalized_data: Record<string, unknown>;
  content_hash: string | null;
  import_version: string | null;
  schema_version: number;
  status: OpenHomeContentSourceStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateContentSourceInput = {
  catteryId: string;
  sourceType?: OpenHomeContentSourceType;
  sourceUrl?: string | null;
  sourceName?: string | null;
  rawData?: unknown;
  normalizedData?: unknown;
  status?: OpenHomeContentSourceStatus;
  actorId?: string | null;
};

export type UpdateContentSourceStatusInput = {
  sourceId: string;
  status: OpenHomeContentSourceStatus;
  actorId?: string | null;
  eventData?: Record<string, unknown>;
};

const CONTENT_SOURCE_SELECT = [
  'id',
  'cattery_id',
  'source_type',
  'source_url',
  'source_name',
  'raw_data',
  'normalized_data',
  'content_hash',
  'import_version',
  'schema_version',
  'status',
  'created_by',
  'created_at',
  'updated_at',
].join(',');

export function buildContentSourceHash(input: {
  sourceType: OpenHomeContentSourceType;
  sourceUrl?: string | null;
  rawData?: unknown;
  normalizedData?: unknown;
}) {
  return createHash('sha256')
    .update(stableStringify({
      sourceType: input.sourceType,
      sourceUrl: input.sourceUrl || null,
      rawData: input.rawData ?? {},
      normalizedData: input.normalizedData ?? {},
      schemaVersion: 1,
    }))
    .digest('hex');
}

export async function createContentSource(
  supabase: SupabaseClient,
  input: CreateContentSourceInput,
): Promise<ContentSourceRecord> {
  const sourceType = input.sourceType ?? 'website';
  const rawData = jsonObject(input.rawData);
  const normalizedData = jsonObject(input.normalizedData);
  const contentHash = buildContentSourceHash({
    sourceType,
    sourceUrl: input.sourceUrl,
    rawData,
    normalizedData,
  });
  const importVersion = `source-${contentHash.slice(0, 12)}`;
  const status = input.status ?? 'ready';

  const { data, error } = await supabase
    .from('content_sources')
    .insert({
      cattery_id: input.catteryId,
      source_type: sourceType,
      source_url: input.sourceUrl || null,
      source_name: input.sourceName || null,
      raw_data: rawData,
      normalized_data: normalizedData,
      content_hash: contentHash,
      import_version: importVersion,
      schema_version: 1,
      status,
      created_by: input.actorId || null,
    })
    .select(CONTENT_SOURCE_SELECT)
    .single();

  if (error || !data) {
    throw error ?? new Error('Content source could not be created.');
  }

  const source = data as unknown as ContentSourceRecord;
  await appendWebsiteEvent(supabase, {
    catteryId: input.catteryId,
    sourceId: source.id,
    eventType: 'content_source.created',
    eventData: {
      sourceType,
      sourceUrl: input.sourceUrl || null,
      sourceName: input.sourceName || null,
      status,
      contentHash,
      importVersion,
    },
    actorId: input.actorId,
  });

  await setCurrentSourcePointer(supabase, input.catteryId, source.id);
  return source;
}

export async function createWebsiteContentSourceFromScrape(
  supabase: SupabaseClient,
  input: {
    catteryId: string;
    scrape: CatteryWebsiteScrapeResult;
    actorId?: string | null;
  },
): Promise<ContentSourceRecord> {
  const source = await createContentSource(supabase, {
    catteryId: input.catteryId,
    sourceType: 'website',
    sourceUrl: input.scrape.sourceUrl,
    sourceName: input.scrape.title || input.scrape.heading || input.scrape.sourceHost,
    rawData: input.scrape,
    normalizedData: normalizedDataFromScrape(input.scrape),
    status: 'ready',
    actorId: input.actorId,
  });

  await persistWebsiteSourceDerivatives(supabase, {
    catteryId: input.catteryId,
    sourceId: source.id,
    scrape: input.scrape,
    actorId: input.actorId,
  });

  return source;
}

export async function createContentSourceFromOnboardingDraft(
  supabase: SupabaseClient,
  input: {
    catteryId: string;
    draft: Record<string, unknown>;
    actorId?: string | null;
  },
): Promise<ContentSourceRecord | null> {
  const record = recordFromDraft(input.draft);
  const sourceUrl =
    stringFromPath(record, ['source', 'url']) ||
    stringValue(input.draft['importSourceUrl']) ||
    stringValue(input.draft['sourceUrl']);

  if (!sourceUrl) return null;

  const fallbackPayload = contentSourcePayloadFromDraft(input.draft);
  const normalizedData = jsonObject(
    record['normalizedPreviewData'] ?? input.draft['normalizedPreviewData'] ?? fallbackPayload,
  );

  const sourceName =
    stringFromPath(record, ['identity', 'businessName']) ||
    stringValue(input.draft['businessName']) ||
    stringFromPath(record, ['content', 'title']) ||
    sourceUrl;

  return createContentSource(supabase, {
    catteryId: input.catteryId,
    sourceType: 'website',
    sourceUrl,
    sourceName,
    rawData: Object.keys(record).length > 0 ? record : fallbackPayload,
    normalizedData,
    status: 'ready',
    actorId: input.actorId,
  });
}

const safeOnboardingContentSourceKeys = [
  'businessName',
  'location',
  'websiteUrl',
  'importSourceUrl',
  'sourceUrl',
  'sourceHost',
  'selectedTemplate',
  'liveTemplate',
  'previewRecordStatus',
  'primaryColor',
  'accentColor',
  'backgroundColor',
  'typography',
  'headingFont',
  'subheadingFont',
  'bodyFont',
  'logo',
  'logoImage',
  'heroImage',
  'heroHeading',
  'heroSubheading',
  'heroPrimaryCtaText',
  'heroPrimaryCtaHref',
  'heroSecondaryCtaText',
  'heroSecondaryCtaHref',
  'aboutText',
  'aboutHeading',
  'aboutImage',
  'whyChooseUsData',
  'whyChooseUsHeading',
  'whyChooseUsText',
  'whyChooseUsFeatures',
  'facilitiesData',
  'facilitiesHeading',
  'facilitiesText',
  'facilitiesImage',
  'facilityFeatures',
  'suitesData',
  'suitesHeading',
  'suites',
  'servicesData',
  'additionalServicesHeading',
  'additionalServices',
  'galleryData',
  'galleryHeading',
  'galleryImages',
  'testimonialsData',
  'testimonialsHeading',
  'testimonials',
  'faqData',
  'faqHeading',
  'faqs',
  'commitmentData',
  'ownerData',
  'locationData',
  'contactData',
  'socialLinks',
  'virtualTourUrl',
  'footerAbout',
  'siteContentLibrary',
  'contentLibrary',
  'sectionsOrder',
] as const;

function contentSourcePayloadFromDraft(draft: Record<string, unknown>) {
  const payload = safeOnboardingContentSourceKeys.reduce<Record<string, unknown>>((result, key) => {
    if (draft[key] !== undefined) result[key] = draft[key];
    return result;
  }, {});

  const sourceUrl = stringValue(payload['sourceUrl']) || stringValue(payload['importSourceUrl']) || stringValue(payload['websiteUrl']);
  if (sourceUrl) payload['sourceUrl'] = sourceUrl;

  return payload;
}

export async function listContentSources(
  supabase: SupabaseClient,
  catteryId: string,
): Promise<ContentSourceRecord[]> {
  const { data, error } = await supabase
    .from('content_sources')
    .select(CONTENT_SOURCE_SELECT)
    .eq('cattery_id', catteryId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as ContentSourceRecord[];
}

export async function getContentSource(
  supabase: SupabaseClient,
  sourceId: string,
): Promise<ContentSourceRecord | null> {
  const { data, error } = await supabase
    .from('content_sources')
    .select(CONTENT_SOURCE_SELECT)
    .eq('id', sourceId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as ContentSourceRecord | null;
}

export async function updateContentSourceStatus(
  supabase: SupabaseClient,
  input: UpdateContentSourceStatusInput,
): Promise<ContentSourceRecord> {
  const { data, error } = await supabase
    .from('content_sources')
    .update({ status: input.status })
    .eq('id', input.sourceId)
    .select(CONTENT_SOURCE_SELECT)
    .single();

  if (error || !data) {
    throw error ?? new Error('Content source status could not be updated.');
  }

  const source = data as unknown as ContentSourceRecord;
  await appendWebsiteEvent(supabase, {
    catteryId: source.cattery_id,
    sourceId: source.id,
    eventType: 'content_source.status_changed',
    eventData: {
      status: input.status,
      ...(input.eventData ?? {}),
    },
    actorId: input.actorId,
  });

  return source;
}

function normalizedDataFromScrape(scrape: CatteryWebsiteScrapeResult) {
  const importedAssets = importedImageAssets(scrape);
  return {
    sourceUrl: scrape.sourceUrl,
    sourceHost: scrape.sourceHost,
    title: scrape.title,
    description: scrape.description,
    heading: scrape.heading,
    contact: {
      phone: scrape.phone,
      email: scrape.email,
      address: scrape.address,
      city: scrape.city,
      country: scrape.country,
    },
    media: {
      heroImage: scrape.heroImage,
      logoImage: scrape.logoImage,
      images: scrape.images,
      galleryImages: scrape.galleryImages,
    },
    siteContentLibrary: scrape.siteContentLibrary,
    websiteSettings: scrape.websiteSettings,
    crawl: scrape.crawl,
    importReport: {
      pagesFound: scrape.crawl?.pagesFound ?? 1,
      pagesProcessed: scrape.crawl?.pagesProcessed ?? 1,
      pagesFailed: scrape.crawl?.pagesFailed ?? 0,
      imagesFound: scrape.crawl?.imagesFound ?? scrape.images.length,
      imagesImported: importedAssets.length,
      contentBlocks: scrape.siteContentLibrary?.blocks?.length ?? 0,
    },
  };
}

async function persistWebsiteSourceDerivatives(
  supabase: SupabaseClient,
  input: {
    catteryId: string;
    sourceId: string;
    scrape: CatteryWebsiteScrapeResult;
    actorId?: string | null;
  },
) {
  const contentRows = contentLibraryRows(input.catteryId, input.sourceId, input.scrape);
  const mediaRows = mediaLibraryRows(input.catteryId, input.sourceId, input.scrape);
  const assetManifest = {
    importedImageAssets: importedImageAssets(input.scrape),
    imagesFound: input.scrape.crawl?.imagesFound ?? input.scrape.images.length,
    imagesImported: mediaRows.length,
  };

  try {
    if (contentRows.length) {
      const { error } = await supabase.from('content_library').insert(contentRows);
      if (error) throw error;
    }

    if (mediaRows.length) {
      const { error } = await supabase.from('media_library').insert(mediaRows);
      if (error) throw error;
    }

    const { error: updateError } = await supabase
      .from('content_sources')
      .update({
        storage_bucket: mediaRows[0]?.storage_bucket ?? null,
        storage_prefix: storagePrefixFromPath(mediaRows[0]?.storage_path),
        asset_manifest: assetManifest,
        preview_snapshot: input.scrape.websiteSettings ?? {},
        selected_template: 'original',
        last_imported_at: new Date().toISOString(),
      })
      .eq('id', input.sourceId);
    if (updateError) throw updateError;

    await appendWebsiteEvent(supabase, {
      catteryId: input.catteryId,
      sourceId: input.sourceId,
      eventType: 'content_source.derivatives_persisted',
      eventData: {
        contentBlocks: contentRows.length,
        mediaAssets: mediaRows.length,
        pagesProcessed: input.scrape.crawl?.pagesProcessed ?? 1,
      },
      actorId: input.actorId,
    });
  } catch (error) {
    await appendWebsiteEvent(supabase, {
      catteryId: input.catteryId,
      sourceId: input.sourceId,
      eventType: 'content_source.derivatives_failed',
      eventData: {
        message: error instanceof Error ? error.message : 'Derivative persistence failed.',
      },
      actorId: input.actorId,
    });
  }
}

function contentLibraryRows(catteryId: string, sourceId: string, scrape: CatteryWebsiteScrapeResult) {
  const blocks = scrape.siteContentLibrary?.blocks ?? [];
  return blocks
    .filter((block) => block.title || block.text || block.items?.length || block.images?.length)
    .map((block, index) => ({
      cattery_id: catteryId,
      source_id: sourceId,
      content_type: block.category || 'section',
      content_key: block.id || `${block.category || 'section'}-${index + 1}`,
      title: block.title || null,
      body: block.text || null,
      structured_data: {
        items: block.items ?? [],
        images: block.images ?? [],
        links: block.links ?? [],
        sourceUrl: block.sourceUrl ?? scrape.sourceUrl,
      },
      confidence: block.source === 'scrape' ? 0.94 : 0.4,
      language: 'en',
      source_label: block.sourceUrl ?? scrape.sourceUrl,
      extraction_version: 'full-site-import-v1',
      schema_version: 1,
      source_page_url: block.sourceUrl ?? scrape.sourceUrl,
      section_key: block.category || block.id || 'section',
      sort_order: index,
    }));
}

function mediaLibraryRows(catteryId: string, sourceId: string, scrape: CatteryWebsiteScrapeResult) {
  const importedAssets = importedImageAssets(scrape);
  const pageImagesByStoredUrl = pageImageMetadataByUrl(scrape);

  return importedAssets.map((asset, index) => {
    const metadata = pageImagesByStoredUrl.get(asset.storedUrl) ?? pageImagesByStoredUrl.get(asset.originalUrl);
    const category = imageCategory(asset.originalUrl, metadata?.sourcePageUrl ?? '', metadata?.altText ?? '');

    return {
      cattery_id: catteryId,
      source_id: sourceId,
      original_url: asset.originalUrl,
      storage_url: asset.storedUrl,
      mime_type: asset.contentType,
      category,
      confidence: 0.86,
      alt_text: metadata?.altText ?? null,
      contains_text: false,
      is_logo: category === 'logo',
      is_open_graph: /og:image|open-graph/i.test(asset.originalUrl),
      is_owner: category === 'owner',
      is_building: category === 'facility' || category === 'exterior',
      is_suite: category === 'accommodation',
      is_gallery: category === 'gallery' || index > 1,
      metadata: {
        caption: metadata?.caption ?? null,
        sourcePageUrl: metadata?.sourcePageUrl ?? scrape.sourceUrl,
      },
      schema_version: 1,
      storage_bucket: 'catstays-media',
      storage_path: asset.path,
      sha256: shaFromStoragePath(asset.path),
      asset_role: index === 0 ? 'hero_candidate' : category,
      source_page_url: metadata?.sourcePageUrl ?? scrape.sourceUrl,
      persisted_at: new Date().toISOString(),
      status: 'captured',
    };
  });
}

function importedImageAssets(scrape: CatteryWebsiteScrapeResult): Array<{
  originalUrl: string;
  storedUrl: string;
  path: string;
  contentType: string;
}> {
  const assets = scrape.websiteSettings?.['importedImageAssets'];
  return Array.isArray(assets)
    ? assets.filter((asset): asset is { originalUrl: string; storedUrl: string; path: string; contentType: string } =>
        Boolean(asset && typeof asset.originalUrl === 'string' && typeof asset.storedUrl === 'string' && typeof asset.path === 'string'),
      )
    : [];
}

function pageImageMetadataByUrl(scrape: CatteryWebsiteScrapeResult) {
  const metadata = new Map<string, { altText?: string; caption?: string; sourcePageUrl?: string }>();
  for (const page of scrape.crawl?.pages ?? []) {
    for (const image of page.images ?? []) {
      metadata.set(image.url, {
        altText: image.altText,
        caption: image.caption,
        sourcePageUrl: image.sourcePageUrl,
      });
    }
  }
  return metadata;
}

function imageCategory(url: string, sourcePageUrl: string, altText: string): string {
  const text = `${url} ${sourcePageUrl} ${altText}`.toLowerCase();
  if (/logo|brand/.test(text)) return 'logo';
  if (/hero|banner|og:image/.test(text)) return 'hero';
  if (/room|suite|accommodation|boarding/.test(text)) return 'accommodation';
  if (/gallery|photo|cat|kitten/.test(text)) return 'gallery';
  if (/facility|interior|indoor|exterior|building|garden/.test(text)) return 'facility';
  if (/owner|team|staff/.test(text)) return 'owner';
  return 'image';
}

function storagePrefixFromPath(path?: string | null) {
  if (!path) return null;
  const parts = path.split('/');
  return parts.length > 1 ? parts.slice(0, -1).join('/') : null;
}

function shaFromStoragePath(path: string) {
  return path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? null;
}

async function appendWebsiteEvent(
  supabase: SupabaseClient,
  input: {
    catteryId: string;
    sourceId: string;
    eventType: string;
    eventData: Record<string, unknown>;
    actorId?: string | null;
  },
) {
  const { error } = await supabase.from('website_events').insert({
    cattery_id: input.catteryId,
    source_id: input.sourceId,
    event_type: input.eventType,
    event_data: input.eventData,
    actor_id: input.actorId || null,
  });

  if (error) throw error;
}

async function setCurrentSourcePointer(
  supabase: SupabaseClient,
  catteryId: string,
  sourceId: string,
) {
  const { error } = await supabase
    .from('catteries')
    .update({ current_source_id: sourceId })
    .eq('id', catteryId);

  if (error) throw error;
}

function jsonObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function recordFromDraft(draft: Record<string, unknown>): Record<string, unknown> {
  const record = draft['previewImportRecord'];
  return jsonObject(record);
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function stringFromPath(source: Record<string, unknown>, path: string[]): string {
  let current: unknown = source;
  for (const key of path) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) return '';
    current = (current as Record<string, unknown>)[key];
  }
  return stringValue(current);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .filter((key) => record[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}
