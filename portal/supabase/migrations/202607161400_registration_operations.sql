-- 501 Elite OS: registration operations foundation.
-- Adds reversible archiving, immutable audit history, exact duplicate discovery,
-- and indexes used by the executive registration database.

alter table public.registrations
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references auth.users(id) on delete set null;

create or replace function public.protect_registration_archive_fields()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if (old.archived_at, old.archived_by) is distinct from (new.archived_at, new.archived_by)
    and coalesce(auth.role(), '') <> 'service_role'
    and not public.is_active_organization_member(array['executive', 'admin'])
  then
    raise exception 'Executive or administrator access is required to archive registrations.';
  end if;

  return new;
end;
$$;

drop trigger if exists registrations_protect_archive_fields on public.registrations;
create trigger registrations_protect_archive_fields
before update on public.registrations
for each row execute function public.protect_registration_archive_fields();

create index if not exists registrations_active_status_season_updated_idx
  on public.registrations (status, season, updated_at desc)
  where archived_at is null;

create index if not exists registrations_archived_at_idx
  on public.registrations (archived_at desc)
  where archived_at is not null;

create index if not exists registrations_player_id_idx
  on public.registrations (player_id)
  where player_id is not null;

create index if not exists registrations_season_created_idx
  on public.registrations (season, created_at desc);

create index if not exists profiles_normalized_email_idx
  on public.profiles (lower(btrim(email)))
  where email is not null and btrim(email) <> '';

create index if not exists players_duplicate_identity_idx
  on public.players (
    lower(regexp_replace(btrim(first_name), '[[:space:]]+', ' ', 'g')),
    lower(regexp_replace(btrim(last_name), '[[:space:]]+', ' ', 'g')),
    date_of_birth
  )
  where date_of_birth is not null;

