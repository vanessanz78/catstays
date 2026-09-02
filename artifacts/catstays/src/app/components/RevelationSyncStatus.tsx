import {useEffect,useState} from 'react';
import {supabase} from '@/utils/supabase/client';
import {Button} from './ui/button';

type SyncStatus = { enabled: boolean; last_success_at: string | null; job: any; issues: any[]; issueCount: number };
export function RevelationSyncStatus({catteryId}:{catteryId?:string}) {
  const [status,setStatus]=useState<SyncStatus|null>(null);
  const [error,setError]=useState(false);
  const [refresh,setRefresh]=useState(0);
  useEffect(()=>{
    if(!catteryId)return;
    let active=true;
    const load=async()=>{
      try {
        const connection=await supabase.from('legacy_sync_connections').select('enabled,last_success_at').eq('cattery_id',catteryId).maybeSingle();
        if(connection.error)throw connection.error;
        if(!connection.data){if(active)setStatus(null);return;}
        const [job,issues]=await Promise.all([
          supabase.from('legacy_sync_jobs').select('id,status,phase,local_day,updated_at,last_error,processed:checkpoint->processed,warnings:checkpoint->warnings').eq('cattery_id',catteryId).order('created_at',{ascending:false}).limit(1),
          supabase.from('legacy_reconciliation_issues').select('id,summary,issue_type',{count:'exact'}).eq('cattery_id',catteryId).eq('resolution_status','open').order('created_at',{ascending:false}).limit(10),
        ]);
        if(job.error||issues.error)throw job.error||issues.error;
        if(active){setStatus({...connection.data,job:job.data?.[0],issues:issues.data||[],issueCount:issues.count||0});setError(false);}
      }catch{if(active)setError(true);}
    };
    void load();const timer=setInterval(()=>void load(),30000);
    return()=>{active=false;clearInterval(timer);};
  },[catteryId,refresh]);
  if(!status&&!error)return null;
  return <section className="rounded-2xl border border-[#E8DED4] bg-white p-5 space-y-3" aria-label="Revelation Pets synchronization">
    <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-lg">Revelation Pets connection</h3><Button variant="outline" size="sm" onClick={()=>setRefresh(n=>n+1)}>Refresh status</Button></div>
    <p className="text-sm text-[#4E5871]">Revelation Pets remains your main system. This is a one-way copy into CatStays; CatStays edits are preserved and conflicts are listed for review.</p>
    {error ? <p role="alert" className="text-sm text-red-700">We couldn't verify sync status. Don't assume the data is up to date—please try again.</p> : <>
      <p className="text-sm font-medium">{!status?.enabled?'Connection paused':status.job?.status==='running'?`Refreshing ${status.job.phase} · ${Number(status.job.processed||0).toLocaleString()} bookings checked`:status.job?.status==='failed'?'Refresh needs attention':status.job?.status==='completed'?'Latest API refresh completed':'Initial history imported · API refresh not completed yet'}</p>
      <p className="text-sm text-[#4E5871]">Last completed API refresh: {status?.last_success_at?new Date(status.last_success_at).toLocaleString('en-NZ',{timeZone:'Pacific/Auckland'}):'Not yet verified'} (New Zealand time).</p>
      {status?.job?.last_error&&<p role="alert" className="text-sm text-red-700">{status.job.last_error}</p>}
      {!!status?.issueCount&&<details className="rounded-lg bg-amber-50 p-3 text-sm"><summary className="cursor-pointer font-medium">{status.issueCount.toLocaleString()} source records or changes need review</summary><p className="mt-2">These records are preserved, not silently discarded. Showing the latest {status.issues.length} notices.</p><ul className="mt-2 list-disc pl-5 space-y-1">{status.issues.map(i=><li key={i.id}>{i.summary}</li>)}</ul></details>}
    </>}
    <p className="text-xs leading-5 text-[#4E5871]">The API does not supply every field. Customer credits, attachments and some historical/report-only details retain their last exported snapshot and need a fresh export to update. A completed API refresh is not a claim that every Revelation Pets feature has been migrated.</p>
  </section>;
}
