import type { ActionResult } from "@/features/applications/dto/application.dto";
import type {
  AdminProject,
  AdminProjectPosition,
} from "@/features/applications/dto/recruitment.dto";
import { buildAdminProject } from "@/features/applications/mappers/recruitment.mapper";
import {
  fetchAdminProjectApplications,
  fetchAdminProjectOwners,
  fetchAdminProjectPositions,
  fetchAdminProjects,
} from "@/features/applications/repositories/applications.repository";
import { insertNotification } from "@/features/applications/repositories/notifications.repository";
import { supabaseAdminClient } from "@/lib/supabase/admin-client";

export async function getAdminProjects(): Promise<
  ActionResult<AdminProject[]>
> {
  const { data: projects, error } = await fetchAdminProjects();
  if (error) {
    return { ok: false, error: error.message };
  }

  if (process.env.NODE_ENV !== "production") {
    const firstProject = (projects ?? [])[0] as
      | { id: string; project_categories?: unknown }
      | undefined;
    console.log("[adminProjects/raw]", {
      projectId: firstProject?.id ?? null,
      projectCategories: firstProject?.project_categories ?? null,
    });
  }

  const projectRows = (projects ?? []) as Array<{
    id: string;
    title: string;
    description: string | null;
    owner_id: string;
    approval_status: string | null;
    status: string | null;
    created_at: string | null;
    application_end_date: string | null;
    project_categories?: Array<{
      id: string;
      category_name: string;
    }> | null;
  }>;

  if (projectRows.length === 0) {
    return { ok: true, data: [] };
  }

  const ownerIds = Array.from(
    new Set(projectRows.map((project) => project.owner_id)),
  );
  const projectIds = projectRows.map((project) => project.id);
  const [ownersRes, positionsRes, applicationsRes] = await Promise.all([
    fetchAdminProjectOwners(ownerIds),
    fetchAdminProjectPositions(projectIds),
    fetchAdminProjectApplications(projectIds),
  ]);

  if (ownersRes.error) return { ok: false, error: ownersRes.error.message };
  if (positionsRes.error)
    return { ok: false, error: positionsRes.error.message };
  if (applicationsRes.error)
    return { ok: false, error: applicationsRes.error.message };

  const ownerById = new Map(
    (
      (ownersRes.data ?? []) as Array<{
        id: string;
        displayname: string | null;
        name: string | null;
        email: string | null;
      }>
    ).map((owner) => [owner.id, owner]),
  );

  const applicantCountByProjectId = new Map<string, number>();
  const applicantCountByPositionId = new Map<string, number>();
  for (const row of (applicationsRes.data ?? []) as Array<{
    project_id: string;
    position_id: string | null;
  }>) {
    applicantCountByProjectId.set(
      row.project_id,
      (applicantCountByProjectId.get(row.project_id) ?? 0) + 1,
    );
    if (row.position_id) {
      applicantCountByPositionId.set(
        row.position_id,
        (applicantCountByPositionId.get(row.position_id) ?? 0) + 1,
      );
    }
  }

  const positionsByProjectId = new Map<string, AdminProjectPosition[]>();
  for (const position of (positionsRes.data ?? []) as Array<{
    id: string;
    project_id: string;
    title: string;
    needed_count: number | null;
    accepted_count: number | null;
    required_skills: string[] | null;
  }>) {
    const neededCount = position.needed_count ?? 0;
    const acceptedCount = position.accepted_count ?? 0;
    const current = positionsByProjectId.get(position.project_id) ?? [];
    current.push({
      id: position.id,
      title: position.title,
      neededCount,
      acceptedCount,
      requiredSkills: position.required_skills ?? [],
      applicantCount: applicantCountByPositionId.get(position.id) ?? 0,
      isFull: neededCount > 0 && acceptedCount >= neededCount,
    });
    positionsByProjectId.set(position.project_id, current);
  }

  return {
    ok: true,
    data: projectRows.map((project) => {
      const owner = ownerById.get(project.owner_id);
      const positions = positionsByProjectId.get(project.id) ?? [];
      return buildAdminProject({
        id: project.id,
        title: project.title,
        description: project.description,
        ownerName:
          owner?.displayname?.trim() || owner?.name?.trim() || "Unknown",
        ownerEmail: owner?.email ?? "",
        approvalStatus: project.approval_status,
        projectStatus: project.status,
        createdAt: project.created_at,
        applicationEndDate: project.application_end_date,
        applicantCount: applicantCountByProjectId.get(project.id) ?? 0,
        positions,
        tags:
          project.project_categories?.map((category) => ({
            id: category.id,
            name: category.category_name,
          })) ?? [],
      });
    }),
  };
}

export async function approveProject(projectId: string): Promise<ActionResult> {
  const { error } = await supabaseAdminClient
    .from("projects")
    .update({
      approval_status: "approved",
      status: "open",
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) return { ok: false, error: error.message };

  const { data: project } = await supabaseAdminClient
    .from("projects")
    .select("id,title,owner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (project) {
    await insertNotification({
      userId: project.owner_id,
      projectId,
      category: "my-project",
      type: "project_approved",
      title: "โปรเจกต์ได้รับการอนุมัติ",
      message:
        "Your project has been approved and is now open for applications",
      status: "approved",
      link: `/project/${projectId}`,
    });
  }

  return { ok: true, data: undefined };
}

export async function rejectProject(
  projectId: string,
  feedback: string,
): Promise<ActionResult> {
  const { error } = await supabaseAdminClient
    .from("projects")
    .update({
      approval_status: "rejected",
      status: "closed",
      admin_feedback: feedback.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) return { ok: false, error: error.message };

  const { data: project } = await supabaseAdminClient
    .from("projects")
    .select("id,title,owner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (project) {
    await insertNotification({
      userId: project.owner_id,
      projectId,
      category: "my-project",
      type: "project_rejected",
      title: "โปรเจกต์ถูกปฏิเสธ",
      message: `Your project was rejected. Feedback: ${feedback}`,
      status: "rejected",
      link: `/project/${projectId}`,
    });
  }

  return { ok: true, data: undefined };
}
