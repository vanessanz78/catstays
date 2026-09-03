// Replit Shell only. No customer payloads or credentials are printed.
import {readFileSync} from 'node:fs';
const project='iwyoezwqorddkmqnjbif',version='20260904001000';
const env=process.env,mode=process.argv[2];
if(!env.SUPABASE_ACCESS_TOKEN||new URL(env.VITE_SUPABASE_URL).hostname!==`${project}.supabase.co`)throw Error('Expected CatStays server configuration is missing');
async function sql(query){
  const r=await fetch(`https://api.supabase.com/v1/projects/${project}/database/query`,{method:'POST',redirect:'error',headers:{Authorization:`Bearer ${env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query}),signal:AbortSignal.timeout(60000)});
  if(!r.ok)throw Error(`Database operation failed (${r.status}): ${String((await r.json()).message||'See private logs').slice(0,400)}`);
  return r.json();
}
try{
  const migration=readFileSync(`supabase/migrations/${version}_sync_change_summary.sql`,'utf8');
  const test=readFileSync('supabase/tests/sync_summary_rollback.sql','utf8');
  if(mode==='rehearse')console.log(JSON.stringify(await sql(`begin; ${migration}\n${test.replace(/^begin;\s*$/m,'')}`)));
  else if(mode==='apply'){
    if((await sql(`select version from supabase_migrations.schema_migrations where version='${version}'`)).length)throw Error('Migration already recorded');
    await sql(`begin; ${migration}\ninsert into supabase_migrations.schema_migrations(version,name,statements) values('${version}','sync_change_summary',ARRAY[$migration$${migration}$migration$]); commit;`);
    console.log(JSON.stringify({applied:version}));
  }else if(mode==='verify')console.log(JSON.stringify(await sql(test)));
  else if(mode==='dismiss'){
    // Exact tenant and screenshot boundary authorized by Vanessa. Preserve all records.
    console.log(JSON.stringify(await sql(`with dismissed as (
      update public.legacy_reconciliation_issues set resolution_status='ignored',resolved_at=now(),
        resolved_by=(select owner_id from public.catteries where id='7f6d029f-b727-4645-83be-db6ec56d1b46'),
        details=details||jsonb_build_object('dismissal_reason','Owner requested dismissal of historical notices shown on 3 September 2026; not a data repair','previous_resolution_status','open')
      where cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46' and resolution_status='open' and created_at<='2026-09-03T05:29:56Z'::timestamptz
      returning id
    ) select count(*) as dismissed_count from dismissed`)));
  }else throw Error('Choose rehearse, apply, verify, or dismiss');
}catch(error){console.error(error.message);process.exitCode=1;}
