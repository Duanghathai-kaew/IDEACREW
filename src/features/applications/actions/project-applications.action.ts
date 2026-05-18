"use server";

import { revalidatePath } from "next/cache";

import { supabaseAdminClient } from "@/lib/supabase/admin-client";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type ApplyProfilePrefill = {
  skills: string[];
  portfolioUrls: string[];
  bio: string;
};

export type ApplicantCard = {
  id: string;
  applicantId: string;
  positionId: string | null;
  positionTitle: string | null;
  positionNeededCount: number | null;
  positionAcceptedCount: number | null;
  positionRequiredSkills: string[] | null;
  displayName: string;
  avatarUrl: string;
  skills: string[];
  portfolioUrls: string[];
  motivationMessage: string;
  additionalNote: string;
  appliedAt: string;
  status: ApplicationStatus;
};

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export type ProjectPositionOption = {
  id: string;
  title: string;
  neededCount: number;
  acceptedCount: number;
  requiredSkills: string[];
  isActive: boolean;
  isFull: boolean;
};

export type AppliedProjectCard = {
  id: string;
  projectId: string;
  projectTitle: string;
  ownerName: string;
  ownerEmail: string;
  ownerContactLink: string;
  appliedAt: string;
  status: ApplicationStatus;
  rejectionReason: string;
};

export type RecruitmentPosition = {
  id: string;
  title: string;
  neededCount: number;
  acceptedCount: number;
  requiredSkills: string[];
  isFull: boolean;
};

export type TeamMember = {
  userId: string;
  displayName: string;
  avatarUrl: string;
  positionTitle: string;
  acceptedAt: string;
};

