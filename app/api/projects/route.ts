import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { SimpleProject } from "@/lib/simpleMockData";

type DbProject = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  owner_id: string;
};

type DbProfile = {
  id: string;
  name: string | null;
};

type DbPosition = {
  id: string;
  project_id: string;
  title: string;
  needed_count: number;
};

type DbPositionSkill = {
  position_id: string;
  skill_name: string;
};

type DbCategory = {
  project_id: string;
  category_name: string;
};

export const runtime = "nodejs";

function mapStatus(status: string | null): "open" | "closed" {
  return status === "open" ? "open" : "closed";
}

export async function GET() {
  const [{ data: projects, error: projectsError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      supabaseAdmin
        .from("projects")
        .select("id,title,description,status,owner_id")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("profiles").select("id,name"),
    ]);

  if (projectsError) {
    return NextResponse.json(
      { error: projectsError.message },
      { status: 500 },
    );
  }

  if (profilesError) {
    return NextResponse.json(
      { error: profilesError.message },
      { status: 500 },
    );
  }

  const [positionsRes, positionSkillsRes, categoriesRes] = await Promise.all([
    supabaseAdmin
      .from("project_positions")
      .select("id,project_id,title,needed_count"),
    supabaseAdmin
      .from("project_position_skills")
      .select("position_id,skill_name"),
    supabaseAdmin.from("project_categories").select("project_id,category_name"),
  ]);

  if (positionsRes.error || positionSkillsRes.error || categoriesRes.error) {
    return NextResponse.json(
      {
        error:
          positionsRes.error?.message ||
          positionSkillsRes.error?.message ||
          categoriesRes.error?.message ||
          "Failed to fetch project metadata",
      },
      { status: 500 },
    );
  }

  const projectRows = (projects ?? []) as DbProject[];
  const profileRows = (profiles ?? []) as DbProfile[];
  const positionRows = (positionsRes.data ?? []) as DbPosition[];
  const positionSkillRows = (positionSkillsRes.data ?? []) as DbPositionSkill[];
  const categoryRows = (categoriesRes.data ?? []) as DbCategory[];

  const orgByOwnerId = new Map(
    profileRows.map((profile) => [profile.id, profile.name || "Unknown Team"]),
  );

  const skillsByPositionId = new Map<string, string[]>();
  for (const row of positionSkillRows) {
    const current = skillsByPositionId.get(row.position_id) ?? [];
    current.push(row.skill_name);
    skillsByPositionId.set(row.position_id, current);
  }

  const positionsByProjectId = new Map<
    string,
    { role: string; needed: number; skills: string[] }[]
  >();
  for (const row of positionRows) {
    const current = positionsByProjectId.get(row.project_id) ?? [];
    current.push({
      role: row.title,
      needed: row.needed_count,
      skills: skillsByPositionId.get(row.id) ?? [],
    });
    positionsByProjectId.set(row.project_id, current);
  }

  const categoriesByProjectId = new Map<string, string[]>();
  for (const row of categoryRows) {
    const current = categoriesByProjectId.get(row.project_id) ?? [];
    current.push(row.category_name);
    categoriesByProjectId.set(row.project_id, current);
  }

  const payload: SimpleProject[] = projectRows.map((project) => ({
    id: project.id,
    title: project.title,
    org: orgByOwnerId.get(project.owner_id) ?? "Unknown Team",
    description: project.description ?? "",
    status: mapStatus(project.status),
    category: categoriesByProjectId.get(project.id) ?? [],
    positions: positionsByProjectId.get(project.id) ?? [],
  }));

  return NextResponse.json({ data: payload });
}
