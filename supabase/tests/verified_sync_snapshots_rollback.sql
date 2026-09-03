begin;
set local role service_role;
do $$
declare tenant constant uuid:='7f6d029f-b727-4645-83be-db6ec56d1b46'; c jsonb;
begin
 c:=public.catstays_checked_source_bookings(tenant,array['9307','9306','9305']);
 if not c ? '9307' then raise exception 'Clean checkpointed booking snapshot unavailable'; end if;
 update public.bookings set legacy_metadata=legacy_metadata||'{"source_record_checksum":"unverified-test"}'::jsonb where cattery_id=tenant and external_source='revelation_pets' and external_id='9307';
 if public.catstays_checked_source_bookings(tenant,array['9307']) ? '9307' then raise exception 'Unverified booking reused'; end if;
end; $$;
reset role;
do $$ begin
 if has_function_privilege('anon','public.catstays_checked_source_bookings(uuid,text[])','execute') or has_function_privilege('authenticated','public.catstays_checked_source_bookings(uuid,text[])','execute') then raise exception 'Snapshot exposed'; end if;
end; $$;
select 'verified snapshot checks passed; changes rolled back' as result;
rollback;
