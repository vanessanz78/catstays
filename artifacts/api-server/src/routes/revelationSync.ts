import { Router, type IRouter, type Request, type Response } from 'express';
import { createClient } from '@supabase/supabase-js';
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
  const { data, error } = await admin.rpc('catstays_request_legacy_sync', { target_cattery_id: catteryId });
  if (error) {
    res.status(409).json({ error: 'Sync could not be queued. Check the connection, or wait ten minutes after a recent request and try again.' });
    return;
  }
  res.status(202).json({ success: true, ...data });
}
router.post('/revelation-sync/request', requestRevelationSync);
export async function revelationSyncResult(req: Request, res: Response) {
  const catteryId = await authorizedCattery(req, res);
  if (!catteryId || !admin) return;
  const { data: job, error } = await admin.from('legacy_sync_jobs').select('id,status,import_run_id').eq('cattery_id',catteryId).eq('id',String(req.params.jobId)).maybeSingle();
  if (error || !job) { res.status(404).json({ error: 'Sync progress could not be loaded.' }); return; }
  if (job.status !== 'completed') { res.json({ status: job.status }); return; }
  const summary = await admin.rpc('catstays_sync_change_summary', { target_cattery_id:catteryId, target_run_id:job.import_run_id });
  if (summary.error) { res.status(503).json({ error: 'Sync finished, but its change summary is unavailable.' }); return; }
  res.json({ status:'completed', changes:summary.data });
}
router.get('/revelation-sync/result/:jobId', revelationSyncResult);
export default router;
