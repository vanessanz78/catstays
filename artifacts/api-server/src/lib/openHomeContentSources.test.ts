import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildContentSourceHash,
  createContentSource,
  createContentSourceFromOnboardingDraft,
  createWebsiteContentSourceFromScrape,
  getContentSource,
  listContentSources,
  updateContentSourceStatus,
  type ContentSourceRecord,
} from './openHomeContentSources';

const sourceRecord: ContentSourceRecord = {
  id: 'source-1',
  cattery_id: 'cattery-1',
  source_type: 'website',
  source_url: 'https://example.com/',
  source_name: 'Example Cattery',
  raw_data: { sourceUrl: 'https://example.com/' },
  normalized_data: { title: 'Example Cattery' },
  content_hash: 'hash-1',
  import_version: 'source-hash-1',
  schema_version: 1,
  status: 'ready',
  created_by: 'user-1',
  storage_bucket: null,
  storage_prefix: null,
  asset_manifest: {},
  preview_snapshot: {},
  selected_template: null,
  last_imported_at: null,
  created_at: '2026-08-03T00:00:00.000Z',
  updated_at: '2026-08-03T00:00:00.000Z',
};

describe('openHomeContentSources', () => {
  it('hashes equivalent source payloads deterministically', () => {
    const first = buildContentSourceHash({
      sourceType: 'website',
      sourceUrl: 'https://example.com/',
      rawData: { b: 2, a: 1 },
      normalizedData: { title: 'Example' },
    });
    const second = buildContentSourceHash({
      sourceType: 'website',
      sourceUrl: 'https://example.com/',
      rawData: { a: 1, b: 2 },
      normalizedData: { title: 'Example' },
    });

    assert.equal(first, second);
  });

  it('creates a source, writes an audit event, and updates the current source pointer', async () => {
    const supabase = mockSupabase();

    const source = await createContentSource(supabase, {
      catteryId: 'cattery-1',
      sourceUrl: 'https://example.com/',
      sourceName: 'Example Cattery',
      rawData: { sourceUrl: 'https://example.com/' },
      normalizedData: { title: 'Example Cattery' },
      actorId: 'user-1',
    });

    assert.equal(source.id, 'source-1');
    assert.equal(supabase.events.length, 1);
    assert.equal(supabase.events[0].event_type, 'content_source.created');
    assert.deepEqual(supabase.catteryUpdates[0], {
      id: 'cattery-1',
      update: { current_source_id: 'source-1' },
    });
  });

  it('persists rich onboarding preview imports as website content sources', async () => {
    const supabase = mockSupabase();

    const source = await createContentSourceFromOnboardingDraft(supabase, {
      catteryId: 'cattery-1',
      actorId: 'user-1',
      draft: {
        previewImportRecord: {
          source: { url: 'https://delorainecattery.com/' },
          identity: { businessName: 'Deloraine Cattery' },
          media: {
            heroImage: 'https://delorainecattery.com/hero.jpg',
            galleryImages: [{ url: 'https://delorainecattery.com/cat.jpg', caption: 'Cat suite' }],
          },
          normalizedPreviewData: {
            heroImage: 'https://delorainecattery.com/hero.jpg',
            siteContentLibrary: {
              blocks: [{ id: 'hero', type: 'hero', title: 'A calm country cattery' }],
            },
          },
        },
      },
    });

    assert.equal(source?.source_url, 'https://delorainecattery.com/');
    assert.equal(source?.source_name, 'Deloraine Cattery');
    assert.equal(source?.asset_manifest.schemaVersion, 1);
    assert.equal(source?.preview_snapshot.schemaVersion, 1);
    assert.deepEqual(source?.normalized_data, {
      heroImage: 'https://delorainecattery.com/hero.jpg',
      siteContentLibrary: {
        blocks: [{ id: 'hero', type: 'hero', title: 'A calm country cattery' }],
      },
    });
    assert.equal(supabase.events[0].event_type, 'content_source.created');
  });

  it('persists safe imported website fields when signup submits lightweight preview state', async () => {
    const supabase = mockSupabase();

    const source = await createContentSourceFromOnboardingDraft(supabase, {
      catteryId: 'cattery-1',
      actorId: 'user-1',
      draft: {
        sourceUrl: 'https://delorainecattery.com/',
        businessName: 'Deloraine Cattery',
        email: 'owner@example.com',
        password: 'do-not-store',
        heroHeading: 'Deloraine Cattery',
        heroImage: 'https://delorainecattery.com/hero.jpg',
        galleryImages: ['https://delorainecattery.com/cat.jpg'],
        siteContentLibrary: {
          blocks: [{ id: 'hero', type: 'hero', title: 'Welcome to Deloraine Cattery' }],
        },
      },
    });

    assert.equal(source?.source_url, 'https://delorainecattery.com/');
    assert.equal(source?.source_name, 'Deloraine Cattery');
    assert.equal(source?.normalized_data.heroHeading, 'Deloraine Cattery');
    assert.equal(source?.asset_manifest.schemaVersion, 1);
    assert.equal(source?.preview_snapshot.schemaVersion, 1);
    assert.equal(source?.raw_data.password, undefined);
    assert.equal(source?.raw_data.email, undefined);
    assert.deepEqual(source?.normalized_data.galleryImages, ['https://delorainecattery.com/cat.jpg']);
    assert.equal(supabase.events[0].event_type, 'content_source.created');
  });

  it('promotes website scrape assets and content into Supabase library fields', async () => {
    const supabase = mockSupabase();

    const source = await createWebsiteContentSourceFromScrape(supabase, {
      catteryId: 'cattery-1',
      actorId: 'user-1',
      scrape: {
        sourceUrl: 'https://fancyfelines.nz/',
        sourceHost: 'fancyfelines.nz',
        title: 'FancyFelines.nz',
        description: 'Boutique grooming cattery',
        heading: 'FancyFelines.nz',
        heroImage: 'https://storage.example/hero.jpg',
        logoImage: 'https://storage.example/logo.png',
        images: ['https://storage.example/hero.jpg'],
        galleryImages: [{ url: 'https://storage.example/gallery.jpg', caption: 'Cattery gallery' }],
        phone: '021 000 000',
        email: 'hello@example.com',
        address: '745 Whareora Road',
        city: 'Whangarei',
        country: 'NZ',
        bookingUrl: '',
        hours: '',
        socialLinks: {},
        highlights: [],
        rooms: [],
        services: [],
        faqs: [{ question: 'Can I book?', answer: 'Yes.' }],
        reviews: [],
        owner: { title: 'Owner', text: 'Owner text', image: '' },
        commitment: { title: 'Care', text: 'Care text', items: [] },
        locationDetails: { heading: 'Location', text: 'Location text', directions: '', virtualTourUrl: '' },
        virtualTourUrl: '',
        siteContentLibrary: {
          schemaVersion: 1,
          sourceUrl: 'https://fancyfelines.nz/',
          sourceHost: 'fancyfelines.nz',
          businessName: 'FancyFelines.nz',
          capturedAt: '2026-08-09T00:00:00.000Z',
          blocks: [{ id: 'hero', category: 'hero', title: 'FancyFelines.nz', text: 'A home away from home.' }],
        },
        sourceArchive: {
          schemaVersion: 1,
          captureMethod: 'rendered-browser-or-http-source-rebuild',
          sourceUrl: 'https://fancyfelines.nz/',
          sourceHost: 'fancyfelines.nz',
          capturedAt: '2026-08-09T00:00:00.000Z',
          rebuild: {
            status: 'rebuilt',
            sourceUrl: 'https://fancyfelines.nz/',
            capturedAt: '2026-08-09T00:00:00.000Z',
            html: '<!doctype html><h1>FancyFelines.nz</h1>',
            assets: { images: 2, scripts: 0, stylesheets: 0, embedded: 2, failed: 0, totalBytes: 1024, truncated: false },
            pages: [],
            notes: [],
          },
          pages: [{
            sourceUrl: 'https://fancyfelines.nz/',
            title: 'FancyFelines.nz',
            heading: 'FancyFelines.nz',
            bodyTextLength: 23,
            textSample: 'A home away from home.',
            images: ['https://storage.example/hero.jpg'],
          }],
          assets: { images: ['https://storage.example/hero.jpg'], scripts: [] },
          metrics: { pages: 1, textCharacters: 23, images: 2, galleryImages: 1, rooms: 0, services: 0, faqs: 1, reviews: 0, scripts: 0 },
          unsupported: [],
        },
        bodyText: 'A home away from home.',
        extractedFrom: { html: true, scripts: 0, apiServices: false },
        websiteSettings: {
          importedImageAssets: [{
            originalUrl: 'https://static.wixstatic.com/media/hero.jpg',
            storedUrl: 'https://storage.example/hero.jpg',
            path: 'imports/fancyfelines/abc/hero.jpg',
            contentType: 'image/jpeg',
            storageBucket: 'catstays-media',
          }],
        },
        demoCattery: {},
        demoRooms: [],
      },
    });

    assert.equal(source.asset_manifest.schemaVersion, 1);
    assert.equal(source.preview_snapshot.schemaVersion, 1);
    assert.equal(source.storage_bucket, 'catstays-media');
    assert.equal(supabase.mediaRows.length >= 2, true);
    assert.equal(supabase.contentRows.length >= 2, true);
  });

  it('lists and reads source records through the service layer', async () => {
    const supabase = mockSupabase();

    const sources = await listContentSources(supabase, 'cattery-1');
    const source = await getContentSource(supabase, 'source-1');

    assert.equal(sources.length, 1);
    assert.equal(sources[0].id, 'source-1');
    assert.equal(source?.id, 'source-1');
  });

  it('updates source status and writes a status transition event', async () => {
    const supabase = mockSupabase();

    const source = await updateContentSourceStatus(supabase, {
      sourceId: 'source-1',
      status: 'archived',
      actorId: 'user-1',
      eventData: { reason: 'manual archive' },
    });

    assert.equal(source.status, 'archived');
    assert.equal(supabase.events[0].event_type, 'content_source.status_changed');
    assert.equal(supabase.events[0].event_data.reason, 'manual archive');
  });
});

