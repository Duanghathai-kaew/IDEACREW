import { z } from "zod";

import { createMyProjectStatusNotification } from "@/features/notifications/services/notification.service";
import { toSimpleProjects } from "@/features/projects/mappers/project-api.mapper";
import {
  createProjectBodySchema,
  projectsQuerySchema,
} from "@/features/projects/schemas/projects-api.schema";
import {
  createProjectWithRelations,
  fetchProjectsForFeed,
} from "@/features/projects/repositories/projects.repository";
import { SimpleProject } from "@/features/projects/services/simple-project-mock-data";

export async function getProjectsFeedService(_query: unknown) {
  projectsQuerySchema.parse(_query);

  const [
    { data: projects, error: projectsError },
    { data: profiles, error: profilesError },
    positionsRes,
    positionSkillsRes,
    categoriesRes,
  ] = await fetchProjectsForFeed();

  if (projectsError || profilesError || positionsRes.error || positionSkillsRes.error || categoriesRes.error) {
    return {
      status: 500,
      body: {
        error:
          projectsError?.message ||
          profilesError?.message ||
          positionsRes.error?.message ||
          positionSkillsRes.error?.message ||
          categoriesRes.error?.message ||
          "Failed to fetch projects",
      },
    };
  }

  const profileRows = (profiles ?? []) as Array<{ id: string; name: string | null }>;
  const positionRows = (positionsRes.data ?? []) as Array<{
    id: string;
    project_id: string;
    title: string;
    needed_count: number;
  }>;
  const positionSkillRows = (positionSkillsRes.data ?? []) as Array<{
    position_id: string;
    skill_name: string;
  }>;
  const categoryRows = (categoriesRes.data ?? []) as Array<{
    project_id: string;
    category_name: string;
  }>;

  const ownerNameById = new Map(
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

  const data = toSimpleProjects({
    projectRows: (projects ?? []) as Array<{
      id: string;
      title: string;
      description: string | null;
      status: string | null;
      owner_id: string;
    }>,
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
  const { data: projectId, error } = await createProjectWithRelations({
    ownerId: payload.ownerId,
    status,
    approvalStatus,
    formData: payload.formData,
  });

  if (error) {
    return { status: 500, body: { error: error.message } };
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
    return { status: 400, body: { error: "Invalid request payload", issues: error.issues } };
  }
  return null;
}
