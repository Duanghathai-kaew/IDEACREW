-- Align notifications schema with current API implementation.
-- Safe to run on existing databases.

create extension if not exists pgcrypto;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  category text not null,
  event_type text not null default 'project_status_changed',
  title text not null,
  message text not null,
  status text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Ensure required columns exist on older schemas.
alter table public.notifications
  add column if not exists event_type text;

alter table public.notifications
  alter column event_type set default 'project_status_changed';

update public.notifications
set event_type = 'project_status_changed'
where event_type is null or btrim(event_type) = '';

alter table public.notifications
  alter column event_type set not null;

-- Normalize category type to text so SQL seeds can compare without enum casts.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'notifications'
      and column_name = 'category'
      and udt_name <> 'text'
  ) then
    execute 'alter table public.notifications alter column category type text using category::text';
  end if;
end $$;

-- Keep category values constrained to supported tabs.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notifications_category_check'
      and conrelid = 'public.notifications'::regclass
  ) then
    execute
      'alter table public.notifications add constraint notifications_category_check check (category in (''my-project'', ''applied''))';
  end if;
end $$;

create index if not exists idx_notifications_user_id_created_at
  on public.notifications(user_id, created_at desc);

create index if not exists idx_notifications_user_id_is_read
  on public.notifications(user_id, is_read);

create index if not exists idx_notifications_project_id
  on public.notifications(project_id);
