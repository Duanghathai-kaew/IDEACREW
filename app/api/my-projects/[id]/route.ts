import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { MyProjectStatus } from "@/lib/myProjectMockData";
import { Benefit, ProjectFormData } from "@/types/project";

export const runtime = "nodejs";

type DbProject = {
  id: string;
  owner_id: string;
  title: string;
  summary: string | null;
  description: string | null;
  work_mode: string | null;
  working_hours: string | null;
  application_start_date: string | null;
  status: string | null;
  application_end_date: string | null;
  benefits: string[] | null;
  compensation_detail: string | null;
};

type DbCategory = {
  category_name: string;
};

type DbPosition = {
  id: string;
  title: string;
  needed_count: number;
  preferred_qualifications: string | null;
};

type DbPositionSkill = {
  position_id: string;
  skill_name: string;
};

type DbBasicQualification = {
  position_id: string;
  qualification_text: string;
};

const allowedStatus: MyProjectStatus[] = [
  "draft",
  "open",
  "pending_approval",
  "rejected_by_admin",
  "approved",
  "reviewing",
  "closed",
];

const allowedBenefits: Benefit[] = [
  "certificate",
  "experience",
  "portfolio",
  "compensation",
  "network",
];

function isMissingTableError(message?: string) {
  if (!message) return false;
  return message.includes("Could not find the table");
}

function getOwnerId(request: NextRequest) {
  return request.nextUrl.searchParams.get("ownerId")?.trim() ?? "";
}

function mapStatus(status: string | null): MyProjectStatus {
  if (status && allowedStatus.includes(status as MyProjectStatus)) {
    return status as MyProjectStatus;
  }
  return "draft";
}

function mapWorkMode(mode: string | null): ProjectFormData["workMode"] {
  if (mode === "onsite" || mode === "hybrid" || mode === "online") return mode;
  return "online";
}

