import { z } from "zod";

import { createMyProjectStatusNotification } from "@/features/notifications/services/notification.service";
import { toSimpleProjects } from "@/features/projects/mappers/project-api.mapper";
import {
  createProjectWithRelations,
  fetchProjectsForFeed,
} from "@/features/projects/repositories/projects.repository";
import {
  createProjectBodySchema,
  projectsQuerySchema,
} from "@/features/projects/schemas/projects-api.schema";
import { syncProjectCategoriesForProject } from "@/features/projects/services/project-tags.service";
import { SimpleProject } from "@/features/projects/services/simple-project-mock-data";
import type { ProjectFormData } from "@/features/projects/types/project.type";
import { unstable_noStore as noStore } from "next/cache";

function normalizeProjectFormDataForStorage(
  formData: ProjectFormData,
): ProjectFormData {
  return {
    ...formData,
    positions: formData.positions.map((position) => ({
      ...position,
      requiredSkills: position.skills,
    })),
  };
}

export async function getProjectsFeedService(_query: unknown) {
  noStore();
  projectsQuerySchema.parse(_query);

  const [
    { data: projects, error: projectsError },
    { data: profiles, error: profilesError },
    positionsRes,
    categoriesRes,
  ] = await fetchProjectsForFeed();

  if (
    projectsError ||
    profilesError ||
    positionsRes.error ||
    categoriesRes.error
  ) {
    return {
      status: 500,
      body: {
        error:
          projectsError?.message ||
          profilesError?.message ||
          positionsRes.error?.message ||
          categoriesRes.error?.message ||
          "Failed to fetch projects",
      },
    };
  }

  const profileRows = (profiles ?? []) as Array<{
    id: string;
    name: string | null;
  }>;
  const projectRows = (projects ?? []) as Array<{
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    owner_id: string;
    approval_status: string | null;
  }>;
  const positionRows = (positionsRes.data ?? []) as Array<{
    id: string;
    project_id: string;
    title: string;
    needed_count: number;
    required_skills: string[] | null;
  }>;
  const categoryRows = (categoriesRes.data ?? []) as Array<{
    project_id: string;
    category_name: string;
  }>;

  const ownerNameById = new Map(
    profileRows.map((profile) => [profile.id, profile.name || "Unknown Team"]),
  );

  const positionsByProjectId = new Map<
    string,
    { role: string; needed: number; skills: string[] }[]
  >();
  for (const row of positionRows) {
    const current = positionsByProjectId.get(row.project_id) ?? [];
    current.push({
      role: row.title,
      needed: row.needed_count,
      skills: row.required_skills ?? [],
    });
    positionsByProjectId.set(row.project_id, current);
  }

  const categoriesByProjectId = new Map<string, string[]>();
  for (const row of categoryRows) {
    const current = categoriesByProjectId.get(row.project_id) ?? [];
    current.push(row.category_name);
    categoriesByProjectId.set(row.project_id, current);
  }

  const data = toSimpleProjects({
    projectRows,
    ownerNameById,
    positionsByProjectId,
    categoriesByProjectId,
  }) as SimpleProject[];

  return { status: 200, body: { data } };
}

export async function createProjectService(input: unknown) {
  const payload = createProjectBodySchema.parse(input);
  const status = payload.status ?? "draft";
  const title = payload.formData.title.trim();

  if (!title) {
    return { status: 400, body: { error: "title is required" } };
  }

  const approvalStatus = status === "pending_approval" ? "pending" : "approved";
  const storageFormData = normalizeProjectFormDataForStorage(payload.formData);

  const { data: projectId, error } = await createProjectWithRelations({
    ownerId: payload.ownerId,
    status,
    approvalStatus,
    formData: storageFormData,
  });

  if (error) {
    return { status: 500, body: { error: error.message } };
  }

  try {
    await syncProjectCategoriesForProject({
      projectId: String(projectId),
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

  if (status === "approved" || status === "rejected_by_admin") {
    await createMyProjectStatusNotification({
      userId: payload.ownerId,
      projectId: String(projectId),
      projectTitle: title,
      status,
    });
  }

  return {
    status: 201,
    body: {
      data: { id: String(projectId), title, status, ownerId: payload.ownerId },
    },
  };
}

export function mapZodError(error: unknown) {
  if (error instanceof z.ZodError) {
    return {
      status: 400,
      body: { error: "Invalid request payload", issues: error.issues },
    };
  }
  return null;
}
