import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { SimpleProject } from "@/lib/simpleMockData";
import { Benefit, ProjectFormData, ProjectStatus } from "@/types/project";

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

const allowedBenefits: Benefit[] = [
  "certificate",
  "experience",
  "portfolio",
  "compensation",
  "network",
];

export const runtime = "nodejs";

function mapStatus(status: string | null): "open" | "closed" {
  return status === "open" ? "open" : "closed";
}

function mapWorkMode(mode: ProjectFormData["workMode"]) {
  if (mode === "onsite" || mode === "hybrid" || mode === "online") return mode;
  return "online";
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

  const today = new Date().toISOString().slice(0, 10);
  const normalizedBenefits = formData.benefits.filter((benefit): benefit is Benefit =>
    allowedBenefits.includes(benefit),
  );

  const { data: insertedProject, error: insertProjectError } = await supabaseAdmin
    .from("projects")
    .insert({
      owner_id: ownerId,
      title,
      summary: formData.summary.trim() || null,
      description: formData.description.trim() || null,
      work_mode: mapWorkMode(formData.workMode),
      working_hours: formData.workingHours?.trim() || null,
      application_start_date: formData.applicationStartDate || today,
      application_end_date: formData.applicationEndDate || today,
      benefits: normalizedBenefits,
      compensation_detail: formData.compensationDetail?.trim() || null,
      status,
    })
    .select("id")
    .single();

  if (insertProjectError) {
    return NextResponse.json(
      { error: insertProjectError.message },
      { status: 500 },
    );
  }

  const projectId = insertedProject.id as string;

  try {
    const categories = Array.from(
      new Set(
        formData.categories
          .map((category) => category.trim())
          .filter((category) => category.length > 0),
      ),
    );

    if (categories.length > 0) {
      const { error: categoriesError } = await supabaseAdmin
        .from("project_categories")
        .insert(
          categories.map((category) => ({
            project_id: projectId,
            category_name: category,
          })),
        );

      if (categoriesError) throw categoriesError;
    }

    const normalizedPositions = formData.positions
      .map((position) => ({
        title: position.title.trim(),
        neededCount: Math.max(1, Number(position.neededCount || 1)),
        preferredQualifications: position.preferredQualifications?.trim() || null,
        skills: Array.from(
          new Set(
            position.skills
              .map((skill) => skill.trim())
              .filter((skill) => skill.length > 0),
          ),
        ),
        basicQualifications: Array.from(
          new Set(
            position.basicQualifications
              .map((qualification) => qualification.trim())
              .filter((qualification) => qualification.length > 0),
          ),
        ),
      }))
      .filter((position) => position.title.length > 0);

    if (normalizedPositions.length > 0) {
      const { data: insertedPositions, error: positionsError } = await supabaseAdmin
        .from("project_positions")
        .insert(
          normalizedPositions.map((position) => ({
            project_id: projectId,
            title: position.title,
            needed_count: position.neededCount,
            preferred_qualifications: position.preferredQualifications,
          })),
        )
        .select("id,title");

      if (positionsError) throw positionsError;

      const positionIdByTitle = new Map(
        (insertedPositions ?? []).map((position) => [
          position.title as string,
          position.id as string,
        ]),
      );

      const positionSkillsPayload: Array<{ position_id: string; skill_name: string }> = [];
      const positionQualificationsPayload: Array<{
        position_id: string;
        qualification_text: string;
      }> = [];

      for (const position of normalizedPositions) {
        const positionId = positionIdByTitle.get(position.title);
        if (!positionId) continue;

        for (const skill of position.skills) {
          positionSkillsPayload.push({ position_id: positionId, skill_name: skill });
        }

        for (const qualification of position.basicQualifications) {
          positionQualificationsPayload.push({
            position_id: positionId,
            qualification_text: qualification,
          });
        }
      }

      if (positionSkillsPayload.length > 0) {
        const { error: skillsError } = await supabaseAdmin
          .from("project_position_skills")
          .insert(positionSkillsPayload);
        if (skillsError) throw skillsError;
      }

      if (positionQualificationsPayload.length > 0) {
        const { error: qualificationsError } = await supabaseAdmin
          .from("project_position_basic_qualifications")
          .insert(positionQualificationsPayload);
        if (qualificationsError) throw qualificationsError;
      }
    }
  } catch (error) {
    await supabaseAdmin.from("projects").delete().eq("id", projectId);
    const message =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "Failed to create project";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json(
    {
      data: {
        id: projectId,
        title,
        status,
        ownerId,
      },
    },
    { status: 201 },
  );
}