function uniq(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

function mapStatus(status: string | null): ApplicationStatus {
  if (status === "accepted" || status === "rejected") return status;
  return "pending";
}

function isMissingColumnError(message?: string) {
  if (!message) return false;
  return message.includes("Could not find") || message.includes("schema cache");
}

export async function getApplyProfilePrefill(
  userId: string,
): Promise<ActionResult<ApplyProfilePrefill>> {
  const [
    { data: profile, error: profileError },
    { data: links, error: linksError },
  ] = await Promise.all([
    supabaseAdminClient
      .from("profiles")
      .select("skills,bio")
      .eq("id", userId)
      .maybeSingle(),
    supabaseAdminClient
      .from("profile_links")
      .select("url")
      .eq("user_id", userId)
      .eq("link_type", "portfolio")
      .order("sort_order", { ascending: true }),
  ]);

  if (profileError || linksError) {
    return {
      ok: false,
      error:
        profileError?.message ||
        linksError?.message ||
        "Failed to load profile",
    };
  }

  const row = (profile ?? {}) as {
    skills?: string[] | null;
    bio?: string | null;
  };
  const linkRows = (links ?? []) as Array<{ url: string | null }>;

  return {
    ok: true,
    data: {
      skills: row.skills ?? [],
      portfolioUrls: uniq(linkRows.map((item) => item.url ?? "")),
      bio: row.bio ?? "",
    },
  };
}

export async function getProjectPositions(
  projectId: string,
): Promise<ActionResult<ProjectPositionOption[]>> {
  const { data, error } = await supabaseAdminClient
    .from("project_positions")
    .select("id,title,required_skills,needed_count,accepted_count,is_active")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .order("title", { ascending: true });

  if (error) {
    console.error("getProjectPositions query error:", error);
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

  console.log("project_positions result:", positions);

  const availablePositions = positions.filter((position) => {
    const acceptedCount = position.accepted_count ?? 0;
    const neededCount = position.needed_count ?? 1;
    const isActive = position.is_active !== false;
    return isActive && acceptedCount < neededCount;
  });

  console.log("availablePositions:", availablePositions);

  return {
    ok: true,
    data: availablePositions.map((position) => ({
      id: position.id,
      title: position.title,
      neededCount: position.needed_count ?? 0,
      acceptedCount: position.accepted_count ?? 0,
      requiredSkills: position.required_skills ?? [],
      isActive: position.is_active ?? false,
      isFull: (position.accepted_count ?? 0) >= (position.needed_count ?? 1),
    })),
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

  const { data: project, error: projectError } = await supabaseAdminClient
    .from("projects")
    .select("id,owner_id,status")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError || !project) {
    return { ok: false, error: projectError?.message || "Project not found" };
  }

  const projectRow = project as { owner_id: string; status: string | null };
  if (projectRow.owner_id === userId) {
    return {
      ok: false,
      error: "Project owners cannot apply to their own project",
    };
  }
  if (projectRow.status !== "open") {
    return { ok: false, error: "This project is not open for applications" };
  }

  const { data: position, error: positionError } = await supabaseAdminClient
    .from("project_positions")
    .select("id,needed_count,accepted_count,is_active")
    .eq("id", positionId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (positionError || !position) {
    return { ok: false, error: "Position not found" };
  }

  const positionRow = position as {
    needed_count: number | null;
    accepted_count: number | null;
    is_active: boolean | null;
  };
  if (
    !positionRow.is_active ||
    (positionRow.accepted_count ?? 0) >= (positionRow.needed_count ?? 0)
  ) {
    return { ok: false, error: "This position is already filled" };
  }

  const { data: existing, error: existingError } = await supabaseAdminClient
    .from("project_applications")
    .select("id,status")
    .eq("project_id", projectId)
    .eq("applicant_id", userId)
    .maybeSingle();

  if (existingError) {
    return { ok: false, error: existingError.message };
  }

  const payload = {
    project_id: projectId,
    applicant_id: userId,
    position_id: positionId,
    status: "pending",
    motivation_message: input.motivationMessage.trim(),
    skills: uniq(input.skills),
    portfolio_urls: uniq(input.portfolioUrls),
    additional_note: input.additionalNote.trim(),
    note: input.additionalNote.trim(),
  };

  let data: {
    id: string;
  } | null = null;
  let error: { message: string; code?: string } | null = null;

  if (existing) {
    if (existing.status !== "rejected") {
      return { ok: false, error: "You already applied to this project" };
    }

    const result = await supabaseAdminClient
      .from("project_applications")
      .update({
        ...payload,
        rejection_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("id")
      .single();

    data = result.data as { id: string } | null;
    error = result.error;
  } else {
    const result = await supabaseAdminClient
      .from("project_applications")
      .insert(payload)
      .select("id")
      .single();

    data = result.data as { id: string } | null;
    error = result.error;
  }

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "You already applied to this project" };
    }
    return { ok: false, error: error.message };
  }

  await createNotification({
    userId: projectRow.owner_id,
    projectId,
    category: "my-project",
    type: "new_applicant",
    title: "มีผู้สมัครเข้ามาใหม่",
    message: "A student submitted a new project application",
    status: "pending",
    link: `/project/${projectId}`,
  });

  revalidatePath(`/project/${projectId}`);
  revalidatePath("/my-project");

  return { ok: true, data: { applicationId: (data as { id: string }).id } };
}

export async function getProjectApplicationsForUser(
  userId: string,
): Promise<ActionResult<AppliedProjectCard[]>> {
  const { data: applications, error } = await supabaseAdminClient
    .from("project_applications")
    .select("id,project_id,status,rejection_reason,created_at")
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });

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

  const projectIds = Array.from(
    new Set(appRows.map((item) => item.project_id)),
  );
  const { data: projects, error: projectsError } = await supabaseAdminClient
    .from("projects")
    .select("id,title,owner_id")
    .in("id", projectIds);

  if (projectsError) return { ok: false, error: projectsError.message };

  const projectRows = (projects ?? []) as Array<{
    id: string;
    title: string;
    owner_id: string;
  }>;
  const ownerIds = Array.from(
    new Set(projectRows.map((item) => item.owner_id)),
  );

  const [{ data: owners }, { data: links }] =
    ownerIds.length === 0
      ? [{ data: [] }, { data: [] }]
      : await Promise.all([
          supabaseAdminClient
            .from("profiles")
            .select("id,displayname,name,username,email")
            .in("id", ownerIds),
          supabaseAdminClient
            .from("profile_links")
            .select("user_id,url")
            .eq("link_type", "social")
            .in("user_id", ownerIds)
            .order("sort_order", { ascending: true }),
        ]);

  const projectById = new Map(
    projectRows.map((project) => [project.id, project]),
  );
  const ownerById = new Map(
    (
      (owners ?? []) as Array<{
        id: string;
        displayname: string | null;
        name: string | null;
        username: string | null;
        email: string | null;
      }>
    ).map((owner) => [owner.id, owner]),
  );
  const contactByOwnerId = new Map<string, string>();
  for (const link of (links ?? []) as Array<{
    user_id: string;
    url: string | null;
  }>) {
    if (link.url && !contactByOwnerId.has(link.user_id)) {
      contactByOwnerId.set(link.user_id, link.url);
    }
  }

  return {
    ok: true,
    data: appRows.map((application) => {
      const project = projectById.get(application.project_id);
      const owner = project ? ownerById.get(project.owner_id) : undefined;
      return {
        id: application.id,
        projectId: application.project_id,
        projectTitle: project?.title ?? "โปรเจกต์",
        ownerName:
          owner?.displayname?.trim() ||
          owner?.name?.trim() ||
          owner?.username?.trim() ||
          "Project owner",
        ownerEmail: owner?.email ?? "",
        ownerContactLink: project
          ? (contactByOwnerId.get(project.owner_id) ?? "")
          : "",
        appliedAt: application.created_at ?? "",
        status: mapStatus(application.status),
        rejectionReason: application.rejection_reason ?? "",
      };
    }),
  };
}

