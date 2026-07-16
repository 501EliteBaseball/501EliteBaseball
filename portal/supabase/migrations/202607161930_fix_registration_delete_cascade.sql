-- Prevent audited child-row deletes from racing the parent registration cascade.
-- Safe to run repeatedly after 202607161400_registration_operations.sql.
create or replace function public.delete_registration_cascade(
  registration_id uuid,
  actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  deleted_family_id uuid;
  deleted_player_id uuid;
  document_count integer;
  release_count integer;
  player_delete_count integer := 0;
  family_delete_count integer := 0;
  storage_paths text[];
begin
  if not exists (
    select 1
    from public.organization_members member
    where member.user_id = actor_user_id
      and member.active = true
      and member.role in ('executive', 'admin')
  ) then
    raise exception 'Executive or administrator access is required.'
      using errcode = '42501';
  end if;

  perform set_config('app.audit_actor_id', actor_user_id::text, true);

  select count(*)::integer,
    coalesce(array_agg(document.storage_path order by document.storage_path), '{}'::text[])
  into document_count, storage_paths
  from public.registration_documents document
  where document.registration_id = delete_registration_cascade.registration_id;

  select count(*)::integer
  into release_count
  from public.registration_release_acceptances acceptance
  where acceptance.registration_id = delete_registration_cascade.registration_id;

  -- Audit these deletes while the referenced registration still exists.
  delete from public.registration_documents document
  where document.registration_id = delete_registration_cascade.registration_id;

  delete from public.registration_release_acceptances acceptance
  where acceptance.registration_id = delete_registration_cascade.registration_id;

  delete from public.registrations registration
  where registration.id = delete_registration_cascade.registration_id
  returning registration.family_id, registration.player_id
  into deleted_family_id, deleted_player_id;

  if not found then
    raise exception 'Registration not found.' using errcode = 'P0002';
  end if;

  if deleted_player_id is not null then
    delete from public.players player
    where player.id = deleted_player_id
      and player.family_id = deleted_family_id
      and not exists (
        select 1 from public.registrations remaining_registration
        where remaining_registration.player_id = player.id
      );
    get diagnostics player_delete_count = row_count;
  end if;

  delete from public.families family
  where family.id = deleted_family_id
    and not exists (
      select 1 from public.registrations remaining_registration
      where remaining_registration.family_id = family.id
    )
    and not exists (
      select 1 from public.players remaining_player
      where remaining_player.family_id = family.id
    );
  get diagnostics family_delete_count = row_count;

  return jsonb_build_object(
    'registration_id', delete_registration_cascade.registration_id,
    'deleted', true,
    'player_removed', player_delete_count = 1,
    'family_removed', family_delete_count = 1,
    'document_records_removed', document_count,
    'release_records_removed', release_count,
    'storage_paths', to_jsonb(storage_paths)
  );
end;
$$;

revoke all on function public.delete_registration_cascade(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.delete_registration_cascade(uuid, uuid)
  to service_role;
