create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  account_type text not null default 'individual',
  display_name text,
  organization_name text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_not_blank check (length(trim(both from email)) > 0),
  constraint profiles_account_type_valid check (account_type in ('individual', 'organization')),
  constraint profiles_display_name_not_blank check (display_name is null or length(trim(both from display_name)) > 0),
  constraint profiles_organization_name_not_blank check (organization_name is null or length(trim(both from organization_name)) > 0)
);

create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_profiles_onboarding_completed on public.profiles (onboarding_completed);

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles
for delete
using (auth.uid() = id);

create or replace function public.handle_new_auth_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (
    id,
    email,
    account_type,
    display_name,
    organization_name,
    onboarding_completed
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data->>'account_type', ''), 'individual'),
    nullif(new.raw_user_meta_data->>'display_name', ''),
    nullif(new.raw_user_meta_data->>'organization_name', ''),
    false
  )
  on conflict (id) do update
  set
    email = excluded.email,
    account_type = excluded.account_type,
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    organization_name = coalesce(public.profiles.organization_name, excluded.organization_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute function public.handle_new_auth_profile();
