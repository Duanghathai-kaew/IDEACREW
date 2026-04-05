import { NextRequest, NextResponse } from "next/server";

import { createMyProjectStatusNotification } from "@/lib/server/notifications";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { MyProjectStatus } from "@/lib/myProjectMockData";
import { Benefit, ProjectFormData } from "@/types/project";
import { CreatorProjectStatus } from "@/types/status";

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

function mapCreatorProjectStatus(status: string | null): CreatorProjectStatus {
  if (
    status === "draft" ||
    status === "open" ||
    status === "pending_approval" ||
    status === "rejected_by_admin" ||
    status === "approved" ||
    status === "reviewing" ||
    status === "closed"
  ) {
    return status;
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

  const { data: currentProject, error: currentProjectError } = await supabaseAdmin
    .from("projects")
    .select("id,title,status")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (currentProjectError) {
    return NextResponse.json(
      { error: currentProjectError.message },
      { status: 500 },
    );
  }

  if (!currentProject) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
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

    if (currentProject.status !== status) {
      await createMyProjectStatusNotification({
        userId: ownerId,
        projectId: id,
        projectTitle: title,
        status: mapCreatorProjectStatus(status),
      });
    }

    return NextResponse.json({ ok: true });
  }

  const title = nextFormData.title.trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const filteredFormData: ProjectFormData = {
    ...nextFormData,
    benefits: nextFormData.benefits.filter((benefit): benefit is Benefit =>
      allowedBenefits.includes(benefit),
    ),
    workMode: mapWorkMode(nextFormData.workMode),
  };

  const { data: updated, error: updateError } = await supabaseAdmin.rpc(
    "update_my_project_with_relations",
    {
      p_project_id: id,
      p_owner_id: ownerId,
      p_status: status,
      p_form_data: filteredFormData,
    },
  );

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (!updated) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (currentProject.status !== status) {
    await createMyProjectStatusNotification({
      userId: ownerId,
      projectId: id,
      projectTitle: nextFormData.title.trim() || (currentProject.title as string),
      status: mapCreatorProjectStatus(status),
    });
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
