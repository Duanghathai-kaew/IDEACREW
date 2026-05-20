do $$
begin
  delete from public.project_categories
  where lower(btrim(category_name)) = 'htrs';

  delete from public.project_position_skills
  where lower(btrim(skill_name)) = 'htrs';

  update public.project_positions
  set required_skills = array_remove(coalesce(required_skills, '{}'::text[]), 'htrs')
  where required_skills is not null
    and 'htrs' = any(required_skills);

  update public.project_categories
  set type = 'skill'
  where lower(btrim(category_name)) in (
    'react',
    'frontend',
    'backend',
    'ux/ui',
    'figma',
    'photography',
    'video editing',
    'web development',
    'พัฒนาเว็บไซต์',
    'ถ่ายรูป',
    'ตัดต่อ'
  )
  and type is distinct from 'skill';

  update public.project_categories
  set type = 'category'
  where lower(btrim(category_name)) in (
    'e-sport',
    'student activity',
    'business',
    'hackathon',
    'content creator'
  )
  and type is distinct from 'category';

  update public.project_categories
  set type = 'category'
  where type is null
     or type not in ('skill', 'category');

  update public.project_categories
  set status = 'pending'
  where status is null
     or status not in ('enabled', 'pending', 'rejected', 'disabled');

  delete from public.project_categories a
  using public.project_categories b
  where a.ctid < b.ctid
    and a.project_id = b.project_id
    and a.type = b.type
    and lower(btrim(a.category_name)) = lower(btrim(b.category_name));
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where c.conname = 'project_categories_type_check'
      and n.nspname = 'public'
  ) then
    alter table public.project_categories
      add constraint project_categories_type_check
      check (type in ('skill', 'category'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where c.conname = 'project_categories_status_check'
      and n.nspname = 'public'
  ) then
    alter table public.project_categories
      add constraint project_categories_status_check
      check (status in ('enabled', 'pending', 'rejected', 'disabled'));
  end if;
end $$;

create unique index if not exists idx_project_categories_project_type_name_normalized
  on public.project_categories (
    project_id,
    type,
    lower(btrim(category_name))
  );