/**
 * Get recruitment progress for a project
 * Returns all positions with their acceptance counts and status
 */
export async function getProjectRecruitmentProgress(
  projectId: string,
): Promise<ActionResult<RecruitmentPosition[]>> {
  const { data, error } = await supabaseAdminClient
    .from("project_positions")
    .select("id,title,needed_count,accepted_count,required_skills,is_active")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .order("title", { ascending: true });

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

  return {
    ok: true,
    data: positions.map((position) => {
      const acceptedCount = position.accepted_count ?? 0;
      const neededCount = position.needed_count ?? 0;
      return {
        id: position.id,
        title: position.title,
        neededCount,
        acceptedCount,
        requiredSkills: position.required_skills ?? [],
        isFull: acceptedCount >= neededCount,
      };
    }),
  };
}

/**
 * Get team members for a project
 * Returns accepted applicants grouped by position with member details
 */
export async function getProjectTeamMembers(
  projectId: string,
): Promise<ActionResult<TeamMember[]>> {
  // Get accepted applications with position and applicant info
  const { data: applications, error } = await supabaseAdminClient
    .from("project_applications")
    .select("id,applicant_id,position_id,created_at,project_positions(title)")
    .eq("project_id", projectId)
    .eq("status", "accepted")
    .order("created_at", { ascending: true });

  if (error) {
    return { ok: false, error: error.message };
  }

  const appRows = (applications ?? []) as Array<{
    id: string;
    applicant_id: string;
    position_id: string | null;
    created_at: string | null;
    project_positions: Array<{ title: string }> | null;
  }>;

  if (appRows.length === 0) return { ok: true, data: [] };

  // Get profile info for all applicants
  const applicantIds = Array.from(
    new Set(appRows.map((app) => app.applicant_id)),
  );
  const { data: profiles, error: profileError } = await supabaseAdminClient
    .from("profiles")
    .select("id,displayname,name,username,avatar_url")
    .in("id", applicantIds);

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  const profileById = new Map(
    (
      (profiles ?? []) as Array<{
        id: string;
        displayname: string | null;
        name: string | null;
        username: string | null;
        avatar_url: string | null;
      }>
    ).map((profile) => [profile.id, profile]),
  );

  return {
    ok: true,
    data: appRows.map((app) => {
      const profile = profileById.get(app.applicant_id);
      const positionArray = app.project_positions as Array<{
        title: string;
      }> | null;
      const positionTitle = positionArray?.[0]?.title ?? "Member";
      return {
        userId: app.applicant_id,
        displayName:
          profile?.displayname?.trim() ||
          profile?.name?.trim() ||
          profile?.username?.trim() ||
          "Team Member",
        avatarUrl: profile?.avatar_url ?? "",
        positionTitle,
        acceptedAt: app.created_at ?? "",
      };
    }),
  };
}

