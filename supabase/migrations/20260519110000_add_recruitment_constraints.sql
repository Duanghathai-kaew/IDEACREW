do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where c.conname = 'project_applications_project_id_applicant_id_key'
      and n.nspname = 'public'
  ) then
    alter table public.project_applications
      add constraint project_applications_project_id_applicant_id_key
      unique (project_id, applicant_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where c.conname = 'project_members_project_id_user_id_key'
      and n.nspname = 'public'
  ) then
    alter table public.project_members
      add constraint project_members_project_id_user_id_key
      unique (project_id, user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where c.conname = 'project_positions_accepted_count_nonnegative_check'
      and n.nspname = 'public'
  ) then
    alter table public.project_positions
      add constraint project_positions_accepted_count_nonnegative_check
      check (accepted_count >= 0);
  end if;
end $$;
