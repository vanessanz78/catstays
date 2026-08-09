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
  storage_bucket: string | null;
  storage_prefix: string | null;
  asset_manifest: Record<string, unknown>;
  preview_snapshot: Record<string, unknown>;
  selected_template: string | null;
  last_imported_at: string | null;
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
  storageBucket?: string | null;
  storagePrefix?: string | null;
  assetManifest?: unknown;
  previewSnapshot?: unknown;
  selectedTemplate?: string | null;
  lastImportedAt?: string | null;
};

export type UpdateContentSourceStatusInput = {
  sourceId: string;
  status: OpenHomeContentSourceStatus;
  actorId?: string | null;
  eventData?: Record<string, unknown>;
};

type ImportedImageAsset = {
  originalUrl: string;
  storedUrl: string;
  path: string;
  contentType: string;
  storageBucket?: string;
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
  'storage_bucket',
  'storage_prefix',
  'asset_manifest',
  'preview_snapshot',
  'selected_template',
  'last_imported_at',
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
  const assetManifest = jsonObject(input.assetManifest);
  const previewSnapshot = jsonObject(input.previewSnapshot);
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
      storage_bucket: input.storageBucket || null,
      storage_prefix: input.storagePrefix || null,
      asset_manifest: assetManifest,
      preview_snapshot: previewSnapshot,
      selected_template: input.selectedTemplate || null,
      last_imported_at: input.lastImportedAt || null,
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
  const assetManifest = assetManifestFromScrape(input.scrape);
  const source = await createContentSource(supabase, {
    catteryId: input.catteryId,
    sourceType: 'website',
    sourceUrl: input.scrape.sourceUrl,
    sourceName: input.scrape.title || input.scrape.heading || input.scrape.sourceHost,
    rawData: input.scrape,
    normalizedData: normalizedDataFromScrape(input.scrape),
    storageBucket: stringValue(assetManifest['storageBucket']),
    storagePrefix: stringValue(assetManifest['storagePrefix']),
    assetManifest,
    previewSnapshot: previewSnapshotFromScrape(input.scrape),
    selectedTemplate: 'original',
    lastImportedAt: input.scrape.sourceArchive.capturedAt,
    status: 'ready',
    actorId: input.actorId,
  });
  await persistWebsiteSourceLibraries(supabase, source, input.scrape);
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
  const payload = Object.keys(record).length > 0 ? record : fallbackPayload;

  const sourceName =
    stringFromPath(record, ['identity', 'businessName']) ||
    stringValue(input.draft['businessName']) ||
    stringFromPath(record, ['content', 'title']) ||
    sourceUrl;

  const source = await createContentSource(supabase, {
    catteryId: input.catteryId,
    sourceType: 'website',
    sourceUrl,
    sourceName,
    rawData: payload,
    normalizedData,
    assetManifest: assetManifestFromPayload(payload, normalizedData),
    previewSnapshot: previewSnapshotFromPayload(payload, normalizedData),
    selectedTemplate: stringValue(input.draft['selectedTemplate']) || stringValue(input.draft['liveTemplate']) || null,
    lastImportedAt: new Date().toISOString(),
    status: 'ready',
    actorId: input.actorId,
  });
  await persistPayloadSourceLibraries(supabase, source, payload, normalizedData);
  return source;
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
  'sourceArchive',
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

async function persistWebsiteSourceLibraries(
  supabase: SupabaseClient,
  source: ContentSourceRecord,
  scrape: CatteryWebsiteScrapeResult,
) {
  const mediaRows = mediaLibraryRowsFromScrape(source, scrape);
  if (mediaRows.length) {
    const { error } = await supabase.from('media_library').insert(mediaRows);
    if (error) throw error;
  }

  const contentRows = contentLibraryRowsFromScrape(source, scrape);
  if (contentRows.length) {
    const { error } = await supabase.from('content_library').insert(contentRows);
    if (error) throw error;
  }
}

async function persistPayloadSourceLibraries(
  supabase: SupabaseClient,
  source: ContentSourceRecord,
  rawData: Record<string, unknown>,
  normalizedData: Record<string, unknown>,
) {
  const mediaRows = mediaLibraryRowsFromPayload(source, rawData, normalizedData);
  if (mediaRows.length) {
    const { error } = await supabase.from('media_library').insert(mediaRows);
    if (error) throw error;
  }

  const contentRows = contentLibraryRowsFromPayload(source, rawData, normalizedData);
  if (contentRows.length) {
    const { error } = await supabase.from('content_library').insert(contentRows);
    if (error) throw error;
  }
}

function assetManifestFromScrape(scrape: CatteryWebsiteScrapeResult): Record<string, unknown> {
  const importedImageAssets = importedImageAssetsFromScrape(scrape);
  const firstStoredAsset = importedImageAssets[0];
  const storageBucket = firstStoredAsset?.storageBucket || '';
  const storagePrefix = firstStoredAsset?.path ? firstStoredAsset.path.split('/').slice(0, 3).join('/') : '';

  return {
    schemaVersion: 1,
    sourceUrl: scrape.sourceUrl,
    sourceHost: scrape.sourceHost,
    capturedAt: scrape.sourceArchive.capturedAt,
    storageBucket,
    storagePrefix,
    importedImageAssets,
    sourceImages: {
      heroImage: scrape.heroImage,
      logoImage: scrape.logoImage,
      images: scrape.images,
      galleryImages: scrape.galleryImages,
    },
    rebuildAssets: scrape.sourceArchive.rebuild.assets,
    platform: scrape.sourceArchive.platform,
    metrics: {
      sourceImages: scrape.images.length,
      galleryImages: scrape.galleryImages.length,
      importedImages: importedImageAssets.length,
      rooms: scrape.rooms.length,
      services: scrape.services.length,
      faqs: scrape.faqs.length,
      contentBlocks: scrape.siteContentLibrary.blocks.length,
    },
  };
}

function previewSnapshotFromScrape(scrape: CatteryWebsiteScrapeResult): Record<string, unknown> {
  return {
    schemaVersion: 1,
    sourceUrl: scrape.sourceUrl,
    sourceHost: scrape.sourceHost,
    title: scrape.title,
    heading: scrape.heading,
    description: scrape.description,
    selectedTemplate: 'original',
    originalRebuild: {
      htmlPath: 'raw_data.sourceArchive.rebuild.html',
      status: scrape.sourceArchive.rebuild.status,
      htmlBytes: Buffer.byteLength(scrape.sourceArchive.rebuild.html, 'utf8'),
      capturedAt: scrape.sourceArchive.rebuild.capturedAt,
      assets: scrape.sourceArchive.rebuild.assets,
    },
    platform: scrape.sourceArchive.platform,
    media: {
      heroImage: scrape.heroImage,
      logoImage: scrape.logoImage,
      images: scrape.images,
      galleryImages: scrape.galleryImages,
    },
    content: {
      siteContentLibrary: scrape.siteContentLibrary,
      rooms: scrape.rooms,
      services: scrape.services,
      faqs: scrape.faqs,
      reviews: scrape.reviews,
      owner: scrape.owner,
      commitment: scrape.commitment,
      locationDetails: scrape.locationDetails,
    },
    contact: {
      phone: scrape.phone,
      email: scrape.email,
      address: scrape.address,
      city: scrape.city,
      country: scrape.country,
      hours: scrape.hours,
      bookingUrl: scrape.bookingUrl,
      socialLinks: scrape.socialLinks,
    },
  };
}

function assetManifestFromPayload(
  rawData: Record<string, unknown>,
  normalizedData: Record<string, unknown>,
): Record<string, unknown> {
  const images = uniqueStrings([
    ...collectImageStrings(rawData),
    ...collectImageStrings(normalizedData),
  ]).slice(0, 96);

  return {
    schemaVersion: 1,
    sourceUrl: stringValue(rawData['sourceUrl']) || stringFromPath(rawData, ['source', 'url']),
    importedImageAssets: [],
    sourceImages: { images },
    metrics: { sourceImages: images.length },
  };
}

function previewSnapshotFromPayload(
  rawData: Record<string, unknown>,
  normalizedData: Record<string, unknown>,
): Record<string, unknown> {
  return {
    schemaVersion: 1,
    sourceUrl: stringValue(rawData['sourceUrl']) || stringFromPath(rawData, ['source', 'url']),
    selectedTemplate: stringValue(rawData['selectedTemplate']) || stringValue(rawData['liveTemplate']) || null,
    normalizedData,
    rawData,
  };
}

function mediaLibraryRowsFromScrape(source: ContentSourceRecord, scrape: CatteryWebsiteScrapeResult) {
  const importedAssets = importedImageAssetsFromScrape(scrape);
  const importedByOriginal = new Map(importedAssets.map((asset) => [asset.originalUrl, asset]));
  const importedByStored = new Map(importedAssets.map((asset) => [asset.storedUrl, asset]));
  const rowsByKey = new Map<string, Record<string, unknown>>();

  const addImage = (url: string, input: { category: string; altText?: string; metadata?: Record<string, unknown> }) => {
    if (!url) return;
    const imported = importedByOriginal.get(url) ?? importedByStored.get(url);
    const key = imported?.storedUrl || url;
    if (rowsByKey.has(key)) return;

    const category = input.category;
    rowsByKey.set(key, {
      cattery_id: source.cattery_id,
      source_id: source.id,
      original_url: imported?.originalUrl || url,
      storage_url: imported?.storedUrl || null,
      mime_type: imported?.contentType || null,
      category,
      confidence: imported ? 0.95 : 0.75,
      alt_text: input.altText || '',
      contains_text: false,
      is_logo: category === 'logo',
      is_open_graph: category === 'open_graph',
      is_owner: category === 'owner',
      is_building: /hero|building|facility/i.test(category),
      is_suite: category === 'room' || category === 'suite',
      is_gallery: category === 'gallery',
      storage_bucket: imported?.storageBucket || source.storage_bucket || null,
      storage_path: imported?.path || null,
      metadata: {
        sourceUrl: scrape.sourceUrl,
        sourceHost: scrape.sourceHost,
        ...input.metadata,
      },
      schema_version: 1,
    });
  };

  for (const asset of importedAssets) {
    addImage(asset.storedUrl, {
      category: categoryForUrl(asset.originalUrl),
      metadata: { originalUrl: asset.originalUrl, storagePath: asset.path },
    });
  }

  addImage(scrape.heroImage, { category: 'hero', altText: `${scrape.title} hero image` });
  addImage(scrape.logoImage, { category: 'logo', altText: `${scrape.title} logo` });
  scrape.images.forEach((url) => addImage(url, { category: categoryForUrl(url) }));
  scrape.galleryImages.forEach((image) => addImage(image.url, { category: 'gallery', altText: image.caption, metadata: { caption: image.caption } }));
  scrape.rooms.forEach((room) => addImage(room.image || '', { category: 'room', altText: room.name, metadata: { roomName: room.name } }));
  scrape.services.forEach((service) => addImage(service.image || '', { category: 'service', altText: service.title, metadata: { serviceTitle: service.title } }));
  addImage(scrape.owner.image, { category: 'owner', altText: scrape.owner.title });

  return Array.from(rowsByKey.values()).slice(0, 96);
}

function contentLibraryRowsFromScrape(source: ContentSourceRecord, scrape: CatteryWebsiteScrapeResult) {
  const rows: Array<Record<string, unknown>> = [];
  for (const block of scrape.siteContentLibrary.blocks) {
    rows.push({
      cattery_id: source.cattery_id,
      source_id: source.id,
      content_type: block.category || 'section',
      content_key: block.id,
      title: block.title,
      body: cleanBodyText([
        block.text,
        ...(block.items ?? []).map((item) => [item.title, item.text, item.answer].filter(Boolean).join(' ')),
      ].join(' ')),
      structured_data: block,
      confidence: 0.85,
      language: 'en',
      source_label: scrape.sourceHost,
      extraction_version: source.import_version,
      schema_version: 1,
    });
  }

  scrape.sourceArchive.pages.forEach((page, index) => {
    rows.push({
      cattery_id: source.cattery_id,
      source_id: source.id,
      content_type: 'source_page',
      content_key: `page-${index + 1}`,
      title: page.title || page.heading || page.sourceUrl,
      body: page.textSample,
      structured_data: page,
      confidence: 0.8,
      language: 'en',
      source_label: scrape.sourceHost,
      extraction_version: source.import_version,
      schema_version: 1,
    });
  });

  return rows.slice(0, 120);
}

function mediaLibraryRowsFromPayload(
  source: ContentSourceRecord,
  rawData: Record<string, unknown>,
  normalizedData: Record<string, unknown>,
) {
  const images = uniqueStrings([
    ...collectImageStrings(rawData),
    ...collectImageStrings(normalizedData),
  ]).slice(0, 96);

  return images.map((image, index) => ({
    cattery_id: source.cattery_id,
    source_id: source.id,
    original_url: image,
    storage_url: isCatstaysStorageUrl(image) ? image : null,
    mime_type: mimeTypeFromUrl(image),
    category: categoryForUrl(image),
    confidence: 0.75,
    alt_text: '',
    contains_text: false,
    is_logo: categoryForUrl(image) === 'logo',
    is_open_graph: false,
    is_owner: categoryForUrl(image) === 'owner',
    is_building: /hero|building|facility/i.test(categoryForUrl(image)),
    is_suite: /room|suite/i.test(categoryForUrl(image)),
    is_gallery: categoryForUrl(image) === 'gallery',
    storage_bucket: source.storage_bucket,
    storage_path: null,
    metadata: {
      index,
      sourceUrl: source.source_url,
    },
    schema_version: 1,
  }));
}

function contentLibraryRowsFromPayload(
  source: ContentSourceRecord,
  rawData: Record<string, unknown>,
  normalizedData: Record<string, unknown>,
) {
  const rows: Array<Record<string, unknown>> = [];
  const libraries = [
    jsonObject(rawData['contentLibrary']),
    jsonObject(rawData['siteContentLibrary']),
    jsonObject(normalizedData['siteContentLibrary']),
  ];

  for (const library of libraries) {
    const blocks = Array.isArray(library['blocks']) ? library['blocks'] : [];
    for (const blockValue of blocks) {
      const block = jsonObject(blockValue);
      const key = stringValue(block['id']) || `block-${rows.length + 1}`;
      if (rows.some((row) => row.content_key === key)) continue;
      rows.push({
        cattery_id: source.cattery_id,
        source_id: source.id,
        content_type: stringValue(block['category']) || 'section',
        content_key: key,
        title: stringValue(block['title']),
        body: cleanBodyText([
          stringValue(block['text']),
          ...itemsText(block['items']),
        ].join(' ')),
        structured_data: block,
        confidence: 0.8,
        language: 'en',
        source_label: source.source_name || source.source_url || '',
        extraction_version: source.import_version,
        schema_version: 1,
      });
    }
  }

  const contentRecord = jsonObject(rawData['content']);
  for (const [key, value] of Object.entries(contentRecord)) {
    if (rows.length >= 120) break;
    if (typeof value !== 'string' || !value.trim()) continue;
    rows.push({
      cattery_id: source.cattery_id,
      source_id: source.id,
      content_type: 'content_field',
      content_key: key,
      title: humanizeKey(key),
      body: value.trim(),
      structured_data: { key, value },
      confidence: 0.7,
      language: 'en',
      source_label: source.source_name || source.source_url || '',
      extraction_version: source.import_version,
      schema_version: 1,
    });
  }

  return rows.slice(0, 120);
}

function importedImageAssetsFromScrape(scrape: CatteryWebsiteScrapeResult): ImportedImageAsset[] {
  const settings = jsonObject(scrape.websiteSettings);
  const assets = settings['importedImageAssets'];
  if (!Array.isArray(assets)) return [];
  return assets
    .map((asset) => jsonObject(asset))
    .map((asset) => ({
      originalUrl: stringValue(asset['originalUrl']),
      storedUrl: stringValue(asset['storedUrl']),
      path: stringValue(asset['path']),
      contentType: stringValue(asset['contentType']),
      storageBucket: stringValue(asset['storageBucket']) || undefined,
    }))
    .filter((asset) => asset.originalUrl && asset.storedUrl && asset.path);
}

function collectImageStrings(value: unknown): string[] {
  const images: string[] = [];
  const visit = (current: unknown, keyPath: string[]) => {
    if (!current) return;
    if (typeof current === 'string') {
      const joinedPath = keyPath.join('.').toLowerCase();
      if (
        /^https?:\/\//i.test(current) &&
        (
          joinedPath.includes('image') ||
          joinedPath.includes('gallery') ||
          joinedPath.includes('photo') ||
          joinedPath.includes('logo') ||
          /\.(png|jpe?g|webp|avif|gif)(?:[?#/]|$)/i.test(current)
        )
      ) {
        images.push(current);
      }
      return;
    }
    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, [...keyPath, String(index)]));
      return;
    }
    if (typeof current === 'object') {
      Object.entries(current as Record<string, unknown>).forEach(([key, child]) => visit(child, [...keyPath, key]));
    }
  };
  visit(value, []);
  return images;
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function categoryForUrl(url: string): string {
  if (/logo|brand/i.test(url)) return 'logo';
  if (/owner|team|about|portrait|profile/i.test(url)) return 'owner';
  if (/room|suite|accommodation|boarding/i.test(url)) return 'room';
  if (/gallery|photo|cat/i.test(url)) return 'gallery';
  if (/hero|building|facility|exterior/i.test(url)) return 'hero';
  return 'source_image';
}

function itemsText(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const record = jsonObject(item);
    return cleanBodyText([
      stringValue(record['title']),
      stringValue(record['name']),
      stringValue(record['text']),
      stringValue(record['description']),
      stringValue(record['answer']),
    ].join(' '));
  }).filter(Boolean);
}

