// Replit Shell only. Never print secrets or source customer records.
import { readFileSync } from 'node:fs';
const project = 'iwyoezwqorddkmqnjbif';
const version = '20260904000000';
const mode = process.argv[2];
const env = process.env;
if (!env.SUPABASE_ACCESS_TOKEN || new URL(env.VITE_SUPABASE_URL).hostname !== `${project}.supabase.co`) throw Error('Expected CatStays server configuration is missing');
async function sql(query) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${project}/database/query`, {
    method: 'POST', redirect: 'error',
    headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }), signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw Error(`Database operation failed (${response.status}): ${String((await response.json()).message || 'See private database logs').slice(0,400)}`);
  return response.json();
}
const migration = readFileSync(`supabase/migrations/${version}_manual_revelation_sync.sql`, 'utf8');
const body = migration.replace(/^begin;\s*$/m, '').replace(/^commit;\s*$/m, '');
try {
  if (mode === 'rehearse') {
    const test = readFileSync('supabase/tests/manual_revelation_sync_rollback.sql', 'utf8').replace(/^begin;\s*$/m, '');
    console.log(JSON.stringify(await sql(`begin; set local lock_timeout='1s'; ${body}\n${test}`)));
  } else if (mode === 'apply') {
    const applied = await sql(`select version from supabase_migrations.schema_migrations where version='${version}'`);
    if (applied.length) throw Error('Migration is already recorded; do not reapply');
    await sql(`begin; set local lock_timeout='3s'; ${body}\ninsert into supabase_migrations.schema_migrations(version,name,statements) values('${version}','manual_revelation_sync',ARRAY[$migration$${body}$migration$]); commit;`);
    console.log(JSON.stringify({ applied: version }));
  } else if (mode === 'verify') {
    console.log(JSON.stringify(await sql(readFileSync('supabase/tests/manual_revelation_sync_rollback.sql', 'utf8'))));
    console.log(JSON.stringify(await sql("select jobname,active from cron.job where jobname='catstays-revelation-nightly'")));
  } else if (mode === 'issues') {
    console.log(JSON.stringify(await sql("select issue_type,count(*) from public.legacy_reconciliation_issues where cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46' and resolution_status='open' group by issue_type order by count(*) desc")));
  } else throw Error('Choose rehearse, apply, verify, or issues');
} catch (error) { console.error(error.message); process.exitCode = 1; }
