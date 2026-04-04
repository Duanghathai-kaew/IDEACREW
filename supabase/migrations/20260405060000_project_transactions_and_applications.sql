-- Ensure extension for UUID generation exists.
create extension if not exists pgcrypto;

-- Application records for student applicants.
create table if not exists public.project_applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'applied',
  note text,
  created_at timestamptz not null default now(),
  unique (project_id, applicant_id)
);

create index if not exists idx_project_applications_project_id
  on public.project_applications(project_id);

create index if not exists idx_project_applications_applicant_id
  on public.project_applications(applicant_id);

create or replace function public.create_project_with_relations(
  p_owner_id uuid,
  p_status text,
  p_form_data jsonb
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
    status
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
    p_status::public.project_status
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
      from jsonb_array_elements_text(coalesce(v_position.payload->'skills', '[]'::jsonb))
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

create or replace function public.update_my_project_with_relations(
  p_project_id uuid,
  p_owner_id uuid,
  p_status text,
  p_form_data jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_position_id uuid;
  v_position record;
  v_category text;
  v_skill text;
  v_qualification text;
begin
  if not exists (
    select 1
    from public.projects p
    where p.id = p_project_id and p.owner_id = p_owner_id
  ) then
    return false;
  end if;

  update public.projects
  set
    title = nullif(trim(coalesce(p_form_data->>'title', '')), ''),
    summary = nullif(trim(coalesce(p_form_data->>'summary', '')), ''),
    description = nullif(trim(coalesce(p_form_data->>'description', '')), ''),
    work_mode = coalesce(nullif(trim(coalesce(p_form_data->>'workMode', '')), ''), 'online'),
    working_hours = nullif(trim(coalesce(p_form_data->>'workingHours', '')), ''),
    application_start_date = nullif(p_form_data->>'applicationStartDate', '')::date,
    application_end_date = nullif(p_form_data->>'applicationEndDate', '')::date,
    benefits = coalesce(
      (
        select array_agg(value::text)
        from jsonb_array_elements_text(coalesce(p_form_data->'benefits', '[]'::jsonb))
      ),
      '{}'::text[]
    ),
    compensation_detail = nullif(trim(coalesce(p_form_data->>'compensationDetail', '')), ''),
    status = p_status::public.project_status
  where id = p_project_id
    and owner_id = p_owner_id;

  delete from public.project_position_skills
  where position_id in (
    select id from public.project_positions where project_id = p_project_id
  );

  delete from public.project_position_basic_qualifications
  where position_id in (
    select id from public.project_positions where project_id = p_project_id
  );

  delete from public.project_positions
  where project_id = p_project_id;

  delete from public.project_categories
  where project_id = p_project_id;

  for v_category in
    select distinct trim(value::text)
    from jsonb_array_elements_text(coalesce(p_form_data->'categories', '[]'::jsonb))
  loop
    if v_category <> '' then
      insert into public.project_categories (project_id, category_name)
      values (p_project_id, v_category);
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
      p_project_id,
      trim(v_position.payload->>'title'),
      greatest(coalesce((v_position.payload->>'neededCount')::int, 1), 1),
      nullif(trim(coalesce(v_position.payload->>'preferredQualifications', '')), '')
    )
    returning id into v_position_id;

    for v_skill in
      select distinct trim(value::text)
      from jsonb_array_elements_text(coalesce(v_position.payload->'skills', '[]'::jsonb))
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

  return true;
end;
$$;
