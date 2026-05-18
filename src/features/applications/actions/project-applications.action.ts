"use server";

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

export const getApplyProfilePrefill = getApplyProfilePrefillService;
export const getProjectPositions = getProjectPositionsService;
export const getProjectApplicationsForUser =
  getProjectApplicationsForUserService;
export const getProjectRecruitmentProgress =
  getProjectRecruitmentProgressService;
export const getProjectTeamMembers = getProjectTeamMembersService;
export const getProjectApplicants = getProjectApplicantsService;
export const getAdminProjects = getAdminProjectsService;

export async function submitProjectApplication(
  input: Parameters<typeof submitProjectApplicationService>[0],
) {
  const result = await submitProjectApplicationService(input);
  if (result.ok) {
    revalidatePath(`/project/${input.projectId}`);
    revalidatePath("/my-project");
  }
  return result;
}

export async function acceptApplication(
  input: Parameters<typeof acceptApplicationService>[0],
) {
  const result = await acceptApplicationService(input);
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
  const result = await rejectApplicationService(input);
  if (result.ok) {
    const projectId = await fetchProjectIdForApplication(input.applicationId);
    if (projectId) {
      revalidatePath(`/project/${projectId}`);
      revalidatePath("/my-project");
    }
  }
  return result;
}

export async function approveProject(projectId: string) {
  const result = await approveProjectService(projectId);
  if (result.ok) {
    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/project/${projectId}`);
  }
  return result;
}

export async function rejectProject(projectId: string, feedback: string) {
  const result = await rejectProjectService(projectId, feedback);
  if (result.ok) {
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
