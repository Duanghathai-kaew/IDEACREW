import type {
  ActionResult,
  AppliedProjectCard,
  ApplyProfilePrefill,
  ProjectPositionOption,
} from "@/features/applications/dto/application.dto";
import {
  buildAppliedProjectCards,
  buildApplyProfilePrefill,
  buildProjectPositionOption,
  uniqTrimmed,
} from "@/features/applications/mappers/application.mapper";
import {
  countAcceptedApplicationsForPosition,
  fetchApplyProfilePrefillData,
  fetchExistingApplicationForApplicant,
  fetchProjectApplicationsByApplicant,
  fetchProjectById,
  fetchProjectPositionForApplication,
  fetchProjectOwnerContacts,
  fetchProjectOwnersByIds,
  fetchProjectsByIds,
  insertProjectApplication,
  updateProjectApplication,
} from "@/features/applications/repositories/applications.repository";
import {
  fetchAcceptedApplicationsForPositions,
  fetchActiveProjectPositions,
} from "@/features/applications/repositories/project-positions.repository";

function isMissingColumnError(message?: string) {
  if (!message) return false;
  return message.includes("Could not find") || message.includes("schema cache");
}

export async function getApplyProfilePrefill(
  userId: string,
): Promise<ActionResult<ApplyProfilePrefill>> {
  const [profileResult, linksResult] = await fetchApplyProfilePrefillData(userId);

  if (profileResult.error || linksResult.error) {
    return {
      ok: false,
      error:
        profileResult.error?.message ||
        linksResult.error?.message ||
        "Failed to load profile",
    };
  }

  const profileRow = (profileResult.data ?? {}) as {
    skills?: string[] | null;
    bio?: string | null;
  };
  const linkRows = (linksResult.data ?? []) as Array<{ url: string | null }>;

  return {
    ok: true,
    data: buildApplyProfilePrefill({
      skills: profileRow.skills,
      bio: profileRow.bio,
      portfolioUrls: linkRows.map((item) => item.url ?? ""),
    }),
  };
}

export async function getProjectPositions(
  projectId: string,
): Promise<ActionResult<ProjectPositionOption[]>> {
  const { data, error } = await fetchActiveProjectPositions(projectId);
  if (error) {
    return { ok: false, error: error.message };
  }

  const positions = (data ?? []) as Array<{
    id: string;
    title: string;
    needed_count: number | null;
    accepted_count: number | null;
    required_skills: string[] | null;
    is_active: boolean | null;
  }>;

  const positionIds = positions.map((position) => position.id);
  const acceptedCountByPositionId = new Map<string, number>();

  if (positionIds.length > 0) {
    const { data: acceptedApps, error: acceptedAppsError } =
      await fetchAcceptedApplicationsForPositions(projectId, positionIds);

    if (acceptedAppsError) {
      return { ok: false, error: acceptedAppsError.message };
    }

    for (const row of (acceptedApps ?? []) as Array<{
      position_id: string | null;
      status: string | null;
    }>) {
      if (!row.position_id) continue;
      acceptedCountByPositionId.set(
        row.position_id,
        (acceptedCountByPositionId.get(row.position_id) ?? 0) + 1,
      );
    }
  }

  return {
    ok: true,
    data: positions
      .map((position) =>
        buildProjectPositionOption({
          id: position.id,
          title: position.title,
          neededCount: Math.max(1, position.needed_count ?? 1),
          acceptedCount: acceptedCountByPositionId.get(position.id) ?? 0,
          requiredSkills: position.required_skills ?? [],
          isActive: position.is_active !== false,
        }),
      )
      .filter((position) => position.isActive && !position.isFull),
  };
}

