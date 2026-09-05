import { Router, type IRouter, type Request, type Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { refreshAvailableWaitlists } from './bookings.js';
const router: IRouter = Router();
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const admin = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
async function authorizedCattery(req: Request, res: Response) {
  if (!admin) { res.status(503).json({ error: 'Sync service is unavailable.' }); return; }
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const catteryId = String(req.body?.catteryId || req.query?.catteryId || '');
  if (!token || !/^[0-9a-f-]{36}$/i.test(catteryId)) { res.status(401).json({ error: 'Sign in to request a sync.' }); return; }
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth.user) { res.status(401).json({ error: 'Sign in to request a sync.' }); return; }
  const [owner, staff] = await Promise.all([
    admin.from('catteries').select('id').eq('id', catteryId).eq('owner_id', auth.user.id).maybeSingle(),
    admin.from('staff_memberships').select('id').eq('cattery_id', catteryId).eq('user_id', auth.user.id).eq('status', 'active').maybeSingle(),
  ]);
  if (!owner.data?.id && !staff.data?.id) { res.status(403).json({ error: 'You cannot sync this cattery.' }); return; }
  return catteryId;
}
export async function requestRevelationSync(req: Request, res: Response) {
  const catteryId = await authorizedCattery(req, res);
  if (!catteryId || !admin) return;
  const { data, error } = await admin.rpc('catstays_request_operational_sync', { target_cattery_id: catteryId });
  if (error) {
    res.status(409).json({ error: 'Sync could not be queued. The previous batch may still be finishing. Please try again shortly.' });
    return;
  }
  res.status(202).json({ success: true, ...data });
}
router.post('/revelation-sync/request', requestRevelationSync);
export async function revelationSyncResult(req: Request, res: Response) {
  const catteryId = await authorizedCattery(req, res);
  if (!catteryId || !admin) return;
  const { data: job, error } = await admin.from('legacy_sync_jobs').select('id,status,import_run_id,manual_until,manual_after_change').eq('cattery_id',catteryId).eq('id',String(req.params.jobId)).maybeSingle();
  if (error || !job) { res.status(404).json({ error: 'Sync progress could not be loaded.' }); return; }
  const status=job.status==='running'&&(!job.manual_until||Date.parse(job.manual_until)<=Date.now())?'paused':job.status;
  // Retire polling in already-open pre-release clients, which do not know "paused".
  if(status==='paused'&&req.method==='GET'){res.json({status:'failed'});return;}
  if (status !== 'completed' && status !== 'paused') { res.json({ status }); return; }
  const summaryArgs={ target_cattery_id:catteryId, target_run_id:job.import_run_id, after_change:job.manual_after_change };
  let summary=await admin.rpc('catstays_manual_sync_summary',summaryArgs);
  // A read-only retry recovers transient database failures after the final write batch.
  // Never restart the import just to retrieve its completion summary.
  if(summary.error)summary=await admin.rpc('catstays_manual_sync_summary',summaryArgs);
  if (summary.error) { res.status(503).json({ error: 'Sync finished, but its change summary is unavailable.' }); return; }
  void refreshAvailableWaitlists();
  res.json({ status, changes:summary.data });
}
router.get('/revelation-sync/result/:jobId', revelationSyncResult);
async function runManualBatch() {
  // Existing read-only importer, executed only by an authorized button-initiated POST.
  // @ts-ignore Shared audited JavaScript worker also runs in the Edge runtime.
  const {processTick}=await import('../../../../supabase/functions/revelation-sync/core.mjs');
  await processTick({...process.env,SUPABASE_URL:url},true);
}
export async function revelationSyncStep(req:Request,res:Response,runBatch=runManualBatch) {
  const catteryId=await authorizedCattery(req,res);
  if(!catteryId||!admin)return;
  if(catteryId!=='7f6d029f-b727-4645-83be-db6ec56d1b46'){res.status(403).json({error:'No sync worker for this cattery.'});return;}
  const {data:job,error}=await admin.from('legacy_sync_jobs').select('id,status,manual_until').eq('cattery_id',catteryId).eq('id',String(req.params.jobId)).maybeSingle();
  if(error||!job){res.status(404).json({error:'Sync could not be found.'});return;}
  if(job.status==='running'&&job.manual_until&&Date.parse(job.manual_until)>Date.now()){
    try{await runBatch();}catch{res.status(503).json({error:'Sync paused after a problem. Tap sync to try again.'});return;}
  }
  await revelationSyncResult(req,res);
}
router.post('/revelation-sync/step/:jobId',(req,res)=>revelationSyncStep(req,res));
export default router;
