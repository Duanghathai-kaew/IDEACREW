-- Add approval_status enum type for project moderation
do $$
begin
  if not exists (select 1 from pg_type where typname = 'approval_status') then
    create type public.approval_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

-- Add approval_status column to projects table
alter table public.projects
  add column if not exists approval_status public.approval_status not null default 'pending';

-- Create index for filtering by approval_status
create index if not exists idx_projects_approval_status
  on public.projects(approval_status);

-- Set existing projects to approved (they were created before this column existed)
update public.projects
set approval_status = 'approved'
where approval_status is null;

-- Update the create_project_with_relations function to accept and set approval_status
create or replace function public.create_project_with_relations(
  p_owner_id uuid,
  p_status text,
  p_form_data jsonb,
  p_approval_status text default 'pending'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_id uuid;
  v_position record;
  v_position_id uuid;
  v_category text;
  v_skill text;
  v_qualification text;
begin
  insert into public.projects (
    owner_id,
    title,
    summary,
    description,
    work_mode,
    working_hours,
    application_start_date,
    application_end_date,
    benefits,
    compensation_detail,
    status,
    approval_status
  )
  values (
    p_owner_id,
    nullif(trim(coalesce(p_form_data->>'title', '')), ''),
    nullif(trim(coalesce(p_form_data->>'summary', '')), ''),
    nullif(trim(coalesce(p_form_data->>'description', '')), ''),
    coalesce(nullif(trim(coalesce(p_form_data->>'workMode', '')), ''), 'online'),
    nullif(trim(coalesce(p_form_data->>'workingHours', '')), ''),
    nullif(p_form_data->>'applicationStartDate', '')::date,
    nullif(p_form_data->>'applicationEndDate', '')::date,
    coalesce(
      (
        select array_agg(value::text)
        from jsonb_array_elements_text(coalesce(p_form_data->'benefits', '[]'::jsonb))
      ),
      '{}'::text[]
    ),
    nullif(trim(coalesce(p_form_data->>'compensationDetail', '')), ''),
    p_status::public.project_status,
    p_approval_status::public.approval_status
  )
  returning id into v_project_id;

  for v_category in
    select distinct trim(value::text)
    from jsonb_array_elements_text(coalesce(p_form_data->'categories', '[]'::jsonb))
  loop
    if v_category <> '' then
      insert into public.project_categories (project_id, category_name)
      values (v_project_id, v_category);
    end if;
  end loop;

  for v_position in
    select value as payload
    from jsonb_array_elements(coalesce(p_form_data->'positions', '[]'::jsonb))
  loop
    if trim(coalesce(v_position.payload->>'title', '')) = '' then
      continue;
    end if;

    insert into public.project_positions (
      project_id,
      title,
      needed_count,
      preferred_qualifications
    )
    values (
      v_project_id,
      trim(v_position.payload->>'title'),
      greatest(coalesce((v_position.payload->>'neededCount')::int, 1), 1),
      nullif(trim(coalesce(v_position.payload->>'preferredQualifications', '')), '')
    )
    returning id into v_position_id;

    for v_skill in
      select distinct trim(value::text)
      from jsonb_array_elements_text(coalesce(v_position.payload->'requiredSkills', '[]'::jsonb))
    loop
      if v_skill <> '' then
        insert into public.project_position_skills (position_id, skill_name)
        values (v_position_id, v_skill);
      end if;
    end loop;

    for v_qualification in
      select distinct trim(value::text)
      from jsonb_array_elements_text(coalesce(v_position.payload->'basicQualifications', '[]'::jsonb))
    loop
      if v_qualification <> '' then
        insert into public.project_position_basic_qualifications (position_id, qualification_text)
        values (v_position_id, v_qualification);
      end if;
    end loop;
  end loop;

  return v_project_id;
end;
$$;
