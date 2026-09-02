-- Run after installing 20260903000100, or inside its transaction before ROLLBACK.
begin;
insert into auth.users (id,email,email_confirmed_at,raw_user_meta_data)
values ('eeeeeeee-0000-4000-8000-000000000001','catstays-staff-uat@example.invalid',now(),'{"account_type":"customer"}'),
('eeeeeeee-0000-4000-8000-000000000002','catstays-other-uat@example.invalid',now(),'{"account_type":"customer"}'),
('eeeeeeee-0000-4000-8000-000000000003','catstays-unverified-uat@example.invalid',null,'{"account_type":"customer"}');
select set_config('request.jwt.claim.sub',(select owner_id::text from public.catteries where id='7f6d029f-b727-4645-83be-db6ec56d1b46'),true);
set local role authenticated;
select public.catstays_save_staff_profile('7f6d029f-b727-4645-83be-db6ec56d1b46',null,'Staff UAT','catstays-staff-uat@example.invalid','0210000000','staff','active');
select public.catstays_save_staff_profile('7f6d029f-b727-4645-83be-db6ec56d1b46',null,'Unverified UAT','catstays-unverified-uat@example.invalid','','manager','invited');
do $$ begin
  if not exists(select 1 from public.staff_memberships where email='catstays-staff-uat@example.invalid' and status='invited' and user_id is null and metadata->>'phone'='0210000000') then raise exception 'FAIL: new profile must await verification'; end if;
end $$;
select set_config('request.jwt.claim.sub','eeeeeeee-0000-4000-8000-000000000003',true);
do $$ begin if public.catstays_accept_staff_access()<>0 then raise exception 'FAIL: unverified claim'; end if; end $$;
select set_config('request.jwt.claim.sub','eeeeeeee-0000-4000-8000-000000000002',true);
do $$ declare denied boolean:=false; begin
  if public.catstays_accept_staff_access()<>0 then raise exception 'FAIL: other email claim'; end if;
  if exists(select 1 from public.staff_memberships where cattery_id='7f6d029f-b727-4645-83be-db6ec56d1b46') then raise exception 'FAIL: staff data leaked'; end if;
  begin perform public.catstays_save_staff_profile('7f6d029f-b727-4645-83be-db6ec56d1b46',null,'Intruder','catstays-other-uat@example.invalid','','staff','active'); exception when others then denied:=true; end;
  if not denied then raise exception 'FAIL: outsider could add staff'; end if;
end $$;
select set_config('request.jwt.claim.sub','eeeeeeee-0000-4000-8000-000000000001',true);
do $$ declare pid uuid; denied boolean:=false; begin
  if public.catstays_accept_staff_access()<>1 then raise exception 'FAIL: verified claim'; end if;
  if public.catstays_accept_staff_access()<>0 then raise exception 'FAIL: claim not idempotent'; end if;
  select id into pid from public.staff_memberships where user_id=auth.uid();
  perform public.catstays_save_staff_profile('7f6d029f-b727-4645-83be-db6ec56d1b46',pid,'Staff UAT updated','catstays-staff-uat@example.invalid','0211111111','staff','active');
  if not exists(select 1 from public.staff_memberships where id=pid and metadata->>'phone'='0211111111') then raise exception 'FAIL: self phone update'; end if;
  begin perform public.catstays_save_staff_profile('7f6d029f-b727-4645-83be-db6ec56d1b46',pid,'Staff UAT','catstays-staff-uat@example.invalid','','manager','active'); exception when others then denied:=true; end;
  if not denied then raise exception 'FAIL: self role escalation'; end if;
  denied:=false;
  begin perform public.catstays_save_staff_profile('ffffffff-0000-4000-8000-000000000001',pid,'Staff UAT','catstays-staff-uat@example.invalid','','staff','active'); exception when others then denied:=true; end;
  if not denied then raise exception 'FAIL: cross-tenant edit'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select owner_id::text from public.catteries where id='7f6d029f-b727-4645-83be-db6ec56d1b46'),true);
set local role authenticated;
select public.catstays_save_staff_profile('7f6d029f-b727-4645-83be-db6ec56d1b46',(select id from public.staff_memberships where email='catstays-staff-uat@example.invalid'),'Staff UAT','catstays-staff-uat@example.invalid','','staff','disabled');
select set_config('request.jwt.claim.sub','eeeeeeee-0000-4000-8000-000000000001',true);
do $$ begin
  if public.catstays_accept_staff_access()<>0 or public.catstays_is_cattery_staff('7f6d029f-b727-4645-83be-db6ec56d1b46') then raise exception 'FAIL: disabled access'; end if;
end $$;
set local role anon;
do $$ declare denied boolean:=false; begin
  begin perform public.catstays_accept_staff_access(); exception when insufficient_privilege then denied:=true; end;
  if not denied then raise exception 'FAIL: anonymous execute'; end if;
end $$;
reset role;
select 'PASS: owner create, verification, idempotency, self-edit, RLS isolation, role escalation, cross-tenant, disabled and anonymous guards' as result;
rollback;
