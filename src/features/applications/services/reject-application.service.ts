import type { ActionResult } from "@/features/applications/dto/application.dto";
import {
  fetchProjectApplicationForOwner,
  updateProjectApplication,
} from "@/features/applications/repositories/applications.repository";
import { insertNotification } from "@/features/applications/repositories/notifications.repository";

async function loadApplicationForOwner(applicationId: string, ownerId: string) {
  const { data, error } = await fetchProjectApplicationForOwner(applicationId);
  if (error) return { ok: false as const, error: error.message };
  if (!data) return { ok: false as const, error: "Application not found" };

  const row = data as {
    id: string;
    project_id: string;
    applicant_id: string;
    position_id: string | null;
    projects: { owner_id: string } | { owner_id: string }[];
  };
  const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;
  if (project.owner_id !== ownerId) {
    return {
      ok: false as const,
      error: "You are not authorized to manage this application",
    };
  }

  return {
    ok: true as const,
    data: {
      application: {
        id: row.id,
        project_id: row.project_id,
        applicant_id: row.applicant_id,
        position_id: row.position_id,
      },
    },
  };
}

export async function rejectApplication(input: {
  applicationId: string;
  ownerId: string;
  rejectionReason: string;
}): Promise<ActionResult> {
  const loaded = await loadApplicationForOwner(
    input.applicationId,
    input.ownerId,
  );
  if (!loaded.ok) return loaded;

  const { application } = loaded.data;
  const { error } = await updateProjectApplication(input.applicationId, {
    status: "rejected",
    rejection_reason: input.rejectionReason.trim(),
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };

  await insertNotification({
    userId: application.applicant_id,
    projectId: application.project_id,
    category: "applied",
    type: "application_rejected",
    title: "Your application was rejected",
    message: "Your application was rejected",
    status: "rejected",
    link: `/project/${application.project_id}`,
  });

  return { ok: true, data: undefined };
}
