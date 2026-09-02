-- Explicit activation gate after deploying and verifying the guarded Edge worker.
-- The scheduler checks once per minute but only starts ONE daily Auckland job.
-- It does not store credentials in cron commands, source files or client bundles.
begin;
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
do $$
begin
 if not exists(select 1 from vault.secrets where name='catstays_revelation_sync_trigger') then raise exception 'Sync trigger secret is missing'; end if;
 if not exists(select 1 from public.legacy_sync_connections where cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46' and enabled) then raise exception 'Source connection is not enabled'; end if;
end;
$$;
select cron.schedule('catstays-revelation-nightly','* * * * *',$job$
  select net.http_post(
    url:='https://iwyoezwqorddkmqnjbif.supabase.co/functions/v1/revelation-sync',
    headers:=jsonb_build_object('Content-Type','application/json','x-sync-token',
      (select decrypted_secret from vault.decrypted_secrets where name='catstays_revelation_sync_trigger')),
    body:='{}'::jsonb,timeout_milliseconds:=110000
  ) where exists (
    select 1 from public.legacy_sync_connections c
    where c.cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46' and c.enabled
    and (
      exists(select 1 from public.legacy_sync_jobs j where j.cattery_id=c.cattery_id and j.status='running' and (j.lease_until is null or j.lease_until<now()))
      or ((now() at time zone c.schedule_timezone)::time >= '00:01'::time
        and not exists(select 1 from public.legacy_sync_jobs j where j.cattery_id=c.cattery_id and j.local_day=(now() at time zone c.schedule_timezone)::date))
    )
  );
$job$);
commit;