create table if not exists public.registration_audit_log (
  id bigint generated always as identity primary key,
  registration_id uuid references public.registrations(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action ~ '^[a-z][a-z0-9_.-]*$'),
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists registration_audit_registration_occurred_idx
  on public.registration_audit_log (registration_id, occurred_at desc);

create index if not exists registration_audit_actor_occurred_idx
  on public.registration_audit_log (actor_user_id, occurred_at desc)
  where actor_user_id is not null;

create index if not exists registration_audit_action_occurred_idx
  on public.registration_audit_log (action, occurred_at desc);

alter table public.registration_audit_log enable row level security;

drop policy if exists "Executives can view registration audit history"
  on public.registration_audit_log;
create policy "Executives can view registration audit history"
on public.registration_audit_log
for select
to authenticated
using (public.is_active_organization_member(array['executive', 'admin']));

revoke all on public.registration_audit_log from anon, authenticated;
grant select on public.registration_audit_log to authenticated;

create or replace function public.write_registration_audit()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  audit_action text;
  audit_registration_id uuid;
  audit_details jsonb;
  changed_columns text[];
begin
  if tg_table_name = 'registrations' then
    -- The deleted registration is preserved in details; the nullable foreign key
    -- cannot reference a row after this AFTER DELETE trigger completes.
    audit_registration_id := case when tg_op = 'DELETE' then null else new.id end;

    if tg_op = 'DELETE' then
      audit_action := 'registration.deleted';
      audit_details := jsonb_build_object(
        'registration', to_jsonb(old),
        'family_id', old.family_id,
        'player_id', old.player_id
      );
    elsif tg_op = 'INSERT' then
      audit_action := 'registration.created';
      audit_details := jsonb_build_object('registration', to_jsonb(new));
    else
      select coalesce(array_agg(key order by key), '{}'::text[])
      into changed_columns
      from jsonb_each(to_jsonb(new)) new_value
      where (to_jsonb(old) -> new_value.key) is distinct from new_value.value;

      if old.archived_at is null and new.archived_at is not null then
        audit_action := 'registration.archived';
      elsif old.archived_at is not null and new.archived_at is null then
        audit_action := 'registration.restored';
      elsif old.status is distinct from new.status then
        audit_action := 'registration.status_changed';
      else
        audit_action := 'registration.updated';
      end if;

      audit_details := jsonb_build_object(
        'changed_fields', to_jsonb(changed_columns),
        'before', to_jsonb(old),
        'after', to_jsonb(new)
      );
    end if;
  elsif tg_table_name = 'registration_documents' then
    audit_registration_id := case when tg_op = 'DELETE' then old.registration_id else new.registration_id end;
    audit_action := case tg_op
      when 'INSERT' then 'document.created'
      when 'UPDATE' then 'document.updated'
      else 'document.deleted'
    end;
    audit_details := jsonb_build_object(
      'document_id', case when tg_op = 'DELETE' then old.id else new.id end,
      'before', case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
      'after', case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    );
  else
    audit_registration_id := case when tg_op = 'DELETE' then old.registration_id else new.registration_id end;
    audit_action := case tg_op
      when 'INSERT' then 'release.created'
      when 'UPDATE' then 'release.updated'
      else 'release.deleted'
    end;
    audit_details := jsonb_build_object(
      'release_id', case when tg_op = 'DELETE' then old.id else new.id end,
      'agreement_key', case when tg_op = 'DELETE' then old.agreement_key else new.agreement_key end,
      'response', case when tg_op = 'DELETE' then old.response else new.response end
    );
  end if;

  insert into public.registration_audit_log (
    registration_id,
    actor_user_id,
    action,
    details
  ) values (
    audit_registration_id,
    coalesce(
      auth.uid(),
      nullif(current_setting('app.audit_actor_id', true), '')::uuid
    ),
    audit_action,
    audit_details
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists registrations_write_audit on public.registrations;
create trigger registrations_write_audit
after insert or update or delete on public.registrations
for each row execute function public.write_registration_audit();

drop trigger if exists registration_documents_write_audit on public.registration_documents;
create trigger registration_documents_write_audit
after insert or update or delete on public.registration_documents
for each row execute function public.write_registration_audit();

drop trigger if exists registration_releases_write_audit on public.registration_release_acceptances;
create trigger registration_releases_write_audit
after insert or update or delete on public.registration_release_acceptances
for each row execute function public.write_registration_audit();

-- Called only by the server-side deletion endpoint. PostgreSQL functions run in
-- the caller's transaction, so registration removal and orphan cleanup either
-- all succeed or all roll back. The verified human actor is propagated to every
-- audit trigger fired by cascades through a transaction-local setting.
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

  select
    count(*)::integer,
    coalesce(array_agg(document.storage_path order by document.storage_path), '{}'::text[])
  into document_count, storage_paths
  from public.registration_documents document
  where document.registration_id = delete_registration_cascade.registration_id;

  select count(*)::integer
  into release_count
  from public.registration_release_acceptances acceptance
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
        select 1
        from public.registrations remaining_registration
        where remaining_registration.player_id = player.id
      );
    get diagnostics player_delete_count = row_count;
  end if;

  delete from public.families family
  where family.id = deleted_family_id
    and not exists (
      select 1
      from public.registrations remaining_registration
      where remaining_registration.family_id = family.id
    )
    and not exists (
      select 1
      from public.players remaining_player
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

-- Bulk archive companion for the executive endpoint. Already-archived or unknown
-- IDs are intentionally ignored, making retries safe and predictable.
create or replace function public.archive_registrations(
  registration_ids uuid[],
  actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  affected_ids uuid[];
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

  if coalesce(cardinality(registration_ids), 0) = 0 then
    return jsonb_build_object(
      'affected_count', 0,
      'registration_ids', '[]'::jsonb
    );
  end if;

  perform set_config('app.audit_actor_id', actor_user_id::text, true);

  with archived as (
    update public.registrations registration
    set
      archived_at = now(),
      archived_by = archive_registrations.actor_user_id
    where registration.id = any(archive_registrations.registration_ids)
      and registration.archived_at is null
    returning registration.id
  )
  select coalesce(array_agg(archived.id order by archived.id), '{}'::uuid[])
  into affected_ids
  from archived;

  return jsonb_build_object(
    'affected_count', cardinality(affected_ids),
    'registration_ids', to_jsonb(affected_ids)
  );
end;
$$;

revoke all on function public.archive_registrations(uuid[], uuid)
  from public, anon, authenticated;
grant execute on function public.archive_registrations(uuid[], uuid)
  to service_role;

-- This view intentionally exposes only duplicate metadata. Names, email addresses,
-- and dates of birth stay in their RLS-protected source tables.
create or replace view public.registration_duplicate_candidates
with (security_invoker = true)
as
with normalized as (
  select
    registration.id as registration_id,
    encode(
      digest(
        lower(btrim(profile.email)) || '|' ||
        lower(regexp_replace(btrim(player.first_name), '[[:space:]]+', ' ', 'g')) || '|' ||
        lower(regexp_replace(btrim(player.last_name), '[[:space:]]+', ' ', 'g')) || '|' ||
        player.date_of_birth::text,
        'sha256'
      ),
      'hex'
    ) as duplicate_group_key
  from public.registrations registration
  join public.families family on family.id = registration.family_id
  join public.profiles profile on profile.id = family.primary_parent_id
  join public.players player on player.id = registration.player_id
  where registration.archived_at is null
    and profile.email is not null
    and btrim(profile.email) <> ''
    and btrim(player.first_name) <> ''
    and btrim(player.last_name) <> ''
    and player.date_of_birth is not null
), duplicate_groups as (
  select duplicate_group_key, count(*)::integer as duplicate_count
  from normalized
  group by duplicate_group_key
  having count(*) > 1
)
select
  normalized.registration_id,
  normalized.duplicate_group_key,
  duplicate_groups.duplicate_count,
  true as possible_duplicate
from normalized
join duplicate_groups using (duplicate_group_key);

revoke all on public.registration_duplicate_candidates from anon, authenticated;
grant select on public.registration_duplicate_candidates to authenticated;

-- Store human-reviewed duplicate decisions separately from source records. This
-- makes a later merge workflow possible without mutating or deleting data today.
create table if not exists public.registration_duplicate_reviews (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  duplicate_registration_id uuid not null references public.registrations(id) on delete cascade,
  disposition text not null default 'pending'
    check (disposition in ('pending', 'confirmed', 'not_duplicate')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  check (registration_id < duplicate_registration_id),
  unique (registration_id, duplicate_registration_id)
);

create index if not exists registration_duplicate_reviews_disposition_idx
  on public.registration_duplicate_reviews (disposition, created_at desc);

alter table public.registration_duplicate_reviews enable row level security;

drop policy if exists "Executives can view duplicate reviews"
  on public.registration_duplicate_reviews;
create policy "Executives can view duplicate reviews"
on public.registration_duplicate_reviews
for select
to authenticated
using (public.is_active_organization_member(array['executive', 'admin']));

drop policy if exists "Executives can create duplicate reviews"
  on public.registration_duplicate_reviews;
create policy "Executives can create duplicate reviews"
on public.registration_duplicate_reviews
for insert
to authenticated
with check (
  public.is_active_organization_member(array['executive', 'admin'])
  and reviewed_by = (select auth.uid())
);

drop policy if exists "Executives can update duplicate reviews"
  on public.registration_duplicate_reviews;
create policy "Executives can update duplicate reviews"
on public.registration_duplicate_reviews
for update
to authenticated
using (public.is_active_organization_member(array['executive', 'admin']))
with check (
  public.is_active_organization_member(array['executive', 'admin'])
  and reviewed_by = (select auth.uid())
);

revoke all on public.registration_duplicate_reviews from anon, authenticated;
grant select, insert, update on public.registration_duplicate_reviews to authenticated;
