"use server";

import { revalidatePath } from "next/cache";

import { supabaseAdmin } from "@/lib/supabase/admin";

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
    supabaseAdmin
      .from("profiles")
      .select("skills,bio")
      .eq("id", userId)
      .maybeSingle(),
    supabaseAdmin
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
  let positions: Array<{
    id: string;
    title: string;
    needed_count: number | null;
    accepted_count?: number | null;
  }> | null = null;

  const withAccepted = await supabaseAdmin
    .from("project_positions")
    .select("id,title,needed_count,accepted_count")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (withAccepted.error) {
    if (!isMissingColumnError(withAccepted.error.message)) {
      return { ok: false, error: withAccepted.error.message };
    }

    const fallback = await supabaseAdmin
      .from("project_positions")
      .select("id,title,needed_count")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    if (fallback.error) {
      return { ok: false, error: fallback.error.message };
    }

    positions = (fallback.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      needed_count: row.needed_count,
      accepted_count: null,
    }));
  } else {
    positions = withAccepted.data;
  }

  const positionRows = positions ?? [];
  const positionIds = positionRows.map((row) => row.id);

  const [skillsResult, acceptedAppsResult] =
    positionIds.length === 0
      ? [
          { data: [] as Array<{ position_id: string; skill_name: string }> },
          { data: [] as Array<{ position_id: string | null }> },
        ]
      : await Promise.all([
          supabaseAdmin
            .from("project_position_skills")
            .select("position_id,skill_name")
            .in("position_id", positionIds),
          supabaseAdmin
            .from("project_applications")
            .select("position_id")
            .eq("project_id", projectId)
            .eq("status", "accepted")
            .not("position_id", "is", null),
        ]);

  if ((skillsResult as { error?: { message: string } }).error) {
    return {
      ok: false,
      error: (skillsResult as { error: { message: string } }).error.message,
    };
  }

  if ((acceptedAppsResult as { error?: { message: string } }).error) {
    return {
      ok: false,
      error: (acceptedAppsResult as { error: { message: string } }).error
        .message,
    };
  }

  const skillsByPositionId = new Map<string, string[]>();
  for (const row of (skillsResult.data ?? []) as Array<{
    position_id: string;
    skill_name: string;
  }>) {
    const current = skillsByPositionId.get(row.position_id) ?? [];
    current.push(row.skill_name);
    skillsByPositionId.set(row.position_id, current);
  }

  const acceptedCountByPositionId = new Map<string, number>();
  for (const row of (acceptedAppsResult.data ?? []) as Array<{
    position_id: string | null;
  }>) {
    if (!row.position_id) continue;
    acceptedCountByPositionId.set(
      row.position_id,
      (acceptedCountByPositionId.get(row.position_id) ?? 0) + 1,
    );
  }

  const positionOptions = positionRows.map((pos) => {
    const acceptedCount =
      typeof pos.accepted_count === "number"
        ? pos.accepted_count
        : (acceptedCountByPositionId.get(pos.id) ?? 0);
    const neededCount = pos.needed_count ?? 0;

    return {
      id: pos.id,
      title: pos.title,
      neededCount,
      acceptedCount,
      requiredSkills: skillsByPositionId.get(pos.id) ?? [],
      isFull: acceptedCount >= neededCount,
    } satisfies ProjectPositionOption;
  });

  return { ok: true, data: positionOptions };
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

  const { data: project, error: projectError } = await supabaseAdmin
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

  // Verify position exists and belongs to this project
  const { data: position, error: positionError } = await supabaseAdmin
    .from("project_positions")
    .select("id,needed_count,accepted_count")
    .eq("id", positionId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (positionError || !position) {
    return { ok: false, error: "Position not found" };
  }

  const positionRow = position as {
    needed_count: number;
    accepted_count: number;
  };
  if (positionRow.accepted_count >= positionRow.needed_count) {
    return { ok: false, error: "This position is already filled" };
  }

  const { data: existing, error: existingError } = await supabaseAdmin
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

    const result = await supabaseAdmin
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
    const result = await supabaseAdmin
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
  const { data: applications, error } = await supabaseAdmin
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
  const { data: projects, error: projectsError } = await supabaseAdmin
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
          supabaseAdmin
            .from("profiles")
            .select("id,displayname,name,username,email")
            .in("id", ownerIds),
          supabaseAdmin
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

  const primaryResult = await supabaseAdmin
    .from("project_applications")
    .select(
      "id,applicant_id,position_id,status,motivation_message,skills,portfolio_urls,additional_note,created_at,project_positions(title)",
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

    const fallbackResult = await supabaseAdmin
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
    project_positions: { title: string } | { title: string }[] | null;
  }>;

  console.log("[getProjectApplicants] applications", {
    projectId: input.projectId,
    applications: appRows,
  });

  if (appRows.length === 0) return { ok: true, data: [] };

  const applicantIds = Array.from(
    new Set(appRows.map((item) => item.applicant_id)),
  );

  const profilesPrimaryResult = await supabaseAdmin
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

    const profilesFallbackResult = await supabaseAdmin
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
      } | null;
      return {
        id: application.id,
        applicantId: application.applicant_id,
        positionId: application.position_id ?? null,
        positionTitle: positionData?.title ?? null,
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

  const { error: updateError } = await supabaseAdmin
    .from("project_applications")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", input.applicationId);

  if (updateError) return { ok: false, error: updateError.message };

  // Add member to project with position association
  const { error: memberError } = await supabaseAdmin
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
    const { data: position, error: positionFetchError } = await supabaseAdmin
      .from("project_positions")
      .select("accepted_count,needed_count")
      .eq("id", application.position_id)
      .maybeSingle();

    if (!positionFetchError && position) {
      const newCount = (position.accepted_count ?? 0) + 1;
      await supabaseAdmin
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
  const { error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { error } = await supabaseAdmin.from("notifications").insert({
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
