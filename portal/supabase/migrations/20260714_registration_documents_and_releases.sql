-- 501 Elite OS: launch-critical registration documents, releases, and staff access.
-- Additive migration. Existing registration tables and data are preserved.

create table if not exists public.organization_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('coach', 'executive', 'admin')),
  can_view_medical boolean not null default false,
  can_view_documents boolean not null default false,
  active boolean not null default true,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.registration_release_acceptances (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  signer_user_id uuid not null references auth.users(id) on delete restrict,
  agreement_key text not null,
  agreement_version text not null,
  agreement_title text not null,
  agreement_snapshot text not null,
  response text not null check (response in ('accepted', 'declined')),
  accepted boolean not null default false,
  signature_name text not null,
  signed_at timestamptz not null default now(),
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (registration_id, agreement_key, agreement_version)
);

create table if not exists public.registration_documents (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  document_type text not null check (document_type in ('birth_certificate')),
  bucket_id text not null default 'registration-documents',
  storage_path text not null unique,
  original_filename text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  status text not null default 'uploaded' check (status in ('uploaded', 'verified', 'rejected', 'replaced')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists registration_release_registration_idx
  on public.registration_release_acceptances(registration_id);

create index if not exists registration_release_player_idx
  on public.registration_release_acceptances(player_id);

create index if not exists registration_documents_registration_idx
  on public.registration_documents(registration_id);

create index if not exists registration_documents_player_idx
  on public.registration_documents(player_id);

create or replace function public.is_active_organization_member(required_roles text[] default null)
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
      and (
        required_roles is null
        or member.role = any(required_roles)
      )
  );
$$;

create or replace function public.can_view_registration_documents()
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
      and member.role in ('executive', 'admin')
      and member.can_view_documents = true
  );
$$;

alter table public.organization_members enable row level security;
alter table public.registration_release_acceptances enable row level security;
alter table public.registration_documents enable row level security;

drop policy if exists "Members can view their own access" on public.organization_members;
create policy "Members can view their own access"
on public.organization_members
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Admins can view organization access" on public.organization_members;
create policy "Admins can view organization access"
on public.organization_members
for select
to authenticated
using (public.is_active_organization_member(array['admin']));

drop policy if exists "Admins can add organization access" on public.organization_members;
create policy "Admins can add organization access"
on public.organization_members
for insert
to authenticated
with check (public.is_active_organization_member(array['admin']));

drop policy if exists "Admins can update organization access" on public.organization_members;
create policy "Admins can update organization access"
on public.organization_members
for update
to authenticated
using (public.is_active_organization_member(array['admin']))
with check (public.is_active_organization_member(array['admin']));

drop policy if exists "Admins can remove organization access" on public.organization_members;
create policy "Admins can remove organization access"
on public.organization_members
for delete
to authenticated
using (public.is_active_organization_member(array['admin']));

drop policy if exists "Parents can view their release acceptances" on public.registration_release_acceptances;
create policy "Parents can view their release acceptances"
on public.registration_release_acceptances
for select
to authenticated
using (
  signer_user_id = (select auth.uid())
  and exists (
    select 1
    from public.registrations registration
    join public.families family on family.id = registration.family_id
    where registration.id = registration_id
      and family.primary_parent_id = (select auth.uid())
  )
);

drop policy if exists "Parents can add their release acceptances" on public.registration_release_acceptances;
create policy "Parents can add their release acceptances"
on public.registration_release_acceptances
for insert
to authenticated
with check (
  signer_user_id = (select auth.uid())
  and accepted = true
  and exists (
    select 1
    from public.registrations registration
    join public.families family on family.id = registration.family_id
    where registration.id = registration_id
      and family.primary_parent_id = (select auth.uid())
      and registration.player_id = player_id
  )
);

drop policy if exists "Parents can update their release acceptances" on public.registration_release_acceptances;
create policy "Parents can update their release acceptances"
on public.registration_release_acceptances
for update
to authenticated
using (signer_user_id = (select auth.uid()))
with check (
  signer_user_id = (select auth.uid())
  and accepted = true
);

drop policy if exists "Staff can view release acceptances" on public.registration_release_acceptances;
create policy "Staff can view release acceptances"
on public.registration_release_acceptances
for select
to authenticated
using (public.is_active_organization_member(array['executive', 'admin']));

drop policy if exists "Parents can view their registration documents" on public.registration_documents;
create policy "Parents can view their registration documents"
on public.registration_documents
for select
to authenticated
using (
  uploaded_by = (select auth.uid())
  and exists (
    select 1
    from public.registrations registration
    join public.families family on family.id = registration.family_id
    where registration.id = registration_id
      and family.primary_parent_id = (select auth.uid())
  )
);

drop policy if exists "Parents can add their registration documents" on public.registration_documents;
create policy "Parents can add their registration documents"
on public.registration_documents
for insert
to authenticated
with check (
  uploaded_by = (select auth.uid())
  and exists (
    select 1
    from public.registrations registration
    join public.families family on family.id = registration.family_id
    where registration.id = registration_id
      and family.primary_parent_id = (select auth.uid())
      and registration.player_id = player_id
  )
);

drop policy if exists "Parents can update their registration documents" on public.registration_documents;
create policy "Parents can update their registration documents"
on public.registration_documents
for update
to authenticated
using (uploaded_by = (select auth.uid()))
with check (uploaded_by = (select auth.uid()));

drop policy if exists "Staff can view registration documents" on public.registration_documents;
create policy "Staff can view registration documents"
on public.registration_documents
for select
to authenticated
using (public.can_view_registration_documents());

drop policy if exists "Staff can review registration documents" on public.registration_documents;
create policy "Staff can review registration documents"
on public.registration_documents
for update
to authenticated
using (public.can_view_registration_documents())
with check (public.can_view_registration_documents());

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'registration-documents',
  'registration-documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Parents can upload registration documents" on storage.objects;
create policy "Parents can upload registration documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'registration-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and storage.extension(name) in ('jpg', 'jpeg', 'png', 'pdf')
);

drop policy if exists "Parents can read their registration documents" on storage.objects;
create policy "Parents can read their registration documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'registration-documents'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.can_view_registration_documents()
  )
);

drop policy if exists "Parents can replace their registration documents" on storage.objects;
create policy "Parents can replace their registration documents"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'registration-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'registration-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Parents can delete their registration documents" on storage.objects;
create policy "Parents can delete their registration documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'registration-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

grant select on public.organization_members to authenticated;
grant select, insert, update on public.registration_release_acceptances to authenticated;
grant select, insert, update on public.registration_documents to authenticated;
grant execute on function public.is_active_organization_member(text[]) to authenticated;
grant execute on function public.can_view_registration_documents() to authenticated;

comment on table public.registration_release_acceptances is
  'Versioned electronic acceptance records for each registration agreement.';

comment on table public.registration_documents is
  'Private metadata for registration documents stored in Supabase Storage.';

comment on table public.organization_members is
  'Delegated staff access for coaches, executives, and administrators.';
