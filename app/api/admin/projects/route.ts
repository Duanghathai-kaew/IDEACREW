import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

type DbProject = {
  id: string;
  title: string | null;
  summary: string | null;
  description: string | null;
  status: string | null;
  created_at: string | null;
  application_end_date: string | null;
  owner_id: string;
  working_hours: string | null;
  work_mode: string | null;
  benefits: string[] | null;
  admin_feedback: string | null;
};

type DbProfile = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
};

type DbPosition = {
  project_id: string;
  title: string;
};

type DbCategory = {
  project_id: string;
  category_name: string;
};

type DbSkill = {
  position_id: string;
  skill_name: string;
};

type DbPositionRow = {
  id: string;
  project_id: string;
  title: string;
};

function mapAdminStatus(value: string | null): "pending" | "approved" | "rejected" {
  if (value === "pending_approval") return "pending";
  if (value === "rejected_by_admin") return "rejected";
  return "approved";
}

function safeDate(value: string | null) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
}

export async function GET() {
  const projectsRes = await supabaseAdmin
    .from("projects")
    .select(
      "id,title,summary,description,status,created_at,application_end_date,owner_id,working_hours,work_mode,benefits,admin_feedback",
    )
    .order("created_at", { ascending: false });

  if (projectsRes.error) {
    return NextResponse.json({ error: projectsRes.error.message }, { status: 500 });
  }

  const projects = (projectsRes.data ?? []) as DbProject[];
  const ownerIds = Array.from(new Set(projects.map((p) => p.owner_id)));
  const projectIds = projects.map((p) => p.id);

  const [profilesRes, positionsRes, categoriesRes] = await Promise.all([
    ownerIds.length
      ? supabaseAdmin.from("profiles").select("id,name,email,phone").in("id", ownerIds)
      : Promise.resolve({ data: [], error: null }),
    projectIds.length
      ? supabaseAdmin.from("project_positions").select("id,project_id,title").in("project_id", projectIds)
      : Promise.resolve({ data: [], error: null }),
    projectIds.length
      ? supabaseAdmin.from("project_categories").select("project_id,category_name").in("project_id", projectIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (profilesRes.error || positionsRes.error || categoriesRes.error) {
    return NextResponse.json(
      {
        error:
          profilesRes.error?.message ||
          positionsRes.error?.message ||
          categoriesRes.error?.message ||
          "Failed to load admin project data",
      },
      { status: 500 },
    );
  }

  const positions = (positionsRes.data ?? []) as DbPositionRow[];
  const positionIds = positions.map((p) => p.id);
  const skillsRes = positionIds.length
    ? await supabaseAdmin
        .from("project_position_skills")
        .select("position_id,skill_name")
        .in("position_id", positionIds)
    : { data: [], error: null };

  if (skillsRes.error) {
    return NextResponse.json({ error: skillsRes.error.message }, { status: 500 });
  }

  const profiles = (profilesRes.data ?? []) as DbProfile[];
  const categories = (categoriesRes.data ?? []) as DbCategory[];
  const skills = (skillsRes.data ?? []) as DbSkill[];

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const positionsByProjectId = new Map<string, DbPosition[]>();
  positions.forEach((pos) => {
    const current = positionsByProjectId.get(pos.project_id) ?? [];
    current.push({ project_id: pos.project_id, title: pos.title });
    positionsByProjectId.set(pos.project_id, current);
  });

  const categoryByProjectId = new Map<string, string[]>();
  categories.forEach((cat) => {
    const current = categoryByProjectId.get(cat.project_id) ?? [];
    current.push(cat.category_name);
    categoryByProjectId.set(cat.project_id, current);
  });

  const skillsByPositionId = new Map<string, string[]>();
  skills.forEach((skill) => {
    const current = skillsByPositionId.get(skill.position_id) ?? [];
    current.push(skill.skill_name);
    skillsByPositionId.set(skill.position_id, current);
  });

  const payload = projects.map((project) => {
    const owner = profileMap.get(project.owner_id);
    const projectPositions = positions.filter((p) => p.project_id === project.id);
    const tags = [
      ...(categoryByProjectId.get(project.id) ?? []).map((name, idx) => ({
        id: `${project.id}-cat-${idx}`,
        name,
        type: "category" as const,
        approved: true,
      })),
      ...projectPositions.flatMap((position, idx) =>
        (skillsByPositionId.get(position.id) ?? []).map((name, sidx) => ({
          id: `${project.id}-skill-${idx}-${sidx}`,
          name,
          type: "skill" as const,
          approved: true,
        })),
      ),
    ];

    return {
      id: project.id,
      name: project.title ?? "Untitled project",
      submittedBy: owner?.name ?? "Unknown",
      submittedAt: safeDate(project.created_at),
      deadline: safeDate(project.application_end_date),
      status: mapAdminStatus(project.status),
      description: project.description ?? project.summary ?? "",
      requester: {
        name: owner?.name ?? "Unknown",
        email: owner?.email ?? "-",
        phone: owner?.phone ?? "-",
      },
      info: {
        teamSize: Math.max(projectPositions.length, 1),
        workingHours: project.working_hours ?? "-",
        deadline: safeDate(project.application_end_date),
        workType:
          project.work_mode === "hybrid"
            ? "Hybrid"
            : project.work_mode === "online"
              ? "Remote"
              : "Onsite",
      },
      benefits: project.benefits ?? [],
      positions: projectPositions.map((position) => ({
        role: position.title,
        description: "",
      })),
      tags,
      adminFeedback: project.admin_feedback ?? "",
    };
  });

  return NextResponse.json({ data: payload });
}