export async function submitProjectApplication(input: {
  projectId: string;
  userId: string;
  positionId: string;
  motivationMessage: string;
  skills: string[];
  portfolioUrls: string[];
  additionalNote: string;
}): Promise<ActionResult<{ applicationId: string }>> {
  const projectId = input.projectId.trim();
  const userId = input.userId.trim();
  const positionId = input.positionId.trim();

  if (!projectId || !userId || !positionId) {
    return { ok: false, error: "Missing required fields" };
  }

  const { data: project, error: projectError } = await fetchProjectById(projectId);
  if (projectError || !project) {
    return { ok: false, error: projectError?.message || "Project not found" };
  }

  if (project.owner_id === userId) {
    return {
      ok: false,
      error: "Project owners cannot apply to their own project",
    };
  }
  if (project.status !== "open") {
    return { ok: false, error: "This project is not open for applications" };
  }

  const { data: position, error: positionError } = await fetchProjectPositionForApplication(
    projectId,
    positionId,
  );
  if (positionError || !position) {
    return { ok: false, error: "Position not found" };
  }

  const positionRow = position as {
    needed_count: number | null;
    accepted_count: number | null;
    is_active: boolean | null;
  };
  if (!positionRow.is_active) {
    return { ok: false, error: "This position is already filled" };
  }

  const { count: acceptedCount, error: acceptedCountError } =
    await countAcceptedApplicationsForPosition(projectId, positionId);
  if (acceptedCountError) {
    return { ok: false, error: acceptedCountError.message };
  }

  const neededCount = Math.max(1, positionRow.needed_count ?? 1);
  if ((acceptedCount ?? 0) >= neededCount) {
    return { ok: false, error: "This position is already filled" };
  }

  const { data: existing, error: existingError } =
    await fetchExistingApplicationForApplicant(projectId, userId);
  if (existingError) {
    return { ok: false, error: existingError.message };
  }

  const payload = {
    project_id: projectId,
    applicant_id: userId,
    position_id: positionId,
    status: "pending",
    motivation_message: input.motivationMessage.trim(),
    skills: uniqTrimmed(input.skills),
    portfolio_urls: uniqTrimmed(input.portfolioUrls),
    additional_note: input.additionalNote.trim(),
    note: input.additionalNote.trim(),
  };

  let applicationId: string | null = null;

  if (existing) {
    if (existing.status !== "rejected") {
      return { ok: false, error: "You already applied to this project" };
    }

    const result = await updateProjectApplication(existing.id, {
      ...payload,
      rejection_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (result.error) {
      if (result.error.code === "23505") {
        return { ok: false, error: "You already applied to this project" };
      }
      return { ok: false, error: result.error.message };
    }

    applicationId = result.data?.id ?? null;
  } else {
    const result = await insertProjectApplication(payload);

    if (result.error) {
      if (result.error.code === "23505") {
        return { ok: false, error: "You already applied to this project" };
      }
      return { ok: false, error: result.error.message };
    }

    applicationId = result.data?.id ?? null;
  }

  if (!applicationId) {
    return { ok: false, error: "Failed to create application" };
  }

  return { ok: true, data: { applicationId } };
}

export async function getProjectApplicationsForUser(
  userId: string,
): Promise<ActionResult<AppliedProjectCard[]>> {
  const { data: applications, error } = await fetchProjectApplicationsByApplicant(userId);
  if (error) {
    if (isMissingColumnError(error.message)) return { ok: true, data: [] };
    return { ok: false, error: error.message };
  }

  const appRows = (applications ?? []) as Array<{
    id: string;
    project_id: string;
    status: string | null;
    rejection_reason: string | null;
    created_at: string | null;
  }>;
  if (appRows.length === 0) return { ok: true, data: [] };

  const projectIds = Array.from(new Set(appRows.map((item) => item.project_id)));
  const { data: projects, error: projectsError } = await fetchProjectsByIds(projectIds);
  if (projectsError) return { ok: false, error: projectsError.message };

  const projectRows = (projects ?? []) as Array<{
    id: string;
    title: string;
    owner_id: string;
  }>;
  const ownerIds = Array.from(new Set(projectRows.map((item) => item.owner_id)));

  const [ownersResult, linksResult] =
    ownerIds.length === 0
      ? [
          { data: [], error: null },
          { data: [], error: null },
        ]
      : await Promise.all([
          fetchProjectOwnersByIds(ownerIds),
          fetchProjectOwnerContacts(ownerIds),
        ]);

  if (ownersResult.error) return { ok: false, error: ownersResult.error.message };
  if (linksResult.error) return { ok: false, error: linksResult.error.message };

  const projectById = new Map(projectRows.map((project) => [project.id, project]));
  const ownerById = new Map(
    ((ownersResult.data ?? []) as Array<{
      id: string;
      displayname: string | null;
      name: string | null;
      username: string | null;
      email: string | null;
    }>).map((owner) => [owner.id, owner]),
  );
  const contactByOwnerId = new Map<string, string>();
  for (const link of (linksResult.data ?? []) as Array<{
    user_id: string;
    url: string | null;
  }>) {
    if (link.url && !contactByOwnerId.has(link.user_id)) {
      contactByOwnerId.set(link.user_id, link.url);
    }
  }

  return {
    ok: true,
    data: buildAppliedProjectCards({
      applications: appRows,
      projectById,
      ownerById,
      contactByOwnerId,
    }),
  };
}
