alter table public.project_categories
  add column if not exists type text not null default 'category',
  add column if not exists status text not null default 'pending';