export async function getProjectApplicants(input: {
  projectId: string;
  ownerId: string;
}): Promise<ActionResult<ApplicantCard[]>> {
  console.log("[getProjectApplicants] start", {
    projectId: input.projectId,
    ownerId: input.ownerId,
    rlsBypassedWithServiceRole: true,
  });

  const isOwner = await assertProjectOwner(input.projectId, input.ownerId);
  if (!isOwner.ok) return isOwner;

  const primaryResult = await supabaseAdminClient
    .from("project_applications")
    .select(
      "id,applicant_id,position_id,status,motivation_message,skills,portfolio_urls,additional_note,created_at,project_positions(title,needed_count,accepted_count,required_skills)",
    )
    .eq("project_id", input.projectId)
    .order("created_at", { ascending: false });

  let data = primaryResult.data;
  let error = primaryResult.error;

  if (error) {
    console.error("[getProjectApplicants] primary query failed", {
      projectId: input.projectId,
      error: error.message,
    });

    const fallbackResult = await supabaseAdminClient
      .from("project_applications")
      .select("*")
      .eq("project_id", input.projectId)
      .order("created_at", { ascending: false });

    data = fallbackResult.data;
    error = fallbackResult.error;

    if (error) {
      console.error("[getProjectApplicants] fallback query failed", {
        projectId: input.projectId,
        error: error.message,
      });
      return {
        ok: false,
        error: `Failed to fetch applicants: ${error.message}`,
      };
    }

    console.warn("[getProjectApplicants] fallback select(*) succeeded", {
      projectId: input.projectId,
      rowCount: (data ?? []).length,
    });
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

  console.log("[getProjectApplicants] applications", {
    projectId: input.projectId,
    applications: appRows,
  });

  if (appRows.length === 0) return { ok: true, data: [] };

  const applicantIds = Array.from(
    new Set(appRows.map((item) => item.applicant_id)),
  );

  const profilesPrimaryResult = await supabaseAdminClient
    .from("profiles")
    .select("id,displayname,name,username,avatar_url,skills")
    .in("id", applicantIds);

  let profiles = profilesPrimaryResult.data;
  let profilesError = profilesPrimaryResult.error;

  if (profilesError) {
    console.error("[getProjectApplicants] profile query failed", {
      projectId: input.projectId,
      error: profilesError.message,
    });

    const profilesFallbackResult = await supabaseAdminClient
      .from("profiles")
      .select("*")
      .in("id", applicantIds);

    profiles = profilesFallbackResult.data;
    profilesError = profilesFallbackResult.error;
  }

  if (profilesError) return { ok: false, error: profilesError.message };

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
    data: appRows.map((application) => {
      const profile = profileById.get(application.applicant_id);
      const positionData = application.project_positions as {
        title: string;
        needed_count: number | null;
        accepted_count: number | null;
        required_skills: string[] | null;
      } | null;
      return {
        id: application.id,
        applicantId: application.applicant_id,
        positionId: application.position_id ?? null,
        positionTitle: positionData?.title ?? null,
        positionNeededCount: positionData?.needed_count ?? null,
        positionAcceptedCount: positionData?.accepted_count ?? null,
        positionRequiredSkills: positionData?.required_skills ?? null,
        displayName:
          profile?.displayname?.trim() ||
          profile?.name?.trim() ||
          profile?.username?.trim() ||
          "Applicant",
        avatarUrl: profile?.avatar_url ?? "",
        skills: application.skills?.length
          ? application.skills
          : (profile?.skills ?? []),
        portfolioUrls: application.portfolio_urls ?? [],
        motivationMessage: application.motivation_message ?? "",
        additionalNote: application.additional_note ?? "",
        appliedAt: application.created_at ?? "",
        status: mapStatus(application.status),
      };
    }),
  };
}

