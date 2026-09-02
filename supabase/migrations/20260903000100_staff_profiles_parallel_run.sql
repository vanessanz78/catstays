-- Staff identity is linked only after Supabase has verified the invited email.
-- Uses existing staff_memberships and its tenant-scoped RLS; no parallel accounts.
begin;

create or replace function public.catstays_accept_staff_access()
returns integer language plpgsql security definer set search_path = '' as $$
declare verified_email text; accepted integer;
begin
  select lower(trim(email)) into verified_email from auth.users
    where id = auth.uid() and email_confirmed_at is not null;
  if verified_email is null then return 0; end if;
  update public.staff_memberships set user_id = auth.uid(), status = 'active',
    accepted_at = now(), updated_at = now()
    where lower(email) = verified_email and status = 'invited'
      and role in ('manager','staff') and (user_id is null or user_id = auth.uid());
  get diagnostics accepted = row_count;
  return accepted;
end;

create or replace function public.catstays_save_staff_profile(
  target_cattery uuid, target_profile uuid, profile_name text, profile_email text,
  profile_phone text, profile_role text, profile_status text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  owner_user uuid; existing public.staff_memberships; saved uuid;
  is_owner boolean; own_email text; linked_user uuid; next_status text;
begin
  if auth.uid() is null then raise exception 'Sign in to manage staff profiles'; end if;
  select owner_id into owner_user from public.catteries where id = target_cattery;
  is_owner := owner_user = auth.uid();
  if owner_user is null then raise exception 'Cattery not found'; end if;
  if length(trim(coalesce(profile_name,''))) not between 1 and 120
    or length(trim(coalesce(profile_email,''))) not between 3 and 254
    or trim(profile_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or length(coalesce(profile_phone,'')) > 40 then
    raise exception 'Add a name, valid email and phone number under 40 characters';
  end if;
  if profile_role not in ('owner','manager','staff') or profile_status not in ('invited','active','disabled')
    or profile_role is null or profile_status is null then raise exception 'Invalid role or access status'; end if;
  if target_profile is not null then
    select * into existing from public.staff_memberships
      where id = target_profile and cattery_id = target_cattery for update;
    if existing.id is null then raise exception 'Staff profile not found'; end if;
  end if;
  select lower(email) into own_email from auth.users where id = auth.uid();
  if not is_owner then
    if existing.id is null or existing.user_id is distinct from auth.uid() or existing.status <> 'active'
      or not public.catstays_is_cattery_staff(target_cattery) then raise exception 'Only the owner can manage staff access'; end if;
    if lower(trim(profile_email)) <> lower(existing.email) or profile_role <> existing.role or profile_status <> existing.status
      then raise exception 'Only the owner can change roles, email or access'; end if;
  end if;
  if existing.user_id = owner_user or profile_role = 'owner' then
    if not is_owner or lower(trim(profile_email)) <> own_email
      or profile_role <> 'owner' or profile_status <> 'active'
      or (existing.id is not null and existing.user_id is distinct from owner_user)
      then raise exception 'The cattery owner cannot be replaced or disabled here'; end if;
    linked_user := owner_user;
  else
    if lower(trim(profile_email)) = (select lower(email) from auth.users where id = owner_user)
      then raise exception 'Use the owner profile for this email'; end if;
    linked_user := existing.user_id;
    if existing.id is not null and lower(trim(profile_email)) <> lower(existing.email) and existing.user_id is not null
      then raise exception 'Disable this profile and add a new one to change a linked login email'; end if;
  end if;
  next_status := profile_status;
  if linked_user is null and profile_status <> 'disabled' then next_status := 'invited'; end if;
  if existing.id is null then
    insert into public.staff_memberships (cattery_id,user_id,email,full_name,role,status,invited_by,metadata)
    values (target_cattery,linked_user,lower(trim(profile_email)),trim(profile_name),profile_role,next_status,auth.uid(),
      jsonb_build_object('phone',trim(coalesce(profile_phone,'')))) returning id into saved;
  else
    update public.staff_memberships set full_name=trim(profile_name), email=lower(trim(profile_email)),
      role=profile_role,status=next_status,metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('phone',trim(coalesce(profile_phone,''))),
      updated_at=now() where id=existing.id returning id into saved;
  end if;
  return saved;
end;

revoke all on function public.catstays_accept_staff_access() from public, anon;
revoke all on function public.catstays_save_staff_profile(uuid,uuid,text,text,text,text,text) from public, anon;
grant execute on function public.catstays_accept_staff_access() to authenticated;
grant execute on function public.catstays_save_staff_profile(uuid,uuid,text,text,text,text,text) to authenticated;

-- Owner-approved parallel run. Other catteries and all booking/history rows are untouched.
update public.catteries set website_settings = coalesce(website_settings,'{}'::jsonb) ||
  '{"bookingMode":"test_only","primaryBookingSystem":"revelation_pets"}'::jsonb
where id='7f6d029f-b727-4645-83be-db6ec56d1b46';
commit;
