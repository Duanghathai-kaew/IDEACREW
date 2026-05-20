-- Structured compensation fields for projects
do $$
begin
  if not exists (select 1 from pg_type where typname = 'compensation_type') then
    create type public.compensation_type as enum (
      'per_project',
      'per_month',
      'per_hour',
      'revenue_share',
      'none'
    );
  end if;
end $$;

alter table public.projects
  add column if not exists compensation_enabled boolean not null default false,
  add column if not exists compensation_amount numeric(12, 2),
  add column if not exists compensation_type public.compensation_type,
  add column if not exists compensation_note text;

-- Backfill from legacy text + benefits
update public.projects
set compensation_enabled = true
where compensation_enabled = false
  and (
    compensation_detail is not null
    or 'compensation' = any(benefits)
  );

update public.projects
set compensation_note = compensation_detail
where compensation_note is null
  and compensation_detail is not null
  and compensation_type is null;

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
  v_benefits text[];
  v_comp_enabled boolean;
  v_comp_type public.compensation_type;
  v_comp_amount numeric(12, 2);
begin
  v_benefits := coalesce(
    (
      select array_agg(value::text)
      from jsonb_array_elements_text(coalesce(p_form_data->'benefits', '[]'::jsonb))
    ),
    '{}'::text[]
  );

  v_comp_enabled := coalesce(
    (p_form_data->>'compensationEnabled')::boolean,
    'compensation' = any(v_benefits)
  );

  v_comp_type := nullif(p_form_data->>'compensationType', '')::public.compensation_type;

  if v_comp_enabled and v_comp_type is distinct from 'none' then
    v_comp_amount := nullif(p_form_data->>'compensationAmount', '')::numeric(12, 2);
  else
    v_comp_amount := null;
  end if;

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
    compensation_enabled,
    compensation_amount,
    compensation_type,
    compensation_note,
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
    v_benefits,
    v_comp_enabled,
    v_comp_amount,
    v_comp_type,
    nullif(trim(coalesce(p_form_data->>'compensationNote', '')), ''),
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
  v_position record;
  v_position_id uuid;
  v_category text;
  v_skill text;
  v_qualification text;
  v_benefits text[];
  v_comp_enabled boolean;
  v_comp_type public.compensation_type;
  v_comp_amount numeric(12, 2);
begin
  v_benefits := coalesce(
    (
      select array_agg(value::text)
      from jsonb_array_elements_text(coalesce(p_form_data->'benefits', '[]'::jsonb))
    ),
    '{}'::text[]
  );

  v_comp_enabled := coalesce(
    (p_form_data->>'compensationEnabled')::boolean,
    'compensation' = any(v_benefits)
  );

  v_comp_type := nullif(p_form_data->>'compensationType', '')::public.compensation_type;

  if v_comp_enabled and v_comp_type is distinct from 'none' then
    v_comp_amount := nullif(p_form_data->>'compensationAmount', '')::numeric(12, 2);
  else
    v_comp_amount := null;
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
    benefits = v_benefits,
    compensation_enabled = v_comp_enabled,
    compensation_amount = v_comp_amount,
    compensation_type = v_comp_type,
    compensation_note = nullif(trim(coalesce(p_form_data->>'compensationNote', '')), ''),
    compensation_detail = nullif(trim(coalesce(p_form_data->>'compensationDetail', '')), ''),
    status = p_status::public.project_status,
    updated_at = now()
  where id = p_project_id
    and owner_id = p_owner_id;

  if not found then
    return false;
  end if;

  delete from public.project_position_basic_qualifications
  where position_id in (
    select id from public.project_positions where project_id = p_project_id
  );

  delete from public.project_position_skills
  where position_id in (
    select id from public.project_positions where project_id = p_project_id
  );

  delete from public.project_positions where project_id = p_project_id;
  delete from public.project_categories where project_id = p_project_id;

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

  return true;
end;
$$;
