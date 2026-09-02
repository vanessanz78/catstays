import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchAllRows, fetchRowsByIds, fetchAllRowsById } from './fetchAllRows.ts';

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

test('ID batches load all 8957 nested bookings without deep offsets and preserve identity order', async () => {
  const data = Array.from({length:8957}, (_, i) => ({id:String(i), name:'Booking '+i}));
  let active=0, maximum=0, calls=0;
  const result = await fetchRowsByIds(async () => ({data,error:null}), async ids => {
    calls++; active++; maximum=Math.max(active,maximum);
    assert.ok(ids.length<=100);
    await Promise.resolve(); active--;
    return {data:ids.map(id=>data[Number(id)]).reverse(),error:null};
  });
  assert.deepEqual(result,{data,error:null});
  assert.equal(calls,90); assert.ok(maximum<=3);
});
test('identity errors, null snapshots and duplicates never fetch details', async () => {
  let calls=0;
  for (const snapshot of [
    {data:null,error:{message:'identity failed'}},
    {data:null,error:null},
    {data:[{id:'1'},{id:'1'}],error:null},
  ]) {
    const result=await fetchRowsByIds(async()=>snapshot,async()=>{calls++;return{data:[],error:null};});
    assert.equal(result.data,null);assert.ok(result.error);
  }
  assert.equal(calls,0);
});
test('detail failure or missing, duplicate, or unexpected identities fail closed', async () => {
  const data=[{id:'a'},{id:'b'}];
  for(const page of [
    {data:null,error:{message:'timeout'}},
    {data:[{id:'a'}],error:null},
    {data:[{id:'a'},{id:'a'}],error:null},
    {data:[{id:'a'},{id:'other-tenant'}],error:null},
  ]) {
    const result=await fetchRowsByIds(async()=>({data,error:null}),async()=>page);
    assert.equal(result.data,null);assert.ok(result.error);
  }
});
test('empty ID snapshot is valid and invalid batching is rejected',async()=>{
  let calls=0;
  assert.deepEqual(await fetchRowsByIds(async()=>({data:[],error:null}),async()=>{calls++;return{data:[],error:null};}),{data:[],error:null});
  assert.equal(calls,0);
  assert.ok((await fetchRowsByIds(async()=>({data:[],error:null}),async()=>({data:[],error:null}),{batchSize:0})).error);
});

test('cursor identities visit all rows once without offsets',async()=>{
  const data=Array.from({length:8957},(_,i)=>({id:String(i).padStart(5,'0')}));
  let calls=0;
  const result=await fetchAllRowsById(async(after,limit)=>{
    calls++;
    const start=after===null?0:Number(after)+1;
    return{data:data.slice(start,start+limit),error:null};
  },async()=>({count:data.length,error:null}));
  assert.equal(calls,18);assert.deepEqual(result,{data,error:null});
});
test('cursor identities reject truncation, repeated and unordered IDs',async()=>{
  for(const data of [[{id:'a'}],[{id:'a'},{id:'a'}],[{id:'b'},{id:'a'}]]){
    const result=await fetchAllRowsById(async()=>({data,error:null}),async()=>({count:2,error:null}));
    assert.equal(result.data,null);assert.ok(result.error);
  }
});
test('cursor count and page errors fail closed; zero count performs no page read',async()=>{
  const error={message:'unavailable'};
  assert.deepEqual(await fetchAllRowsById(async()=>({data:[],error:null}),async()=>({count:null,error})),{data:null,error});
  assert.deepEqual(await fetchAllRowsById(async()=>({data:null,error}),async()=>({count:1,error:null})),{data:null,error});
  let calls=0;
  assert.deepEqual(await fetchAllRowsById(async()=>{calls++;return{data:[],error:null};},async()=>({count:0,error:null})),{data:[],error:null});
  assert.equal(calls,0);
});
