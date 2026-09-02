import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchAllRows } from './fetchAllRows.ts';

test('loads all records beyond default 1000 rows in a stable order', async () => {
  const data = Array.from({ length: 10040 }, (_, id) => ({ id }));
  const calls: number[] = [];
  const result = await fetchAllRows(async (from, to) => {
    calls.push(from);
    return { data: data.slice(from, to + 1), error: null, count: data.length };
  });
  assert.equal(result.error, null);
  assert.deepEqual(result.data, data);
  assert.equal(calls.length, 21);
});
test('never displays a silently partial report', async () => {
  const result = await fetchAllRows(async (from, to) => ({
    data: from === 1000 ? null : Array.from({ length: Math.min(500, 1200-from) }, (_, n) => n + from),
    error: from === 1000 ? { message: 'network failed' } : null, count: 1200,
  }));
  assert.equal(result.data, null); assert.equal(result.error?.message, 'network failed');
});
test('reports a concurrent count change instead of claiming completeness', async () => {
  const result = await fetchAllRows(async () => ({ data: [], error: null, count: 501 }));
  assert.equal(result.data, null); assert.ok(result.error);
});
test('empty report is valid', async () => {
  assert.deepEqual(await fetchAllRows(async () => ({ data: [], error: null, count: 0 })), { data: [], error: null });
});

test('counts an expensive report once and bounds detail batches without repeating count', async () => {
  const source = Array.from({ length: 8957 }, (_, id) => ({ id }));
  let countCalls = 0;
  let active = 0;
  let maxActive = 0;
  const pages: number[] = [];
  const result = await fetchAllRows(async (from, to) => {
    assert.equal(countCalls, 1);
    pages.push(from);
    assert.equal(to - from + 1, 250);
    active++;
    maxActive = Math.max(maxActive, active);
    await Promise.resolve();
    active--;
    return { data: source.slice(from, to + 1), error: null };
  }, {
    pageSize: 250, concurrency: 2,
    count: async () => { countCalls++; return { count: source.length, error: null }; },
  });
  assert.equal(countCalls, 1);
  assert.equal(pages.length, 36);
  assert.ok(maxActive <= 2);
  assert.deepEqual(result, { data: source, error: null });
});
test('separate count failure never loads or displays partial records', async () => {
  let pages = 0;
  const result = await fetchAllRows(async () => { pages++; return { data: [], error: null }; }, {
    count: async () => ({ count: null, error: { message: 'count failed' } }),
  });
  assert.equal(pages, 0);
  assert.equal(result.data, null);
  assert.equal(result.error?.message, 'count failed');
});
test('missing separate count is not mistaken for an empty report', async () => {
  const result = await fetchAllRows(async () => ({ data: [], error: null }), {
    count: async () => ({ count: null, error: null }),
  });
  assert.equal(result.data, null);
  assert.ok(result.error);
});
test('zero separate count skips expensive details', async () => {
  let pages = 0;
  const result = await fetchAllRows(async () => { pages++; return { data: [], error: null }; }, {
    count: async () => ({ count: 0, error: null }),
  });
  assert.equal(pages, 0);
  assert.deepEqual(result, { data: [], error: null });
});
test('a truncated middle page fails even if a later page compensates its length', async () => {
  const result = await fetchAllRows(async (from) => ({
    data: Array.from({ length: from === 250 ? 249 : from === 500 ? 251 : 250 }, (_, id) => ({ id: from + id })),
    error: null,
  }), { pageSize: 250, concurrency: 2, count: async () => ({ count: 750, error: null }) });
  assert.equal(result.data, null);
  assert.ok(result.error);
});
test('rejects a changed page count and invalid paging configuration', async () => {
  const result = await fetchAllRows(async () => ({ data: [1, 2], error: null, count: 3 }), {
    pageSize: 2, count: async () => ({ count: 2, error: null }),
  });
  assert.equal(result.data, null);
  assert.ok(result.error);
  assert.ok((await fetchAllRows(async () => ({ data: [], error: null, count: 0 }), { pageSize: 0 })).error);
});
