create sequence if not exists public.family_account_number_seq start with 1001;

create table if not exists public.family_accounts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null unique references public.families(id) on delete cascade,
  account_number bigint not null unique default nextval('public.family_account_number_seq'),
  status text not null default 'active' check (status in ('active','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_charges (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.family_accounts(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  category text not null default 'team_fee' check (category in ('team_fee','uniform','tournament','equipment','fundraising','other')),
  description text not null check (char_length(description) between 1 and 160),
  amount_cents integer not null check (amount_cents > 0),
  due_date date,
  status text not null default 'posted' check (status in ('posted','void')),
  notes text not null default '',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.account_payments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.family_accounts(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  paid_at timestamptz not null default now(),
  method text not null check (method in ('cash','check','venmo','cash_app','paypal','card','other')),
  reference text not null default '',
  notes text not null default '',
  status text not null default 'posted' check (status in ('posted','void')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists account_charges_account_idx on public.account_charges(account_id, created_at desc);
create index if not exists account_payments_account_idx on public.account_payments(account_id, paid_at desc);

insert into public.family_accounts(family_id)
select id from public.families on conflict (family_id) do nothing;

create or replace function public.create_family_account() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.family_accounts(family_id) values(new.id) on conflict (family_id) do nothing;
  return new;
end; $$;
drop trigger if exists families_create_account on public.families;
create trigger families_create_account after insert on public.families for each row execute function public.create_family_account();

alter table public.family_accounts enable row level security;
alter table public.account_charges enable row level security;
alter table public.account_payments enable row level security;

create policy "Executives manage family accounts" on public.family_accounts for all to authenticated
using (exists(select 1 from public.organization_members m where m.user_id=auth.uid() and m.active and m.role in ('executive','admin')))
with check (exists(select 1 from public.organization_members m where m.user_id=auth.uid() and m.active and m.role in ('executive','admin')));
create policy "Executives manage charges" on public.account_charges for all to authenticated
using (exists(select 1 from public.organization_members m where m.user_id=auth.uid() and m.active and m.role in ('executive','admin')))
with check (exists(select 1 from public.organization_members m where m.user_id=auth.uid() and m.active and m.role in ('executive','admin')));
create policy "Executives manage payments" on public.account_payments for all to authenticated
using (exists(select 1 from public.organization_members m where m.user_id=auth.uid() and m.active and m.role in ('executive','admin')))
with check (exists(select 1 from public.organization_members m where m.user_id=auth.uid() and m.active and m.role in ('executive','admin')));

grant select,insert,update,delete on public.family_accounts,public.account_charges,public.account_payments to authenticated;
grant usage,select on sequence public.family_account_number_seq to authenticated;
