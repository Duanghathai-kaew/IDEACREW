-- Full profile schema for profile page (safe/idempotent).
-- Covers: basic info, skills/interests, links, and project portfolio.

create extension if not exists pgcrypto;

-- Main profile fields on existing profiles table.
alter table public.profiles
  add column if not exists headline text,
  add column if not exists status text,
  add column if not exists faculty text,
  add column if not exists major text,
  add column if not exists year text,
  add column if not exists student_id text,
  add column if not exists phone text,
  add column if not exists location text,
  add column if not exists bio text,
  add column if not exists avatar_url text,
  add column if not exists skills text[] not null default '{}'::text[],
  add column if not exists interests text[] not null default '{}'::text[],
  add column if not exists updated_at timestamptz not null default now();

-- Links section (Portfolio + Social).
create table if not exists public.profile_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  link_type text not null check (link_type in ('portfolio', 'social')),
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profile_links_user_type_order
  on public.profile_links(user_id, link_type, sort_order);

-- Project portfolio cards.
create table if not exists public.profile_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  role text not null,
  year text not null,
  description text not null default '',
  tags text[] not null default '{}'::text[],
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profile_projects_user_order
  on public.profile_projects(user_id, sort_order);

-- Common trigger for updated_at.
create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_profile_links_set_updated_at on public.profile_links;
create trigger trg_profile_links_set_updated_at
before update on public.profile_links
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_profile_projects_set_updated_at on public.profile_projects;
create trigger trg_profile_projects_set_updated_at
before update on public.profile_projects
for each row
execute function public.set_updated_at_timestamp();
