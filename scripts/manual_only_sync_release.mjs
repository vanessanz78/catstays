// Replit Shell only. Credentials stay in existing server environment.
import {readFileSync} from 'node:fs';
const project='iwyoezwqorddkmqnjbif',version='20260904002000',mode=process.argv[2];
if(!process.env.SUPABASE_ACCESS_TOKEN||new URL(process.env.VITE_SUPABASE_URL).hostname!==`${project}.supabase.co`)throw Error('Wrong project configuration');
async function sql(query){
 const r=await fetch(`https://api.supabase.com/v1/projects/${project}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query}),signal:AbortSignal.timeout(60000)});
 if(!r.ok)throw Error(`Database check failed (${r.status}): ${String((await r.json()).message||'').slice(0,400)}`);
 return r.json();
}
try{
 const migration=readFileSync(`supabase/migrations/${version}_manual_only_sync.sql`,'utf8');
 const test=readFileSync('supabase/tests/manual_only_sync_rollback.sql','utf8');
 if(mode==='rehearse')console.log(JSON.stringify(await sql(`begin; ${migration}\n${test.replace(/^begin;\s*$/m,'')}`)));
 else if(mode==='apply'){
  if((await sql(`select version from supabase_migrations.schema_migrations where version='${version}'`)).length)throw Error('Already recorded');
  await sql(`begin; ${migration}\ninsert into supabase_migrations.schema_migrations(version,name,statements) values('${version}','manual_only_sync',ARRAY[$migration$${migration}$migration$]);commit;`);
  console.log(JSON.stringify({applied:version}));
 }else if(mode==='verify')console.log(JSON.stringify(await sql(test)));
 else if(mode==='status')console.log(JSON.stringify(await sql(`select (select active from cron.job where jobname='catstays-revelation-nightly') as automatic_schedule_active,(select count(*) from public.legacy_sync_jobs where cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46' and status='running' and manual_until>now()) as active_manual_windows`)));
 else throw Error('Choose rehearse, apply, verify, or status');
}catch(error){console.error(error.message);process.exitCode=1;}
