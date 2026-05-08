create extension if not exists pgcrypto;

alter table public.project_applications
  alter column status set default 'pending';

update public.project_applications
set status = 'pending'
where status = 'applied';

alter table public.project_applications
  add column if not exists motivation_message text,
  add column if not exists skills text[] not null default '{}',
  add column if not exists portfolio_urls text[] not null default '{}',
  add column if not exists additional_note text,
  add column if not exists rejection_reason text,
  add column if not exists updated_at timestamptz not null default now();

update public.project_applications
set additional_note = coalesce(additional_note, note)
where note is not null
  and (additional_note is null or btrim(additional_note) = '');

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index if not exists idx_project_members_project_id
  on public.project_members(project_id);

create index if not exists idx_project_members_user_id
  on public.project_members(user_id);

alter table public.notifications
  add column if not exists type text,
  add column if not exists link text;

update public.notifications
set type = coalesce(type, event_type)
where type is null;