function mapBenefits(benefits: string[] | null): Benefit[] {
  if (!benefits) return [];
  return benefits.filter((benefit): benefit is Benefit =>
    allowedBenefits.includes(benefit as Benefit),
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const ownerId = getOwnerId(request);
  const { id } = await context.params;

  if (!ownerId) {
    return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("projects")
    .select(
      "id,owner_id,title,summary,description,work_mode,working_hours,application_start_date,application_end_date,status,benefits,compensation_detail",
    )
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = data as DbProject;
  const [{ data: categories }, { data: positions }] = await Promise.all([
    supabaseAdmin
      .from("project_categories")
      .select("category_name")
      .eq("project_id", id),
    supabaseAdmin
      .from("project_positions")
      .select("id,title,needed_count,preferred_qualifications")
      .eq("project_id", id),
  ]);

  const positionRows = (positions as DbPosition[] | null) ?? [];
  const positionIds = positionRows.map((position) => position.id);

  const [skillsResult, qualificationsResult] =
    positionIds.length === 0
      ? [{ data: [] }, { data: [] }]
      : await Promise.all([
          supabaseAdmin
            .from("project_position_skills")
            .select("position_id,skill_name")
            .in("position_id", positionIds),
          supabaseAdmin
            .from("project_position_basic_qualifications")
            .select("position_id,qualification_text")
            .in("position_id", positionIds),
        ]);

  const skillsByPositionId = new Map<string, string[]>();
  for (const row of ((skillsResult.data ?? []) as DbPositionSkill[])) {
    const current = skillsByPositionId.get(row.position_id) ?? [];
    current.push(row.skill_name);
    skillsByPositionId.set(row.position_id, current);
  }

  const qualificationsByPositionId = new Map<string, string[]>();
  for (const row of ((qualificationsResult.data ?? []) as DbBasicQualification[])) {
    const current = qualificationsByPositionId.get(row.position_id) ?? [];
    current.push(row.qualification_text);
    qualificationsByPositionId.set(row.position_id, current);
  }

  const formData: ProjectFormData = {
    title: project.title,
    categories: ((categories as DbCategory[] | null) ?? []).map(
      (category) => category.category_name,
    ),
    summary: project.summary ?? "",
    description: project.description ?? "",
    workMode: mapWorkMode(project.work_mode),
    workingHours: project.working_hours ?? "",
    applicationStartDate: project.application_start_date
      ? project.application_start_date.slice(0, 10)
      : "",
    applicationEndDate: project.application_end_date
      ? project.application_end_date.slice(0, 10)
      : "",
    benefits: mapBenefits(project.benefits),
    compensationDetail: project.compensation_detail ?? "",
    positions:
      positionRows.length > 0
        ? positionRows.map((position) => ({
            title: position.title,
            neededCount: position.needed_count,
            skills: skillsByPositionId.get(position.id) ?? [],
            basicQualifications: qualificationsByPositionId.get(position.id) ?? [],
            preferredQualifications: position.preferred_qualifications ?? "",
          }))
        : [
            {
              title: "",
              neededCount: 1,
              skills: [],
              basicQualifications: [],
              preferredQualifications: "",
            },
          ],
  };

  return NextResponse.json({
    data: {
      id: project.id,
      title: project.title,
      summary: project.summary ?? "",
      status: mapStatus(project.status),
      applicationEndDate: project.application_end_date
        ? project.application_end_date.slice(0, 10)
        : "",
      formData,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const ownerId = getOwnerId(request);
  const { id } = await context.params;

  if (!ownerId) {
    return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
  }

  const body = (await request.json()) as {
    title?: string;
    summary?: string;
    status?: string;
    applicationEndDate?: string;
    formData?: ProjectFormData;
  };

  const nextFormData = body.formData;
  const status = (body.status ?? "").trim();

  if (!allowedStatus.includes(status as MyProjectStatus)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  if (!nextFormData) {
    const title = (body.title ?? "").trim();
    const summary = (body.summary ?? "").trim();
    const applicationEndDate = (body.applicationEndDate ?? "").trim();

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("projects")
      .update({
        title,
        summary,
        status,
        application_end_date: applicationEndDate || null,
      })
      .eq("id", id)
      .eq("owner_id", ownerId)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  }

  const title = nextFormData.title.trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const normalizedBenefits = nextFormData.benefits.filter((benefit): benefit is Benefit =>
    allowedBenefits.includes(benefit),
  );

  const { data, error } = await supabaseAdmin
    .from("projects")
    .update({
      title,
      summary: nextFormData.summary.trim() || null,
      description: nextFormData.description.trim() || null,
      work_mode: mapWorkMode(nextFormData.workMode),
      working_hours: nextFormData.workingHours?.trim() || null,
      status,
      application_start_date: nextFormData.applicationStartDate || null,
      application_end_date: nextFormData.applicationEndDate || null,
      benefits: normalizedBenefits,
      compensation_detail: nextFormData.compensationDetail?.trim() || null,
    })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: existingPositions } = await supabaseAdmin
    .from("project_positions")
    .select("id")
    .eq("project_id", id);

  const positionIds = (existingPositions ?? []).map(
    (position) => position.id as string,
  );

  if (positionIds.length > 0) {
    await Promise.all([
      supabaseAdmin
        .from("project_position_skills")
        .delete()
        .in("position_id", positionIds),
      supabaseAdmin
        .from("project_position_basic_qualifications")
        .delete()
        .in("position_id", positionIds),
    ]);
  }

  await Promise.all([
    supabaseAdmin.from("project_positions").delete().eq("project_id", id),
    supabaseAdmin.from("project_categories").delete().eq("project_id", id),
  ]);

  const categories = Array.from(
    new Set(
      nextFormData.categories
        .map((category) => category.trim())
        .filter((category) => category.length > 0),
    ),
  );

  if (categories.length > 0) {
    const { error: categoryInsertError } = await supabaseAdmin
      .from("project_categories")
      .insert(
        categories.map((category) => ({
          project_id: id,
          category_name: category,
        })),
      );

    if (categoryInsertError) {
      return NextResponse.json(
        { error: categoryInsertError.message },
        { status: 500 },
      );
    }
  }

  const normalizedPositions = nextFormData.positions
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
    const { data: insertedPositions, error: positionInsertError } = await supabaseAdmin
      .from("project_positions")
      .insert(
        normalizedPositions.map((position) => ({
          project_id: id,
          title: position.title,
          needed_count: position.neededCount,
          preferred_qualifications: position.preferredQualifications,
        })),
      )
      .select("id,title");

    if (positionInsertError) {
      return NextResponse.json(
        { error: positionInsertError.message },
        { status: 500 },
      );
    }

    const positionIdByTitle = new Map(
      (insertedPositions ?? []).map((position) => [
        position.title as string,
        position.id as string,
      ]),
    );

    const skillsPayload: Array<{ position_id: string; skill_name: string }> = [];
    const qualificationsPayload: Array<{
      position_id: string;
      qualification_text: string;
    }> = [];

    for (const position of normalizedPositions) {
      const positionId = positionIdByTitle.get(position.title);
      if (!positionId) continue;

      for (const skill of position.skills) {
        skillsPayload.push({ position_id: positionId, skill_name: skill });
      }
      for (const qualification of position.basicQualifications) {
        qualificationsPayload.push({
          position_id: positionId,
          qualification_text: qualification,
        });
      }
    }

    if (skillsPayload.length > 0) {
      const { error: skillsInsertError } = await supabaseAdmin
        .from("project_position_skills")
        .insert(skillsPayload);
      if (skillsInsertError) {
        return NextResponse.json(
          { error: skillsInsertError.message },
          { status: 500 },
        );
      }
    }

    if (qualificationsPayload.length > 0) {
      const { error: qualificationsInsertError } = await supabaseAdmin
        .from("project_position_basic_qualifications")
        .insert(qualificationsPayload);
      if (qualificationsInsertError) {
        return NextResponse.json(
          { error: qualificationsInsertError.message },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const ownerId = getOwnerId(request);
  const { id } = await context.params;

  if (!ownerId) {
    return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
  }

  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: positions, error: positionsError } = await supabaseAdmin
    .from("project_positions")
    .select("id")
    .eq("project_id", id);

  if (positionsError) {
    return NextResponse.json({ error: positionsError.message }, { status: 500 });
  }

  const positionIds = (positions ?? []).map((position) => position.id as string);

  if (positionIds.length > 0) {
    const [skillsDeleteRes, qualsDeleteRes] = await Promise.all([
      supabaseAdmin
        .from("project_position_skills")
        .delete()
        .in("position_id", positionIds),
      supabaseAdmin
        .from("project_position_basic_qualifications")
        .delete()
        .in("position_id", positionIds),
    ]);

    if (skillsDeleteRes.error || qualsDeleteRes.error) {
      return NextResponse.json(
        {
          error:
            skillsDeleteRes.error?.message ||
            qualsDeleteRes.error?.message ||
            "Failed to delete position metadata",
        },
        { status: 500 },
      );
    }
  }

  const [positionsDeleteRes, categoriesDeleteRes, applicationsDeleteRes] =
    await Promise.all([
      supabaseAdmin.from("project_positions").delete().eq("project_id", id),
      supabaseAdmin.from("project_categories").delete().eq("project_id", id),
      supabaseAdmin.from("project_applications").delete().eq("project_id", id),
    ]);

  const applicationsDeleteError =
    applicationsDeleteRes.error &&
    !isMissingTableError(applicationsDeleteRes.error.message)
      ? applicationsDeleteRes.error
      : null;

  if (
    positionsDeleteRes.error ||
    categoriesDeleteRes.error ||
    applicationsDeleteError
  ) {
    return NextResponse.json(
      {
        error:
          positionsDeleteRes.error?.message ||
          categoriesDeleteRes.error?.message ||
          applicationsDeleteError?.message ||
          "Failed to delete project relations",
      },
      { status: 500 },
    );
  }

  const { error: projectDeleteError } = await supabaseAdmin
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (projectDeleteError) {
    return NextResponse.json(
      { error: projectDeleteError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
