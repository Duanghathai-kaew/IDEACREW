import type {
  ActionResult,
  ApplicantCard,
} from "@/features/applications/dto/application.dto";
import { buildApplicantCards } from "@/features/applications/mappers/application.mapper";
import {
  countAcceptedApplicationsForPosition,
  fetchProjectApplicants,
  fetchProjectApplicantsFallback,
  fetchProjectApplicationForOwner,
  fetchProjectByOwner,
  fetchProjectPositionForApplication,
  updatePendingProjectApplication,
  updateProjectApplication,
} from "@/features/applications/repositories/applications.repository";
import { insertNotification } from "@/features/applications/repositories/notifications.repository";
import {
  deleteProjectMember,
  fetchProfilesByIds,
  fetchProjectMember,
  insertProjectMember,
} from "@/features/applications/repositories/project-members.repository";
import { updateProjectPositionAcceptedCount } from "@/features/applications/repositories/project-positions.repository";

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

export async function getProjectApplicants(input: {
  projectId: string;
  ownerId: string;
}): Promise<ActionResult<ApplicantCard[]>> {
  const { data: ownerProject, error: ownerProjectError } =
    await fetchProjectByOwner(input.projectId, input.ownerId);
  if (ownerProjectError) return { ok: false, error: ownerProjectError.message };
  if (!ownerProject) {
    return {
      ok: false,
      error: "You are not authorized to manage this project",
    };
  }

  const primaryResult = await fetchProjectApplicants(input.projectId);
  let data = primaryResult.data;
  let error = primaryResult.error;

  if (error) {
    const fallbackResult = await fetchProjectApplicantsFallback(
      input.projectId,
    );
    data = fallbackResult.data;
    error = fallbackResult.error;

    if (error) {
      return {
        ok: false,
        error: `Failed to fetch applicants: ${error.message}`,
      };
    }
  }

  const appRows = (data ?? []) as Array<{
    id: string;
    applicant_id: string;
    position_id: string | null;
    status: string | null;
    motivation_message: string | null;
    skills: string[] | null;
    portfolio_urls: string[] | null;
    additional_note: string | null;
    created_at: string | null;
    project_positions:
      | {
          title: string;
          needed_count: number | null;
          accepted_count: number | null;
          required_skills: string[] | null;
        }
      | {
          title: string;
          needed_count: number | null;
          accepted_count: number | null;
          required_skills: string[] | null;
        }[]
      | null;
  }>;

  if (appRows.length === 0) return { ok: true, data: [] };

  const applicantIds = Array.from(
    new Set(appRows.map((item) => item.applicant_id)),
  );
  const { data: profiles, error: profileError } =
    await fetchProfilesByIds(applicantIds);
  if (profileError) return { ok: false, error: profileError.message };

  const profileById = new Map(
    (
      (profiles ?? []) as Array<{
        id: string;
        displayname: string | null;
        name: string | null;
        username: string | null;
        avatar_url?: string | null;
        skills?: string[] | null;
      }>
    ).map((profile) => [profile.id, profile]),
  );

  return {
    ok: true,
    data: buildApplicantCards({ applications: appRows, profileById }),
  };
}

export async function acceptApplication(input: {
  applicationId: string;
  ownerId: string;
}): Promise<ActionResult> {
  const loaded = await loadApplicationForOwner(
    input.applicationId,
    input.ownerId,
  );
  if (!loaded.ok) return loaded;

  const { application } = loaded.data;

  if (!application.position_id) {
    return { ok: false, error: "Application is missing position_id" };
  }

  const { data: position, error: positionError } =
    await fetchProjectPositionForApplication(
      application.project_id,
      application.position_id,
    );
  if (positionError || !position) {
    return { ok: false, error: positionError?.message || "Position not found" };
  }

  const neededCount = Math.max(1, position.needed_count ?? 1);
  const { count: acceptedCount, error: acceptedCountError } =
    await countAcceptedApplicationsForPosition(
      application.project_id,
      application.position_id,
    );
  if (acceptedCountError)
    return { ok: false, error: acceptedCountError.message };
  if (!position.is_active || (acceptedCount ?? 0) >= neededCount) {
    return { ok: false, error: "This position is already filled" };
  }

  const { data: memberExists, error: memberExistsError } =
    await fetchProjectMember(application.project_id, application.applicant_id);
  if (memberExistsError) return { ok: false, error: memberExistsError.message };
  if (memberExists) {
    return { ok: false, error: "Applicant is already a project member" };
  }

  const { data: updatedApp, error: updateError } =
    await updatePendingProjectApplication(input.applicationId, {
      status: "accepted",
      updated_at: new Date().toISOString(),
    });

  if (updateError) return { ok: false, error: updateError.message };
  if (!updatedApp) {
    return { ok: false, error: "Application was already processed" };
  }

  const { error: memberError } = await insertProjectMember({
    project_id: application.project_id,
    user_id: application.applicant_id,
    position_id: application.position_id,
    role: "member",
  });
  if (memberError) {
    await updateProjectApplication(input.applicationId, {
      status: "pending",
      updated_at: new Date().toISOString(),
    });
    return { ok: false, error: memberError.message };
  }

  const currentAcceptedCount = position.accepted_count ?? 0;
  const nextAcceptedCount = Math.max(
    currentAcceptedCount + 1,
    (acceptedCount ?? 0) + 1,
  );
  const { data: updatedPosition, error: updatePositionError } =
    await updateProjectPositionAcceptedCount(
      application.position_id,
      currentAcceptedCount,
      nextAcceptedCount,
    );

  if (updatePositionError || !updatedPosition) {
    await deleteProjectMember(application.project_id, application.applicant_id);
    await updateProjectApplication(input.applicationId, {
      status: "pending",
      updated_at: new Date().toISOString(),
    });
    return {
      ok: false,
      error:
        updatePositionError?.message ??
        "Position acceptance count changed. Please try again.",
    };
  }

  await insertNotification({
    userId: application.applicant_id,
    projectId: application.project_id,
    category: "applied",
    type: "application_accepted",
    title: "Your application has been accepted",
    message: "Your application has been accepted",
    status: "accepted",
    link: `/project/${application.project_id}`,
  });

  return { ok: true, data: undefined };
}
