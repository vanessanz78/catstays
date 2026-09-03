import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
process.env.VITE_SUPABASE_URL = 'http://127.0.0.1:1';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-only';
let owner = true, staff = false, failed = false, alreadyRunning = false, calls = 0;
let jobStatus='running', missingJob=false;
let until=new Date(Date.now()+300000).toISOString();
mock.method(globalThis, 'fetch', async (input: any) => {
  const url = new URL(String(input));
  assert.equal(url.origin, 'http://127.0.0.1:1');
  if (url.pathname.endsWith('/user')) return Response.json({ id: 'user' });
  if (url.pathname.endsWith('/catteries')) return Response.json(owner ? { id: 'tenant' } : null);
  if (url.pathname.endsWith('/staff_memberships')) return Response.json(staff ? { id: 'staff' } : null);
  if (url.pathname.endsWith('/legacy_sync_jobs')) return Response.json(missingJob?null:{id:'job',status:jobStatus,import_run_id:'run',manual_until:until,manual_after_change:42});
  if(url.pathname.endsWith('/catstays_manual_sync_summary')) return failed?Response.json({message:'private failure'},{status:400}):Response.json({bookings:{added:1,updated:2}});
  calls++;
  return failed ? Response.json({ message: 'private database detail' }, { status: 400 }) : Response.json({ jobId: 'job', alreadyRunning });
});
const { requestRevelationSync, revelationSyncResult, revelationSyncStep } = await import('./revelationSync.js');
async function run(token = 'Bearer mock') {
  const result = { code: 200, body: null as any };
  await requestRevelationSync({ headers: { authorization: token }, body: { catteryId: '7f6d029f-b727-4645-83be-db6ec56d1b46' } } as any, { status(code: number) { result.code = code; return this; }, json(body: any) { result.body = body; } } as any);
  return result;
}
test('signed-out and unrelated callers cannot queue work', async () => {
  calls = 0;
  assert.equal((await run('')).code, 401);
  owner = false;
  assert.equal((await run()).code, 403);
  assert.equal(calls, 0);
});
async function result(method='POST') {
  const response={code:200,body:null as any};
  await revelationSyncResult({method,headers:{authorization:'Bearer mock'},query:{catteryId:'7f6d029f-b727-4645-83be-db6ec56d1b46'},params:{jobId:'job'}} as any,{status(code:number){response.code=code;return this;},json(body:any){response.body=body;}} as any);
  return response;
}
test('completion summary is returned only for a completed authorized job',async()=>{
  owner=true;staff=false;failed=false;
  assert.deepEqual((await result()).body,{status:'running'});
  jobStatus='completed';
  assert.deepEqual((await result()).body,{status:'completed',changes:{bookings:{added:1,updated:2}}});
  failed=true;assert.equal((await result()).code,503);
  failed=false;missingJob=true;assert.equal((await result()).code,404);
  missingJob=false;owner=false;assert.equal((await result()).code,403);
});
test('owner and active staff can queue or join a running sync', async () => {
  owner = true;
  assert.deepEqual((await run()).body, { success: true, jobId: 'job', alreadyRunning: false });
  owner = false; staff = true; alreadyRunning = true;
  assert.equal((await run()).body.alreadyRunning, true);
});
test('queue failure is not success and does not leak database details', async () => {
  failed = true;
  const result = await run();
  assert.equal(result.code, 409);
  assert.equal(result.body.success, undefined);
  assert.doesNotMatch(result.body.error, /private database detail/);
});
test('manual batches require authentication, a running job and an unexpired click window',async()=>{
 let batches=0;
 async function step(token='Bearer mock'){
  const response={code:200,body:null as any};
  await revelationSyncStep({headers:{authorization:token},body:{catteryId:'7f6d029f-b727-4645-83be-db6ec56d1b46'},params:{jobId:'job'}} as any,{status(code:number){response.code=code;return this;},json(body:any){response.body=body;}} as any,async()=>{batches++;});
  return response;
 }
 failed=false;owner=true;staff=false;jobStatus='running';
 assert.equal((await step('')).code,401);assert.equal(batches,0);
 owner=false;assert.equal((await step()).code,403);assert.equal(batches,0);
 owner=true;until=new Date(Date.now()-1000).toISOString();
 assert.deepEqual((await result('GET')).body,{status:'failed'});
 assert.equal((await step()).body.status,'paused');assert.equal(batches,0);
 until=new Date(Date.now()+300000).toISOString();jobStatus='paused';
 assert.equal((await step()).body.status,'paused');assert.equal(batches,0);
 jobStatus='running';assert.equal((await step()).body.status,'running');assert.equal(batches,1);
 jobStatus='completed';assert.equal((await step()).body.status,'completed');assert.equal(batches,1);
 missingJob=true;assert.equal((await step()).code,404);assert.equal(batches,1);missingJob=false;
});
