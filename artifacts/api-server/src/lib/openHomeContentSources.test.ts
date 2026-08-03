import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildContentSourceHash,
  createContentSource,
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
    from(table: string) {
      return tableQuery(table, state);
    },
  };

  return state as typeof state & SupabaseClient;
}

type MockSupabaseState = {
  events: Array<Record<string, any>>;
  catteryUpdates: Array<{ id: string; update: Record<string, unknown> }>;
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
