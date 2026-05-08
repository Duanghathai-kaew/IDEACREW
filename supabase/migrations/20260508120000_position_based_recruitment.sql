alter type project_status add value if not exists 'recruiting';
alter type project_status add value if not exists 'closed';

alter table public.projects
  add column if not exists status project_status not null default 'open';

create index if not exists idx_projects_status
  on public.projects(status);

alter table public.project_applications
  add column if not exists position_id uuid
  references public.project_positions(id)
  on delete set null;

create index if not exists idx_project_applications_position_id
  on public.project_applications(position_id);

alter table public.project_members
  add column if not exists position_id uuid
  references public.project_positions(id)
  on delete set null;

create index if not exists idx_project_members_position_id
  on public.project_members(position_id);

alter table public.project_positions
  add column if not exists accepted_count int not null default 0;

alter table public.project_positions
  drop constraint if exists position_accepted_count_check;

alter table public.project_positions
  add constraint position_accepted_count_check
  check (accepted_count <= needed_count);

create index if not exists idx_project_positions_project_id
  on public.project_positions(project_id);

create or replace function public.check_project_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_id uuid;
  v_remaining_positions int;
begin
  v_project_id := coalesce(new.project_id, old.project_id);

  select count(*)
  into v_remaining_positions
  from public.project_positions
  where project_id = v_project_id
    and accepted_count < needed_count;

  if v_remaining_positions = 0 then
    update public.projects
    set status = 'closed'
    where id = v_project_id;
  else
    update public.projects
    set status = 'recruiting'
    where id = v_project_id;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_project_positions_completion
on public.project_positions;

create trigger trg_project_positions_completion
after update on public.project_positions
for each row
when (new.accepted_count is distinct from old.accepted_count)
execute function public.check_project_completion();

update public.projects
set status = 'open'
where status is null;