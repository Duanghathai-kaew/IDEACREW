alter table if exists public.projects
  add column if not exists admin_feedback text;
