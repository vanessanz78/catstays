-- CLI-created; ordered after existing future-dated sync prerequisites.
create function public.catstays_sync_change_summary(target_cattery_id uuid, target_run_id uuid)
returns jsonb language sql stable security invoker set search_path='' as $$
  with changes as (
    select *,row_number() over(partition by target_table,target_id order by id) as first_change,
      row_number() over(partition by target_table,target_id order by id desc) as last_change
    from public.legacy_import_changes
    where cattery_id=target_cattery_id and import_run_id=target_run_id
      and target_table in ('bookings','customers','cats','payments')
  ), net as (
    select a.target_table,a.before_record,b.after_record
    from changes a join changes b using(target_table,target_id)
    where a.first_change=1 and b.last_change=1
  ), counts as (
    select target_table,
      count(*) filter(where before_record is null and after_record is not null) as added,
      count(*) filter(where before_record is not null and after_record is not null
        and (before_record-array['updated_at','legacy_metadata','legacy_import_run_id'])
          is distinct from (after_record-array['updated_at','legacy_metadata','legacy_import_run_id'])) as updated
    from net group by target_table
  ) select coalesce(jsonb_object_agg(target_table,jsonb_build_object('added',added,'updated',updated)),'{}'::jsonb) from counts;
$$;
revoke all on function public.catstays_sync_change_summary(uuid,uuid) from public,anon,authenticated;
grant execute on function public.catstays_sync_change_summary(uuid,uuid) to service_role;