function humanizeKey(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isCatstaysStorageUrl(value: string) {
  try {
    const url = new URL(value);
    return /\.supabase\.co$/i.test(url.hostname) && /\/storage\/v1\/object\/public\//i.test(url.pathname);
  } catch {
    return false;
  }
}

function mimeTypeFromUrl(value: string): string | null {
  const lower = value.split('?')[0].toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.avif')) return 'image/avif';
  if (lower.endsWith('.gif')) return 'image/gif';
  return null;
}

function cleanBodyText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizedDataFromScrape(scrape: CatteryWebsiteScrapeResult) {
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
    sourceArchive: {
      captureMethod: scrape.sourceArchive.captureMethod,
      capturedAt: scrape.sourceArchive.capturedAt,
      platform: scrape.sourceArchive.platform,
      rebuild: {
        status: scrape.sourceArchive.rebuild.status,
        sourceUrl: scrape.sourceArchive.rebuild.sourceUrl,
        capturedAt: scrape.sourceArchive.rebuild.capturedAt,
        htmlBytes: Buffer.byteLength(scrape.sourceArchive.rebuild.html, 'utf8'),
        assets: scrape.sourceArchive.rebuild.assets,
        notes: scrape.sourceArchive.rebuild.notes,
      },
      metrics: scrape.sourceArchive.metrics,
      unsupported: scrape.sourceArchive.unsupported,
      pages: scrape.sourceArchive.pages.map((page) => ({
        sourceUrl: page.sourceUrl,
        title: page.title,
        heading: page.heading,
        bodyTextLength: page.bodyTextLength,
        imageCount: page.images.length,
        extractionSource: page.extractionSource,
      })),
    },
    siteContentLibrary: scrape.siteContentLibrary,
    websiteSettings: scrape.websiteSettings,
  };
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
