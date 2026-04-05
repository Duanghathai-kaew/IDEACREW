-- Demo notifications seed
-- Run this in Supabase SQL Editor when notification list is empty.
-- You can keep these default IDs or change them before run.

with input as (
  select
    'e68cc396-34e4-4a9f-aa8b-8819c07812ca'::uuid as v_user_id,
    'affbd8b7-f874-48a7-aa22-290595377859'::uuid as v_project_id
),
project_ref as (
  select
    p.id,
    p.title
  from public.projects p
  join input i on p.id = i.v_project_id
),
insert_my_project as (
  insert into public.notifications (
    user_id,
    project_id,
    category,
    event_type,
    title,
    message,
    status,
    is_read
  )
  select
    i.v_user_id,
    p.id,
    'my-project',
    'project_status_changed',
    'โปรเจกต์อยู่ระหว่างรออนุมัติ',
    'โปรเจกต์ ' || p.title || ' ถูกส่งรอการตรวจสอบแล้ว',
    'pending_approval',
    false
  from input i
  join project_ref p on true
  where not exists (
    select 1
    from public.notifications n
    where n.user_id = i.v_user_id
      and n.project_id = p.id
      and n.category = 'my-project'
      and n.status = 'pending_approval'
  )
  returning id
),
insert_applied as (
  insert into public.notifications (
    user_id,
    project_id,
    category,
    event_type,
    title,
    message,
    status,
    is_read
  )
  select
    i.v_user_id,
    p.id,
    'applied',
    'application_status_changed',
    'ใบสมัครกำลังถูกพิจารณา',
    'ใบสมัครของคุณในโปรเจกต์ ' || p.title || ' อยู่ระหว่างการพิจารณา',
    'in_review',
    false
  from input i
  join project_ref p on true
  where not exists (
    select 1
    from public.notifications n
    where n.user_id = i.v_user_id
      and n.project_id = p.id
      and n.category = 'applied'
      and n.status = 'in_review'
  )
  returning id
)
select
  (select count(*) from insert_my_project) as my_project_inserted,
  (select count(*) from insert_applied) as applied_inserted;
