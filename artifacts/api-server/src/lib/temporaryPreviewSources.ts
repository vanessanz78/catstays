import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CatteryWebsiteScrapeResult } from './catteryWebsiteScraper';
import {
  buildContentSourceHash,
  createWebsiteContentSourceFromScrape,
  type ContentSourceRecord,
} from './openHomeContentSources';

export type TemporaryPreviewSourceRecord = {
  id: string;
  source_url: string;
  source_host: string | null;
  source_name: string | null;
  raw_data: Record<string, unknown>;
  normalized_data: Record<string, unknown>;
  asset_manifest: Record<string, unknown>;
  preview_snapshot: Record<string, unknown>;
  content_hash: string | null;
  import_version: string | null;
  selected_template: string | null;
  status: 'active' | 'adopted' | 'abandoned' | 'expired' | 'failed';
  expires_at: string;
  adopted_cattery_id: string | null;
  adopted_source_id: string | null;
  adopted_at: string | null;
  abandoned_at: string | null;
  created_at: string;
  updated_at: string;
};

const TEMPORARY_PREVIEW_SELECT = [
  'id',
  'source_url',
  'source_host',
  'source_name',
  'raw_data',
  'normalized_data',
  'asset_manifest',
  'preview_snapshot',
  'content_hash',
  'import_version',
  'selected_template',
  'status',
  'expires_at',
  'adopted_cattery_id',
  'adopted_source_id',
  'adopted_at',
  'abandoned_at',
  'created_at',
  'updated_at',
].join(',');

const EMPTY_PAYLOAD = {};
const TEMPORARY_PREVIEW_TTL_MS = 2 * 60 * 60 * 1000;

export function createTemporaryPreviewToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function attachTemporaryPreviewMetadata(
  scrape: CatteryWebsiteScrapeResult,
  record: TemporaryPreviewSourceRecord,
  previewToken: string,
) {
  return {
    ...scrape,
    previewSourceId: record.id,
    previewSourceToken: previewToken,
    previewSourceExpiresAt: record.expires_at,
  };
}

export async function saveTemporaryPreviewSource(
  supabase: SupabaseClient,
  input: {
    scrape: CatteryWebsiteScrapeResult;
    previewToken?: string;
  },
): Promise<{ record: TemporaryPreviewSourceRecord; previewToken: string }> {
  await cleanupExpiredTemporaryPreviewSources(supabase);

  const previewToken = input.previewToken || createTemporaryPreviewToken();
  const tokenHash = hashTemporaryPreviewToken(previewToken);
  const row = rowFromScrape(input.scrape, tokenHash);
  const existing = input.previewToken
    ? await activeTemporaryPreviewSourceByToken(supabase, input.previewToken)
    : null;

  if (existing) {
    const { data, error } = await supabase
      .from('temporary_preview_sources')
      .update(row)
      .eq('id', existing.id)
      .select(TEMPORARY_PREVIEW_SELECT)
      .single();

    if (error || !data) throw error ?? new Error('Temporary preview source could not be updated.');
    return { record: data as unknown as TemporaryPreviewSourceRecord, previewToken };
  }

  const { data, error } = await supabase
    .from('temporary_preview_sources')
    .insert(row)
    .select(TEMPORARY_PREVIEW_SELECT)
    .single();

  if (error || !data) throw error ?? new Error('Temporary preview source could not be saved.');
  return { record: data as unknown as TemporaryPreviewSourceRecord, previewToken };
}

export async function temporaryPreviewScrapeByToken(
  supabase: SupabaseClient,
  previewToken: string,
): Promise<{ record: TemporaryPreviewSourceRecord; scrape: CatteryWebsiteScrapeResult } | null> {
  await cleanupExpiredTemporaryPreviewSources(supabase);

  const record = await activeTemporaryPreviewSourceByToken(supabase, previewToken);
  if (!record) return null;

  await supabase
    .from('temporary_preview_sources')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('id', record.id);

  return {
    record,
    scrape: record.raw_data as unknown as CatteryWebsiteScrapeResult,
  };
}