/**
 * Check if a project's recruitment is complete (all positions filled)
 * and update project status to 'closed' if necessary
 */
async function checkAndUpdateProjectRecruitmentStatus(
  projectId: string,
): Promise<void> {
  try {
    // Get all active positions for the project
    const { data: positions, error } = await supabaseAdminClient
      .from("project_positions")
      .select("id,needed_count,accepted_count,is_active")
      .eq("project_id", projectId)
      .eq("is_active", true);

    if (error) {
      console.error(
        "[checkAndUpdateProjectRecruitmentStatus] query error:",
        error,
      );
      return;
    }

    // Check if all positions are full
    const allPositionsFull = (positions ?? []).every((position) => {
      const acceptedCount = position.accepted_count ?? 0;
      const neededCount = position.needed_count ?? 0;
      return acceptedCount >= neededCount;
    });

    // If all positions are full, update project status to 'closed'
    if (allPositionsFull && (positions ?? []).length > 0) {
      const { error: updateError } = await supabaseAdminClient
        .from("projects")
        .update({
          status: "closed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (updateError) {
        console.error(
          "[checkAndUpdateProjectRecruitmentStatus] update error:",
          updateError,
        );
      } else {
        console.log(
          "[checkAndUpdateProjectRecruitmentStatus] project status updated to closed",
        );
      }
    }
  } catch (err) {
    console.error(
      "[checkAndUpdateProjectRecruitmentStatus] unexpected error:",
      err,
    );
  }
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

  const { error: updateError } = await supabaseAdminClient
    .from("project_applications")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", input.applicationId);

  if (updateError) return { ok: false, error: updateError.message };

  // Add member to project with position association
  const { error: memberError } = await supabaseAdminClient
    .from("project_members")
    .upsert(
      {
        project_id: application.project_id,
        user_id: application.applicant_id,
        position_id: application.position_id || null,
        role: "member",
      },
      { onConflict: "project_id,user_id" },
    );

  if (memberError) return { ok: false, error: memberError.message };

  // If position_id exists, increment accepted_count
  if (application.position_id) {
    const { data: position, error: positionFetchError } = await supabaseAdminClient
      .from("project_positions")
      .select("accepted_count,needed_count")
      .eq("id", application.position_id)
      .maybeSingle();

    if (!positionFetchError && position) {
      const newCount = (position.accepted_count ?? 0) + 1;
      if (newCount > (position.needed_count ?? 0)) {
        return { ok: false, error: "This position is already filled" };
      }
      await supabaseAdminClient
        .from("project_positions")
        .update({ accepted_count: newCount })
        .eq("id", application.position_id);
    }
  }

  await createNotification({
    userId: application.applicant_id,
    projectId: application.project_id,
    category: "applied",
    type: "application_accepted",
    title: "Your application has been accepted",
    message: "Your application has been accepted",
    status: "accepted",
    link: `/project/${application.project_id}`,
  });

  // Check if recruitment is complete and update project status if necessary
  await checkAndUpdateProjectRecruitmentStatus(application.project_id);

  revalidatePath(`/project/${application.project_id}`);
  revalidatePath("/my-project");

  return { ok: true, data: undefined };
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
  const { error } = await supabaseAdminClient
    .from("project_applications")
    .update({
      status: "rejected",
      rejection_reason: input.rejectionReason.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.applicationId);

  if (error) return { ok: false, error: error.message };

  await createNotification({
    userId: application.applicant_id,
    projectId: application.project_id,
    category: "applied",
    type: "application_rejected",
    title: "Your application was rejected",
    message: "Your application was rejected",
    status: "rejected",
    link: `/project/${application.project_id}`,
  });

  revalidatePath(`/project/${application.project_id}`);
  revalidatePath("/my-project");

  return { ok: true, data: undefined };
}

async function assertProjectOwner(
  projectId: string,
  ownerId: string,
): Promise<ActionResult> {
  const { data, error } = await supabaseAdminClient
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data)
    return {
      ok: false,
      error: "You are not authorized to manage this project",
    };
  return { ok: true, data: undefined };
}

async function loadApplicationForOwner(
  applicationId: string,
  ownerId: string,
): Promise<
  ActionResult<{
    application: {
      id: string;
      project_id: string;
      applicant_id: string;
      position_id: string | null;
    };
  }>
> {
  const { data, error } = await supabaseAdminClient
    .from("project_applications")
    .select("id,project_id,applicant_id,position_id,projects!inner(owner_id)")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Application not found" };

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
      ok: false,
      error: "You are not authorized to manage this application",
    };
  }

  return {
    ok: true,
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

async function createNotification(input: {
  userId: string;
  projectId: string;
  category: "my-project" | "applied";
  type: string;
  title: string;
  message: string;
  status: string;
  link: string;
}) {
  const { error } = await supabaseAdminClient.from("notifications").insert({
    user_id: input.userId,
    project_id: input.projectId,
    category: input.category,
    event_type: input.type,
    type: input.type,
    title: input.title,
    message: input.message,
    status: input.status,
    link: input.link,
    is_read: false,
  });

  if (error && !isMissingColumnError(error.message)) {
    throw error;
  }
}

// ===== ADMIN MODERATION FUNCTIONS =====

export type AdminProjectPosition = {
  id: string;
  title: string;
  neededCount: number;
  acceptedCount: number;
  requiredSkills: string[];
  applicantCount: number;
  isFull: boolean;
};

export type AdminRecruitmentProgress = {
  totalPositions: number;
  filledPositions: number;
  totalNeeded: number;
  acceptedCount: number;
  completionRate: number;
};

export type AdminProject = {
  id: string;
  title: string;
  description: string;
  ownerName: string;
  ownerEmail: string;
  approvalStatus: "pending" | "approved" | "rejected";
  projectStatus: "open" | "closed";
  createdAt: string;
  applicationEndDate: string;
  applicantCount: number;
  positions: AdminProjectPosition[];
  recruitmentProgress: AdminRecruitmentProgress;
};

function mapProjectLifecycleStatus(status: string | null): "open" | "closed" {
  return status === "closed" ? "closed" : "open";
}

function mapApprovalStatus(
  approvalStatus: string | null,
  projectStatus: string | null,
): "pending" | "approved" | "rejected" {
  if (
    approvalStatus === "pending" ||
    approvalStatus === "approved" ||
    approvalStatus === "rejected"
  ) {
    return approvalStatus;
  }

  if (projectStatus === "pending_approval") return "pending";
  if (projectStatus === "rejected_by_admin") return "rejected";
  return "approved";
}

function buildRecruitmentProgress(
  positions: AdminProjectPosition[],
): AdminRecruitmentProgress {
  const totalPositions = positions.length;
  const filledPositions = positions.filter(
    (position) => position.isFull,
  ).length;
  const totalNeeded = positions.reduce(
    (sum, position) => sum + position.neededCount,
    0,
  );
  const acceptedCount = positions.reduce(
    (sum, position) => sum + position.acceptedCount,
    0,
  );
  const completionRate =
    totalNeeded > 0
      ? Math.min(100, Math.round((acceptedCount / totalNeeded) * 100))
      : 0;

  return {
    totalPositions,
    filledPositions,
    totalNeeded,
    acceptedCount,
    completionRate,
  };
}

/**
 * Get all projects for admin moderation panel
 * Returns all projects with their approval status
 */
export async function getAdminProjects(): Promise<
  ActionResult<AdminProject[]>
> {
  console.log("[getAdminProjects] Fetching projects from Supabase");

  const { data: projects, error } = await supabaseAdminClient
    .from("projects")
    .select(
      "id,title,description,owner_id,approval_status,status,created_at,application_end_date",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAdminProjects] Error:", error.message);
    return { ok: false, error: error.message };
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
  }>;

  if (projectRows.length === 0) {
    console.log("[getAdminProjects] No projects found");
    return { ok: true, data: [] };
  }

  const ownerIds = Array.from(new Set(projectRows.map((p) => p.owner_id)));
  const projectIds = projectRows.map((project) => project.id);
  const [ownersRes, positionsRes, applicationsRes] = await Promise.all([
    supabaseAdminClient
      .from("profiles")
      .select("id,displayname,name,email")
      .in("id", ownerIds),
    supabaseAdminClient
      .from("project_positions")
      .select("id,project_id,title,needed_count,accepted_count,required_skills")
      .in("project_id", projectIds),
    supabaseAdminClient
      .from("project_applications")
      .select("project_id,position_id")
      .in("project_id", projectIds),
  ]);

  if (ownersRes.error) {
    console.error(
      "[getAdminProjects] Error fetching owners:",
      ownersRes.error.message,
    );
    return { ok: false, error: ownersRes.error.message };
  }

  if (positionsRes.error) {
    console.error(
      "[getAdminProjects] Error fetching positions:",
      positionsRes.error.message,
    );
    return { ok: false, error: positionsRes.error.message };
  }

  if (applicationsRes.error) {
    console.error(
      "[getAdminProjects] Error fetching applications:",
      applicationsRes.error.message,
    );
    return { ok: false, error: applicationsRes.error.message };
  }

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

  const result = projectRows.map((project) => {
    const owner = ownerById.get(project.owner_id);
    const positions = positionsByProjectId.get(project.id) ?? [];
    return {
      id: project.id,
      title: project.title,
      description: project.description ?? "",
      ownerName: owner?.displayname?.trim() || owner?.name?.trim() || "Unknown",
      ownerEmail: owner?.email ?? "",
      approvalStatus: mapApprovalStatus(
        project.approval_status,
        project.status,
      ),
      projectStatus: mapProjectLifecycleStatus(project.status),
      createdAt: project.created_at ?? "",
      applicationEndDate: project.application_end_date ?? "",
      applicantCount: applicantCountByProjectId.get(project.id) ?? 0,
      positions,
      recruitmentProgress: buildRecruitmentProgress(positions),
    };
  });

  console.log("[adminProjects]", result);
  return { ok: true, data: result };
}

