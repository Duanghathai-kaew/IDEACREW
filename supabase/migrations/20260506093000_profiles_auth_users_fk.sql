-- Align profiles ownership with Supabase Auth best practices.
-- profiles.id must be PK and FK to auth.users(id) with ON DELETE CASCADE.

create extension if not exists pgcrypto;

alter table if exists public.profiles
  add column if not exists username text,
  add column if not exists displayname text,
  add column if not exists email text;

-- Ensure id is UUID and non-null.
alter table if exists public.profiles
  alter column id type uuid using id::uuid;

alter table if exists public.profiles
  alter column id set not null;

-- Drop any existing FK constraints on profiles.id before re-adding the canonical one.
do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'f'
      and conkey = array[
        (select attnum
         from pg_attribute
         where attrelid = 'public.profiles'::regclass
           and attname = 'id'
           and not attisdropped)
      ]::smallint[]
  loop
    execute format('alter table public.profiles drop constraint %I', r.conname);
  end loop;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'p'
  ) then
    alter table public.profiles add constraint profiles_pkey primary key (id);
  end if;
end $$;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

-- Optional best practice: auto-create a profile row after auth user creation.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, displayname)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'displayname', ''))
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