export async function abandonTemporaryPreviewSource(
  supabase: SupabaseClient,
  previewToken: string,
): Promise<boolean> {
  if (!previewToken) return false;
  const { data, error } = await supabase
    .from('temporary_preview_sources')
    .update({
      status: 'abandoned',
      raw_data: EMPTY_PAYLOAD,
      normalized_data: EMPTY_PAYLOAD,
      asset_manifest: EMPTY_PAYLOAD,
      preview_snapshot: EMPTY_PAYLOAD,
      abandoned_at: new Date().toISOString(),
    })
    .eq('preview_token_hash', hashTemporaryPreviewToken(previewToken))
    .eq('status', 'active')
    .select('id')
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function adoptTemporaryPreviewSource(
  supabase: SupabaseClient,
  input: {
    previewToken?: string;
    catteryId: string;
    actorId?: string | null;
  },
): Promise<ContentSourceRecord | null> {
  if (!input.previewToken) return null;

  const preview = await temporaryPreviewScrapeByToken(supabase, input.previewToken);
  if (!preview) return null;

  const source = await createWebsiteContentSourceFromScrape(supabase, {
    catteryId: input.catteryId,
    scrape: preview.scrape,
    actorId: input.actorId,
  });

  const { error } = await supabase
    .from('temporary_preview_sources')
    .update({
      status: 'adopted',
      raw_data: EMPTY_PAYLOAD,
      normalized_data: EMPTY_PAYLOAD,
      asset_manifest: EMPTY_PAYLOAD,
      preview_snapshot: EMPTY_PAYLOAD,
      adopted_cattery_id: input.catteryId,
      adopted_source_id: source.id,
      adopted_at: new Date().toISOString(),
    })
    .eq('id', preview.record.id);

  if (error) throw error;
  return source;
}

export async function cleanupExpiredTemporaryPreviewSources(supabase: SupabaseClient) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('temporary_preview_sources')
    .update({
      status: 'expired',
      raw_data: EMPTY_PAYLOAD,
      normalized_data: EMPTY_PAYLOAD,
      asset_manifest: EMPTY_PAYLOAD,
      preview_snapshot: EMPTY_PAYLOAD,
      abandoned_at: now,
    })
    .eq('status', 'active')
    .lt('expires_at', now);

  if (error) throw error;
}

async function activeTemporaryPreviewSourceByToken(
  supabase: SupabaseClient,
  previewToken: string,
): Promise<TemporaryPreviewSourceRecord | null> {
  if (!previewToken) return null;
  const { data, error } = await supabase
    .from('temporary_preview_sources')
    .select(TEMPORARY_PREVIEW_SELECT)
    .eq('preview_token_hash', hashTemporaryPreviewToken(previewToken))
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as TemporaryPreviewSourceRecord | null;
}

function rowFromScrape(scrape: CatteryWebsiteScrapeResult, tokenHash: string) {
  const normalizedData = normalizedDataFromScrape(scrape);
  const contentHash = buildContentSourceHash({
    sourceType: 'website',
    sourceUrl: scrape.sourceUrl,
    rawData: scrape,
    normalizedData,
  });

  return {
    preview_token_hash: tokenHash,
    source_url: scrape.sourceUrl,
    source_host: scrape.sourceHost,
    source_name: scrape.title || scrape.heading || scrape.sourceHost,
    raw_data: scrape,
    normalized_data: normalizedData,
    asset_manifest: assetManifestFromScrape(scrape),
    preview_snapshot: previewSnapshotFromScrape(scrape),
    content_hash: contentHash,
    import_version: `preview-${contentHash.slice(0, 12)}`,
    selected_template: 'original',
    status: 'active',
    expires_at: new Date(Date.now() + TEMPORARY_PREVIEW_TTL_MS).toISOString(),
    last_accessed_at: new Date().toISOString(),
    adopted_cattery_id: null,
    adopted_source_id: null,
    adopted_at: null,
    abandoned_at: null,
  };
}

function assetManifestFromScrape(scrape: CatteryWebsiteScrapeResult): Record<string, unknown> {
  const settings = jsonObject(scrape.websiteSettings);
  const importedImageAssets = Array.isArray(settings.importedImageAssets)
    ? settings.importedImageAssets
    : [];

  return {
    schemaVersion: 1,
    sourceUrl: scrape.sourceUrl,
    sourceHost: scrape.sourceHost,
    capturedAt: scrape.sourceArchive.capturedAt,
    importedImageAssets,
    sourceImages: {
      heroImage: scrape.heroImage,
      logoImage: scrape.logoImage,
      images: scrape.images,
      galleryImages: scrape.galleryImages,
    },
    rebuildAssets: scrape.sourceArchive.rebuild.assets,
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
  };
}

function normalizedDataFromScrape(scrape: CatteryWebsiteScrapeResult) {
  return {
    sourceUrl: scrape.sourceUrl,
    sourceHost: scrape.sourceHost,
    title: scrape.title,
    description: scrape.description,
    heading: scrape.heading,
    heroImage: scrape.heroImage,
    logoImage: scrape.logoImage,
    images: scrape.images,
    galleryImages: scrape.galleryImages,
    rooms: scrape.rooms,
    services: scrape.services,
    faqs: scrape.faqs,
    reviews: scrape.reviews,
    siteContentLibrary: scrape.siteContentLibrary,
    sourceArchive: scrape.sourceArchive,
    websiteSettings: scrape.websiteSettings,
  };
}

function hashTemporaryPreviewToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function jsonObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}