/**
 * Approve a project for publication
 */
export async function approveProject(projectId: string): Promise<ActionResult> {
  console.log("[approveProject]", { projectId });

  const { error } = await supabaseAdminClient
    .from("projects")
    .update({
      approval_status: "approved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) {
    console.error("[approveProject] Error:", error.message);
    return { ok: false, error: error.message };
  }

  // Notify project owner
  const { data: project } = await supabaseAdminClient
    .from("projects")
    .select("id,title,owner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (project) {
    await createNotification({
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

  revalidatePath("/admin/projects");
  revalidatePath("/admin/dashboard");
  return { ok: true, data: undefined };
}

/**
 * Reject a project with feedback
 */
export async function rejectProject(
  projectId: string,
  feedback: string,
): Promise<ActionResult> {
  console.log("[rejectProject]", { projectId, feedback });

  const { error } = await supabaseAdminClient
    .from("projects")
    .update({
      approval_status: "rejected",
      admin_feedback: feedback.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) {
    console.error("[rejectProject] Error:", error.message);
    return { ok: false, error: error.message };
  }

  // Notify project owner
  const { data: project } = await supabaseAdminClient
    .from("projects")
    .select("id,title,owner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (project) {
    await createNotification({
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

  revalidatePath("/admin/projects");
  revalidatePath("/admin/dashboard");
  return { ok: true, data: undefined };
}
