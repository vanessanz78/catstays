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
  return createContentSource(supabase, {
    catteryId: input.catteryId,
    sourceType: 'website',
    sourceUrl: input.scrape.sourceUrl,
    sourceName: input.scrape.title || input.scrape.heading || input.scrape.sourceHost,
    rawData: input.scrape,
    normalizedData: normalizedDataFromScrape(input.scrape),
    status: 'ready',
    actorId: input.actorId,
  });
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

  const normalizedData = jsonObject(
    record['normalizedPreviewData'] ?? {
      siteContentLibrary: input.draft['siteContentLibrary'],
      contentLibrary: input.draft['contentLibrary'],
      websiteSettings: input.draft,
    },
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
    rawData: Object.keys(record).length > 0 ? record : input.draft,
    normalizedData,
    status: 'ready',
    actorId: input.actorId,
  });
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
