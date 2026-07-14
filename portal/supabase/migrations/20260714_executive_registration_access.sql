-- 501 Elite OS: executive registration access and delegated account management.

create or replace function public.can_view_registration_medical()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members member
    where member.user_id = (select auth.uid())
      and member.active = true
      and member.role in ('coach', 'executive', 'admin')
      and member.can_view_medical = true
  );
$$;

drop policy if exists "Staff can view profiles" on public.profiles;
create policy "Staff can view profiles"
on public.profiles
for select
to authenticated
using (public.is_active_organization_member(array['executive', 'admin']));

drop policy if exists "Staff can view families" on public.families;
create policy "Staff can view families"
on public.families
for select
to authenticated
using (public.is_active_organization_member(array['executive', 'admin']));

drop policy if exists "Staff can view players" on public.players;
create policy "Staff can view players"
on public.players
for select
to authenticated
using (public.is_active_organization_member(array['coach', 'executive', 'admin']));

drop policy if exists "Staff can view registrations" on public.registrations;
create policy "Staff can view registrations"
on public.registrations
for select
to authenticated
using (public.is_active_organization_member(array['executive', 'admin']));

drop policy if exists "Staff can view emergency contacts" on public.emergency_contacts;
create policy "Staff can view emergency contacts"
on public.emergency_contacts
for select
to authenticated
using (public.can_view_registration_medical());

drop policy if exists "Staff can view medical profiles" on public.medical_profiles;
create policy "Staff can view medical profiles"
on public.medical_profiles
for select
to authenticated
using (public.can_view_registration_medical());

drop policy if exists "Staff can view uniform profiles" on public.uniform_profiles;
create policy "Staff can view uniform profiles"
on public.uniform_profiles
for select
to authenticated
using (public.is_active_organization_member(array['coach', 'executive', 'admin']));

create or replace function public.grant_organization_access(
  target_email text,
  target_role text,
  allow_medical boolean default false,
  allow_documents boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_user_id uuid;
begin
  if not public.is_active_organization_member(array['admin']) then
    raise exception 'Administrator access is required.';
  end if;

  if target_role not in ('coach', 'executive', 'admin') then
    raise exception 'Invalid organization role.';
  end if;

  if target_role = 'coach' and allow_documents then
    raise exception 'Coaches cannot be granted registration document access.';
  end if;

  select id
  into target_user_id
  from auth.users
  where lower(email) = lower(trim(target_email))
  limit 1;

  if target_user_id is null then
    raise exception 'No 501 Elite OS account exists for that email.';
  end if;

  insert into public.organization_members (
    user_id,
    role,
    can_view_medical,
    can_view_documents,
    active,
    granted_by,
    updated_at
  )
  values (
    target_user_id,
    target_role,
    allow_medical,
    case when target_role = 'coach' then false else allow_documents end,
    true,
    (select auth.uid()),
    now()
  )
  on conflict (user_id) do update
  set
    role = excluded.role,
    can_view_medical = excluded.can_view_medical,
    can_view_documents = excluded.can_view_documents,
    active = true,
    granted_by = excluded.granted_by,
    updated_at = now();

  return target_user_id;
end;
$$;

create or replace function public.revoke_organization_access(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_active_organization_member(array['admin']) then
    raise exception 'Administrator access is required.';
  end if;

  update public.organization_members
  set active = false, updated_at = now()
  where user_id = target_user_id;
end;
$$;

grant select on public.profiles to authenticated;
grant select on public.families to authenticated;
grant select on public.players to authenticated;
grant select on public.registrations to authenticated;
grant select on public.emergency_contacts to authenticated;
grant select on public.medical_profiles to authenticated;
grant select on public.uniform_profiles to authenticated;
grant execute on function public.can_view_registration_medical() to authenticated;
grant execute on function public.grant_organization_access(text, text, boolean, boolean) to authenticated;
grant execute on function public.revoke_organization_access(uuid) to authenticated;
