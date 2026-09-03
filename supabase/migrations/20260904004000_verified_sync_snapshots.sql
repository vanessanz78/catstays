-- CLI-created; ordered after existing future-dated sync migrations.
-- Reuse only a fully processed, clean, archived response matching the persisted booking.
create function public.catstays_checked_source_bookings(target_cattery_id uuid,booking_references text[])
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 if current_user<>'service_role' then raise exception 'Service execution required'; end if;
 if target_cattery_id is distinct from '7f6d029f-b727-4645-83be-db6ec56d1b46'::uuid or cardinality(booking_references)>1000 then raise exception 'Invalid snapshot scope'; end if;
 select coalesce(jsonb_object_agg(external_id,record_checksum),'{}'::jsonb) into result from (
  select distinct on (s.external_id) s.external_id,s.record_checksum
  from public.legacy_source_records s
  join public.legacy_sync_jobs j on j.import_run_id=s.import_run_id and j.cattery_id=s.cattery_id
  join public.bookings b on b.cattery_id=s.cattery_id and b.external_source='revelation_pets' and b.external_id=s.external_id
  where s.cattery_id=target_cattery_id and s.external_id=any(booking_references)
   and s.raw_record->>'booking_id'=s.external_id and s.raw_record ? 'overnights'
   and b.customer_id is not null and b.legacy_metadata->>'source_record_checksum'=s.record_checksum
   and ((j.phase='complete' and j.status='completed') or
        (j.phase='details' and j.status in ('running','paused') and not j.queue @> jsonb_build_array(jsonb_build_object('reference',s.external_id))))
   and not exists(select 1 from public.legacy_reconciliation_issues i where i.cattery_id=s.cattery_id and i.import_run_id=s.import_run_id and i.details->>'reference'=s.external_id)
  order by s.external_id,s.imported_at desc
 ) checked;
 return result;
end;
$$;
revoke all on function public.catstays_checked_source_bookings(uuid,text[]) from public,anon,authenticated;
grant execute on function public.catstays_checked_source_bookings(uuid,text[]) to service_role;
