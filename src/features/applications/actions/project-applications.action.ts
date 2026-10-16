"use server";

import { requireCurrentSession } from "@/lib/auth/current-session";
import { requireAdmin } from "@/lib/auth/admin-session";

import { revalidatePath } from "next/cache";

import {
  acceptApplication as acceptApplicationService,
  getProjectApplicants as getProjectApplicantsService,
} from "@/features/applications/services/accept-application.service";
import {
  approveProject as approveProjectService,
  getAdminProjects as getAdminProjectsService,
  rejectProject as rejectProjectService,
} from "@/features/applications/services/admin-projects.service";
import {
  getApplyProfilePrefill as getApplyProfilePrefillService,
  getProjectApplicationsForUser as getProjectApplicationsForUserService,
  getProjectPositions as getProjectPositionsService,
  submitProjectApplication as submitProjectApplicationService,
} from "@/features/applications/services/apply-to-project.service";
import { autoCloseProjectIfRecruitmentComplete } from "@/features/applications/services/auto-close-project.service";
import { getProjectTeamMembers as getProjectTeamMembersService } from "@/features/applications/services/get-project-team.service";
import { getProjectRecruitmentProgress as getProjectRecruitmentProgressService } from "@/features/applications/services/get-recruitment-progress.service";
import { rejectApplication as rejectApplicationService } from "@/features/applications/services/reject-application.service";

export type {
  ActionResult,
  ApplicantCard,
  ApplicationStatus,
  AppliedProjectCard,
  ApplyProfilePrefill,
  ProjectPositionOption,
} from "@/features/applications/dto/application.dto";
export type {
  AdminProject,
  AdminProjectPosition,
  AdminRecruitmentProgress,
  RecruitmentPosition,
  TeamMember,
} from "@/features/applications/dto/recruitment.dto";

export async function getApplyProfilePrefill(userId: string) {
  const session = await requireCurrentSession();
  if (userId !== session.userId) throw new Error("Unauthorized user");
  return getApplyProfilePrefillService(session.userId);
}
export const getProjectPositions = getProjectPositionsService;
export async function getProjectApplicationsForUser(userId: string) {
  const session = await requireCurrentSession();
  if (userId !== session.userId) throw new Error("Unauthorized user");
  return getProjectApplicationsForUserService(session.userId);
}
export const getProjectRecruitmentProgress =
  getProjectRecruitmentProgressService;
export const getProjectTeamMembers = getProjectTeamMembersService;
export async function getProjectApplicants(
  input: Parameters<typeof getProjectApplicantsService>[0],
) {
  const session = await requireCurrentSession();
  return getProjectApplicantsService({ ...input, ownerId: session.userId });
}
export async function getAdminProjects() {
  await requireAdmin();
  return getAdminProjectsService();
}

export async function submitProjectApplication(
  input: Parameters<typeof submitProjectApplicationService>[0],
) {
  const session = await requireCurrentSession();
  const result = await submitProjectApplicationService({ ...input, userId: session.userId });
  if (result.ok) {
    revalidatePath(`/project/${input.projectId}`);
    revalidatePath("/my-project");
  }
  return result;
}

export async function acceptApplication(
  input: Parameters<typeof acceptApplicationService>[0],
) {
  const session = await requireCurrentSession();
  const result = await acceptApplicationService({ ...input, ownerId: session.userId });
  if (result.ok) {
    const projectId = await fetchProjectIdForApplication(input.applicationId);
    if (projectId) {
      await autoCloseProjectIfRecruitmentComplete(projectId);
      revalidatePath(`/project/${projectId}`);
      revalidatePath("/my-project");
    }
  }
  return result;
}

export async function rejectApplication(
  input: Parameters<typeof rejectApplicationService>[0],
) {
  const session = await requireCurrentSession();
  const result = await rejectApplicationService({ ...input, ownerId: session.userId });
  if (result.ok) {
    const projectId = await fetchProjectIdForApplication(input.applicationId);
    if (projectId) {
      revalidatePath(`/project/${projectId}`);
      revalidatePath("/my-project");
    }
  }
  return result;
}

export async function approveProject(
  projectId: string,
  selectedTagIds: string[],
) {
  await requireAdmin();
  const result = await approveProjectService(projectId, selectedTagIds);
  if (result.ok) {
    revalidatePath("/my-project");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/project/${projectId}`);
  }
  return result;
}

export async function rejectProject(projectId: string, feedback: string) {
  await requireAdmin();
  const result = await rejectProjectService(projectId, feedback);
  if (result.ok) {
    revalidatePath("/my-project");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/project/${projectId}`);
  }
  return result;
}

async function fetchProjectIdForApplication(applicationId: string) {
  const { fetchProjectApplicationForOwner } =
    await import("@/features/applications/repositories/applications.repository");
  const { data } = await fetchProjectApplicationForOwner(applicationId);
  if (!data) return null;
  const row = data as {
    project_id: string;
  };
  return row.project_id;
}
