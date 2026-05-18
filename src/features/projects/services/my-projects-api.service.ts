import { z } from "zod";

import { formatThaiDate, mapMyProjectStatus } from "@/features/projects/mappers/project-api.mapper";
import { myProjectsQuerySchema } from "@/features/projects/schemas/projects-api.schema";
import {
  fetchMyProjects,
  fetchMyProjectsMetadata,
} from "@/features/projects/repositories/projects.repository";
import { MyProject } from "@/features/projects/services/my-project-mock-data";

export async function getMyProjectsService(query: unknown) {
  const parsed = myProjectsQuerySchema.parse(query);
  const { data: projects, error: projectsError } = await fetchMyProjects(parsed.ownerId);

  if (projectsError) {
    return { status: 500, body: { error: projectsError.message } };
  }

  const projectRows = (projects ?? []) as Array<{
    id: string;
    title: string;
    summary: string | null;
    status: string | null;
    created_at: string | null;
    application_end_date: string | null;
  }>;
  const projectIds = projectRows.map((project) => project.id);

  if (projectIds.length === 0) {
    return { status: 200, body: { data: [] as MyProject[] } };
  }

  const [categoriesRes, positionsRes, applicationsRes] =
    await fetchMyProjectsMetadata(projectIds);

  if (categoriesRes.error || positionsRes.error) {
    return {
      status: 500,
      body: {
        error:
          categoriesRes.error?.message ||
          positionsRes.error?.message ||
          "Failed to fetch my project metadata",
      },
    };
  }

  const categoryRows = (categoriesRes.data ?? []) as Array<{
    project_id: string;
    category_name: string;
  }>;
  const positionRows = (positionsRes.data ?? []) as Array<{
    project_id: string;
    title: string;
  }>;

  const categoriesByProjectId = new Map<string, string[]>();
  for (const row of categoryRows) {
    const current = categoriesByProjectId.get(row.project_id) ?? [];
    current.push(row.category_name);
    categoriesByProjectId.set(row.project_id, current);
  }

  const positionsByProjectId = new Map<string, string[]>();
  for (const row of positionRows) {
    const current = positionsByProjectId.get(row.project_id) ?? [];
    current.push(row.title);
    positionsByProjectId.set(row.project_id, current);
  }

  const applicantCountByProjectId = new Map<string, number>();
  if (!applicationsRes.error) {
    const applicationRows = (applicationsRes.data ?? []) as Array<{ project_id: string }>;
    for (const row of applicationRows) {
      applicantCountByProjectId.set(
        row.project_id,
        (applicantCountByProjectId.get(row.project_id) ?? 0) + 1,
      );
    }
  }

  const data: MyProject[] = projectRows.map((project) => ({
    id: project.id,
    detailId: project.id,
    title: project.title,
    status: mapMyProjectStatus(project.status),
    createdAt: formatThaiDate(project.created_at),
    summary: project.summary ?? "",
    tags: Array.from(
      new Set([
        ...(categoriesByProjectId.get(project.id) ?? []),
        ...(positionsByProjectId.get(project.id) ?? []),
      ]),
    ),
    applicants: applicantCountByProjectId.get(project.id) ?? 0,
    deadline: formatThaiDate(project.application_end_date),
  }));

  return { status: 200, body: { data } };
}

export function mapMyProjectsZodError(error: unknown) {
  if (error instanceof z.ZodError) {
    return { status: 400, body: { error: "Invalid query", issues: error.issues } };
  }
  return null;
}
