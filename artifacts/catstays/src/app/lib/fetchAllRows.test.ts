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
