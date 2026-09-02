/** Read-only Revelation -> CatStays migration runner. Server-only; no emails. */
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
const PROJECT='iwyoezwqorddkmqnjbif';
export const TENANT='7f6d029f-b727-4645-83be-db6ec56d1b46';
const sha=x=>createHash('sha256').update(x).digest('hex');
export function validateBundle(b) {
  if(b.format!==1 || b.cattery_id!==TENANT || b.source!=='revelation_pets') throw Error('Unexpected source or destination');
  for(const key of ['customers','cats','bookings','payments']) {
    if(!Array.isArray(b[key]) || b[key].some(r=>!r.external_id) || new Set(b[key].map(r=>r.external_id)).size!==b[key].length) throw Error(`Invalid ${key} identities`);
  }
  const customers=new Set(b.customers.map(r=>r.external_id));
  if(b.cats.some(c=>!customers.has(c.owner_external_id))) throw Error('Unresolved cat owner');
  const cats=new Set(b.cats.map(r=>r.external_id));
  if(b.relations.some(r=>r.cat_external_ids.some(c=>!cats.has(c)))) throw Error('Unresolved booking cat');
  if(b.bookings.some(r=>!r.check_in||!r.check_out||r.check_out<r.check_in))throw Error('Invalid booking dates');
  if(b.payments.some(p=>!Number.isFinite(p.amount)||!p.paid_on||typeof p.legacy_deleted!=='boolean'))throw Error('Invalid payment');
  return Object.fromEntries(['customers','cats','bookings','relations','payments','raw_sources'].map(k=>[k,b[k].length]));
}
export function apiClient(env=process.env) {
  const url=env.VITE_SUPABASE_URL;const key=env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key||new URL(url).hostname!==`${PROJECT}.supabase.co`)throw Error('Destination configuration is missing or mismatched');
  return async function api(path,body,method='POST') {
    const r=await fetch(`${url}/rest/v1/${path}`,{method,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation'},
      ...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(60000)});
    if(!r.ok) {const data=await r.json().catch(()=>({}));throw Error(`CatStays ${path.split('?')[0]} failed (${r.status}, ${data.code||'unknown'}): ${String(data.message||'').slice(0,240)}`);}
    return r.status===204?null:r.json();
  };
}
export async function executeBundle(bundle,phase,existingRun) {
  const counts=validateBundle(bundle); const api=apiClient();
  const run=existingRun || await api('rpc/catstays_create_legacy_import_run',{target_cattery_id:TENANT,source_system:'revelation_pets',import_kind:'full_history',source_manifest:{counts,source_snapshot:'2026-09-02',runner_version:1}});
  const runRows=await api(`legacy_import_runs?id=eq.${run}&cattery_id=eq.${TENANT}&select=id,status,source_manifest`,undefined,'GET');
  if(runRows.length!==1)throw Error('Import run tenant mismatch');
  console.log(JSON.stringify({run_id:run,phase,counts}));
  if(phase==='archive') {
    for(const s of bundle.raw_sources) {
      const file=await api('rpc/catstays_stage_legacy_source_file',{target_import_run_id:run,report_type:s.name.replace(/\.[^.]+$/,''),source_file_name:s.name,
        source_sha256:s.sha256,byte_size:s.bytes,row_count:s.rows.length,headline_totals:{},archive_notes:'Private original source retained locally; all parsed rows preserved here.'});
      for(let start=0;start<s.rows.length;start+=200) {
        const rows=s.rows.slice(start,start+200).map((r,i)=>({row_number:start+i+1,external_id:r.external_id||String(r.id||r.booking_id||''),
          record_checksum:sha(JSON.stringify(r)),raw_record:r}));
        const n=await api('rpc/catstays_stage_legacy_source_records',{target_source_file_id:file,records:rows});
        if(n!==rows.length)throw Error('Source staging count mismatch');
      }
      console.log(JSON.stringify({archived:s.name,rows:s.rows.length}));
    }
    for(let start=0;start<bundle.issues.length;start+=200)await api('legacy_reconciliation_issues',bundle.issues.slice(start,start+200).map(i=>({import_run_id:run,cattery_id:TENANT,
      issue_type:i.type,severity:'warning',summary:'Historical source record requires review; original source is retained.',details:i})));
    await api('rpc/catstays_set_legacy_import_status',{target_import_run_id:run,new_status:'ready',reconciliation:{archive_complete:true,counts}});
    console.log(JSON.stringify({run_id:run,archive_complete:true}));return run;
  }
  if(!['customers','cats','bookings','relations','payments'].includes(phase))throw Error('Unknown import phase');
  if(!existingRun || !['ready','importing'].includes(runRows[0].status))throw Error('Archive must be staged and reconciled first');
  const fn=phase==='relations'?'booking_relations':phase;
  const records=bundle[phase];
  for(let start=0;start<records.length;start+=100) {
    const result=await api(`rpc/catstays_import_legacy_${fn}`,{target_import_run_id:run,records:records.slice(start,start+100)});
    if(result.invalid_dates||result.unmatched_owners)throw Error('Batch rejected source records');
    console.log(JSON.stringify({phase,processed:Math.min(start+100,records.length),total:records.length,result}));
  }
  console.log(JSON.stringify({run_id:run,phase,complete:true}));return run;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  try {
    const args=process.argv.slice(2); const bundle=JSON.parse(gunzipSync(readFileSync(args[0])));
    if(!args[1]||args[1]==='validate')console.log(JSON.stringify({valid:true,counts:validateBundle(bundle)}));
    else await executeBundle(bundle,args[1],args[2]);
  } catch(error) {console.error(String(error.message).replaceAll(process.env.REVELATION_PETS_API_KEY||'__no_key__','[REDACTED]'));process.exitCode=1;}
}
