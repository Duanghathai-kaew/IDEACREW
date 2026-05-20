import { z } from "zod";

import { normalizeProjectFormData } from "@/features/projects/schemas/projects-api.schema";
import { MyProjectStatus } from "@/features/projects/services/my-project-mock-data";
import { syncProjectCategoriesForProject } from "@/features/projects/services/project-tags.service";
import {
  Benefit,
  ProjectFormData,
} from "@/features/projects/types/project.type";
import { createMyProjectStatusNotification } from "@/lib/server/notifications";
import { supabaseAdminClient } from "@/lib/supabase/admin-client";
import { CreatorProjectStatus } from "@/types/status";
import { unstable_noStore as noStore } from "next/cache";

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

type DbCategory = { category_name: string };
type DbPosition = {
  id: string;
  title: string;
  needed_count: number;
  preferred_qualifications: string | null;
  required_skills?: string[] | null;
};
type DbPositionSkill = { position_id: string; skill_name: string };
type DbBasicQualification = { position_id: string; qualification_text: string };

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
  return Boolean(message?.includes("Could not find the table"));
}

function mapStatus(status: string | null): MyProjectStatus {
  return status && allowedStatus.includes(status as MyProjectStatus)
    ? (status as MyProjectStatus)
    : "draft";
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

function normalizeProjectFormDataForStorage(
  formData: ProjectFormData,
): ProjectFormData {
  const normalized = normalizeProjectFormData(formData);

  return {
    ...normalized,
    positions: normalized.positions.map(
      (position: ProjectFormData["positions"][number]) => ({
        ...position,
        requiredSkills: position.skills,
      }),
    ),
  };
}

type UpdateBody = {
  title?: string;
  summary?: string;
  status?: string;
  applicationEndDate?: string;
  formData?: ProjectFormData;
};

export async function getMyProjectByIdService(input: {
  id: string;
  ownerId: string;
}) {
  noStore();

  const { data, error } = await supabaseAdminClient
    .from("projects")
    .select(
      "id,owner_id,title,summary,description,work_mode,working_hours,application_start_date,application_end_date,status,benefits,compensation_detail",
    )
    .eq("id", input.id)
    .eq("owner_id", input.ownerId)
    .maybeSingle();

  if (error) return { status: 500, body: { error: error.message } };
  if (!data) return { status: 404, body: { error: "Project not found" } };

  const project = data as DbProject;
  const [{ data: categories }, { data: positions }] = await Promise.all([
    supabaseAdminClient
      .from("project_categories")
      .select("category_name")
      .eq("project_id", input.id)
      .eq("type", "category"),
    supabaseAdminClient
      .from("project_positions")
      .select("id,title,needed_count,preferred_qualifications")
      .eq("project_id", input.id),
  ]);

  const { data: skillTags } = await supabaseAdminClient
    .from("project_categories")
    .select("category_name")
    .eq("project_id", input.id)
    .eq("type", "skill");

  const positionRows = (positions as DbPosition[] | null) ?? [];
  const positionIds = positionRows.map((position) => position.id);

  const [skillsResult, qualificationsResult] =
    positionIds.length === 0
      ? [{ data: [] }, { data: [] }]
      : await Promise.all([
          supabaseAdminClient
            .from("project_position_skills")
            .select("position_id,skill_name")
            .in("position_id", positionIds),
          supabaseAdminClient
            .from("project_position_basic_qualifications")
            .select("position_id,qualification_text")
            .in("position_id", positionIds),
        ]);

  const skillsByPositionId = new Map<string, string[]>();
  const projectSkillTags = (
    (skillTags as Array<{ category_name: string }> | null) ?? []
  ).map((row) => row.category_name);
  for (const row of (skillsResult.data ?? []) as DbPositionSkill[]) {
    const current = skillsByPositionId.get(row.position_id) ?? [];
    current.push(row.skill_name);
    skillsByPositionId.set(row.position_id, current);
  }

  const qualificationsByPositionId = new Map<string, string[]>();
  for (const row of (qualificationsResult.data ??
    []) as DbBasicQualification[]) {
    const current = qualificationsByPositionId.get(row.position_id) ?? [];
    current.push(row.qualification_text);
    qualificationsByPositionId.set(row.position_id, current);
  }

  const formData: ProjectFormData = {
    title: project.title,
    categories: ((categories as DbCategory[] | null) ?? []).map(
      (c) => c.category_name,
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
            skills: Array.from(
              new Set([
                ...projectSkillTags,
                ...(position.required_skills ?? []),
                ...(skillsByPositionId.get(position.id) ?? []),
              ]),
            ),
            basicQualifications:
              qualificationsByPositionId.get(position.id) ?? [],
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

  return {
    status: 200,
    body: {
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
    },
  };
}

export async function patchMyProjectByIdService(input: {
  id: string;
  ownerId: string;
  body: UpdateBody;
}) {
  const { data: currentProject, error: currentProjectError } =
    await supabaseAdminClient
      .from("projects")
      .select("id,title,status")
      .eq("id", input.id)
      .eq("owner_id", input.ownerId)
      .maybeSingle();

  if (currentProjectError) {
    return { status: 500, body: { error: currentProjectError.message } };
  }
  if (!currentProject)
    return { status: 404, body: { error: "Project not found" } };

  const nextFormData = input.body.formData;
  const status = (input.body.status ?? "").trim();
  if (!allowedStatus.includes(status as MyProjectStatus)) {
    return { status: 400, body: { error: "invalid status" } };
  }

  if (!nextFormData) {
    const title = (input.body.title ?? "").trim();
    const summary = (input.body.summary ?? "").trim();
    const applicationEndDate = (input.body.applicationEndDate ?? "").trim();
    if (!title) return { status: 400, body: { error: "title is required" } };

    const { data, error } = await supabaseAdminClient
      .from("projects")
      .update({
        title,
        summary,
        status,
        application_end_date: applicationEndDate || null,
      })
      .eq("id", input.id)
      .eq("owner_id", input.ownerId)
      .select("id")
      .maybeSingle();

    if (error) return { status: 500, body: { error: error.message } };
    if (!data) return { status: 404, body: { error: "Project not found" } };

    if (currentProject.status !== status) {
      await createMyProjectStatusNotification({
        userId: input.ownerId,
        projectId: input.id,
        projectTitle: title,
        status: mapCreatorProjectStatus(status),
      });
    }
    return { status: 200, body: { ok: true } };
  }

  const title = nextFormData.title.trim();
  if (!title) return { status: 400, body: { error: "title is required" } };

  const filteredFormData: ProjectFormData = {
    ...nextFormData,
    benefits: nextFormData.benefits.filter((benefit): benefit is Benefit =>
      allowedBenefits.includes(benefit),
    ),
    workMode: mapWorkMode(nextFormData.workMode),
  };
  const storageFormData = normalizeProjectFormDataForStorage(filteredFormData);

  const { data: updated, error: updateError } = await supabaseAdminClient.rpc(
    "update_my_project_with_relations",
    {
      p_project_id: input.id,
      p_owner_id: input.ownerId,
      p_status: status,
      p_form_data: storageFormData,
    },
  );

  if (updateError) return { status: 500, body: { error: updateError.message } };
  if (!updated) return { status: 404, body: { error: "Project not found" } };

  try {
    await syncProjectCategoriesForProject({
      projectId: input.id,
      formData: storageFormData,
    });
  } catch (syncError) {
    return {
      status: 500,
      body: {
        error:
          syncError instanceof Error
            ? syncError.message
            : "Failed to sync project tags",
      },
    };
  }

  if (currentProject.status !== status) {
    await createMyProjectStatusNotification({
      userId: input.ownerId,
      projectId: input.id,
      projectTitle: title || (currentProject.title as string),
      status: mapCreatorProjectStatus(status),
    });
  }

  return { status: 200, body: { ok: true } };
}

export async function deleteMyProjectByIdService(input: {
  id: string;
  ownerId: string;
}) {
  const { data: project, error: projectError } = await supabaseAdminClient
    .from("projects")
    .select("id")
    .eq("id", input.id)
    .eq("owner_id", input.ownerId)
    .maybeSingle();

  if (projectError)
    return { status: 500, body: { error: projectError.message } };
  if (!project) return { status: 404, body: { error: "Project not found" } };

  const { data: positions, error: positionsError } = await supabaseAdminClient
    .from("project_positions")
    .select("id")
    .eq("project_id", input.id);
  if (positionsError)
    return { status: 500, body: { error: positionsError.message } };

  const positionIds = (positions ?? []).map(
    (position) => position.id as string,
  );
  if (positionIds.length > 0) {
    const [skillsDeleteRes, qualsDeleteRes] = await Promise.all([
      supabaseAdminClient
        .from("project_position_skills")
        .delete()
        .in("position_id", positionIds),
      supabaseAdminClient
        .from("project_position_basic_qualifications")
        .delete()
        .in("position_id", positionIds),
    ]);
    if (skillsDeleteRes.error || qualsDeleteRes.error) {
      return {
        status: 500,
        body: {
          error:
            skillsDeleteRes.error?.message ||
            qualsDeleteRes.error?.message ||
            "Failed to delete position metadata",
        },
      };
    }
  }

  const [positionsDeleteRes, categoriesDeleteRes, applicationsDeleteRes] =
    await Promise.all([
      supabaseAdminClient
        .from("project_positions")
        .delete()
        .eq("project_id", input.id),
      supabaseAdminClient
        .from("project_categories")
        .delete()
        .eq("project_id", input.id),
      supabaseAdminClient
        .from("project_applications")
        .delete()
        .eq("project_id", input.id),
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
    return {
      status: 500,
      body: {
        error:
          positionsDeleteRes.error?.message ||
          categoriesDeleteRes.error?.message ||
          applicationsDeleteError?.message ||
          "Failed to delete project relations",
      },
    };
  }

  const { error: projectDeleteError } = await supabaseAdminClient
    .from("projects")
    .delete()
    .eq("id", input.id)
    .eq("owner_id", input.ownerId);
  if (projectDeleteError) {
    return { status: 500, body: { error: projectDeleteError.message } };
  }

  return { status: 200, body: { ok: true } };
}

export function mapMyProjectDetailZodError(error: unknown) {
  if (error instanceof z.ZodError) {
    return {
      status: 400,
      body: { error: "Invalid request", issues: error.issues },
    };
  }
  return null;
}
