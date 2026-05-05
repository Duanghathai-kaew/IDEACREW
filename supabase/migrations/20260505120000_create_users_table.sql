-- Create users table for TU login
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  tu_id text unique,
  created_at timestamptz default now()
);

-- Optional index for faster lookup by email
create index if not exists idx_users_email on public.users (email);