function mockSupabase() {
  const state = {
    events: [] as Array<Record<string, any>>,
    catteryUpdates: [] as Array<{ id: string; update: Record<string, unknown> }>,
    mediaRows: [] as Array<Record<string, any>>,
    contentRows: [] as Array<Record<string, any>>,
    from(table: string) {
      return tableQuery(table, state);
    },
  };

  return state as typeof state & SupabaseClient;
}

type MockSupabaseState = {
  events: Array<Record<string, any>>;
  catteryUpdates: Array<{ id: string; update: Record<string, unknown> }>;
  mediaRows: Array<Record<string, any>>;
  contentRows: Array<Record<string, any>>;
};

function tableQuery(table: string, state: MockSupabaseState) {
  let updatePayload: Record<string, unknown> = {};
  let idFilter = '';

  const query: Record<string, any> = {
    insert(payload: Record<string, unknown>) {
      if (table === 'website_events') {
        state.events.push(payload);
        return Promise.resolve({ error: null });
      }
      if (table === 'media_library') {
        state.mediaRows.push(...(Array.isArray(payload) ? payload : [payload]));
        return Promise.resolve({ error: null });
      }
      if (table === 'content_library') {
        state.contentRows.push(...(Array.isArray(payload) ? payload : [payload]));
        return Promise.resolve({ error: null });
      }

      return {
        select() {
          return {
            single: () => Promise.resolve({
              data: {
                ...sourceRecord,
                ...payload,
                id: 'source-1',
                content_hash: 'hash-1',
                import_version: 'source-hash-1',
                created_at: sourceRecord.created_at,
                updated_at: sourceRecord.updated_at,
              },
              error: null,
            }),
          };
        },
      };
    },
    update(payload: Record<string, unknown>) {
      updatePayload = payload;
      return query;
    },
    select() {
      return query;
    },
    eq(column: string, value: string) {
      if (column === 'id') idFilter = value;
      if (table === 'catteries') {
        state.catteryUpdates.push({ id: value, update: updatePayload });
        return Promise.resolve({ error: null });
      }
      return query;
    },
    order() {
      return Promise.resolve({ data: [sourceRecord], error: null });
    },
    maybeSingle() {
      return Promise.resolve({
        data: idFilter === 'source-1' ? sourceRecord : null,
        error: null,
      });
    },
    single() {
      return Promise.resolve({
        data: {
          ...sourceRecord,
          status: updatePayload.status ?? sourceRecord.status,
        },
        error: null,
      });
    },
  };

  return query;
}
