// Run in Replit Shell only. Existing secrets never leave server-side memory.
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFileSync,mkdtempSync,writeFileSync,unlinkSync,rmdirSync} from 'node:fs';
const project='iwyoezwqorddkmqnjbif';
const tokenName='catstays_revelation_sync_trigger';
const mode=process.argv[2];
const env=process.env;
if(!env.SUPABASE_ACCESS_TOKEN||!env.REVELATION_PETS_API_KEY||new URL(env.VITE_SUPABASE_URL).hostname!==`${project}.supabase.co`)throw Error('Expected Replit secret configuration is missing');
async function sql(query,parameters=[],read_only=false){
  const r=await fetch(`https://api.supabase.com/v1/projects/${project}/database/query`,{method:'POST',redirect:'error',headers:{Authorization:`Bearer ${env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query,parameters,read_only}),signal:AbortSignal.timeout(60000)});
  if(!r.ok)throw Error(`Cloud database operation failed (${r.status})`);
  return r.json();
}
async function trigger(){
  // Vault decryption requires the privileged database connection, not its read-only role.
  const rows=await sql('select decrypted_secret from vault.decrypted_secrets where name=$1',[tokenName]);
  if(rows.length===1)return rows[0].decrypted_secret;
  if(rows.length)throw Error('Ambiguous trigger configuration');
  if(mode!=='configure')throw Error('Trigger secret has not been configured');
  const value=randomBytes(32).toString('hex');
  await sql('select vault.create_secret($1,$2,$3)',[value,tokenName,'CatStays dedicated read-only Revelation sync trigger']);
  return value;
}
try {
  if(mode==='configure'){
    const value=await trigger();
    if(/[\r\n]/.test(env.REVELATION_PETS_API_KEY))throw Error('Unexpected API key format');
    const directory=mkdtempSync('/tmp/catstays-sync-secret-');
    const file=`${directory}/worker.env`;let r;
    try {
      writeFileSync(file,`REVELATION_PETS_API_KEY=${env.REVELATION_PETS_API_KEY}\nREVELATION_SYNC_TRIGGER_TOKEN=${value}\n`,{mode:0o600});
      r=spawnSync('npx',['--yes','supabase','secrets','set','--project-ref',project,'--env-file',file],{encoding:'utf8',timeout:120000});
    } finally {unlinkSync(file);rmdirSync(directory);}
    if(r.status!==0)throw Error(`Edge secret configuration failed: ${String(r.stderr||r.error?.message||'').replaceAll(env.REVELATION_PETS_API_KEY,'[REDACTED]').replaceAll(value,'[REDACTED]').slice(0,800)}`);
    console.log(JSON.stringify({edge_secrets_configured:true,replit_source_secret_retained:true}));
  } else if(mode==='verify'||mode==='tick'){
    const url=`https://${project}.supabase.co/functions/v1/revelation-sync`;
    if(mode==='verify'){
      const denied=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
      if(denied.status!==403)throw Error(`Unauthenticated trigger was not rejected as expected (${denied.status})`);
      console.log(JSON.stringify({unauthenticated_trigger_denied:true}));
    }
    const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-sync-token':await trigger()},body:'{}',signal:AbortSignal.timeout(120000)});
    const result=await r.json();if(!r.ok)throw Error(`Sync worker failed (${r.status})`);
    console.log(JSON.stringify(result));
  } else if(mode==='activate'){
    throw Error('Automatic sync was disabled by the owner. Use the dashboard sync button.');
  } else if(mode==='status') {
    const rows=await sql("select id,status,phase,local_day,checkpoint,jsonb_array_length(queue) as remaining,last_error from public.legacy_sync_jobs where cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46' order by created_at desc limit 1",[],true);
    // Do not print queued source records or the full checkpoint's pending detail queue.
    console.log(JSON.stringify(rows.map(r=>({...r,checkpoint:{processed:r.checkpoint.processed,warnings:r.checkpoint.warnings,source_pages:r.checkpoint.source_pages}}))));
  } else throw Error('Choose configure, verify, tick, activate, or status');
} catch(error){console.error(error.message);process.exitCode=1;}
