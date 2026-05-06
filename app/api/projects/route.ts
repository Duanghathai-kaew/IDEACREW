import { NextResponse } from "next/server";

import { createMyProjectStatusNotification } from "@/lib/server/notifications";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SimpleProject } from "@/lib/simpleMockData";
import { ProjectFormData, ProjectStatus } from "@/types/project";

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

type CreateProjectBody = {
  ownerId?: string;
  formData?: ProjectFormData;
  status?: ProjectStatus;
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
        .in("status", ["open", "reviewing", "closed"])
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

export async function POST(request: Request) {
  const body = (await request.json()) as CreateProjectBody;
  const ownerId = body.ownerId?.trim();
  const formData = body.formData;
  const status = body.status ?? "draft";

  if (!ownerId) {
    return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
  }

  if (!formData) {
    return NextResponse.json({ error: "formData is required" }, { status: 400 });
  }

  const title = formData.title.trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const { data: projectId, error: rpcError } = await supabaseAdmin.rpc(
    "create_project_with_relations",
    {
      p_owner_id: ownerId,
      p_status: status,
      p_form_data: formData,
    },
  );

  if (rpcError) {
    return NextResponse.json(
      { error: rpcError.message },
      { status: 500 },
    );
  }

  if (status === "approved" || status === "rejected_by_admin") {
    await createMyProjectStatusNotification({
      userId: ownerId,
      projectId: String(projectId),
      projectTitle: title,
      status,
    });
  }

  return NextResponse.json(
    {
      data: {
        id: String(projectId),
        title,
        status,
        ownerId,
      },
    },
    { status: 201 },
  );
}
