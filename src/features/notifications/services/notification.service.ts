import { supabaseAdminClient } from "@/lib/supabase/admin-client";
import { ApplicantApplicationStatus, CreatorProjectStatus } from "@/types/status";

function isMissingTableError(message?: string) {
  if (!message) return false;
  return message.includes("Could not find the table");
}

function getStatusNotificationContent(
  status: CreatorProjectStatus,
  projectTitle: string,
) {
  switch (status) {
    case "approved":
      return {
        title: "โปรเจกต์ได้รับการอนุมัติแล้ว",
        message: `โปรเจกต์ ${projectTitle} พร้อมเปิดรับสมัคร`,
      };
    case "rejected_by_admin":
      return {
        title: "โปรเจกต์ถูกตีกลับโดยแอดมิน",
        message: `โปรเจกต์ ${projectTitle} ต้องแก้ไขข้อมูลก่อนส่งใหม่`,
      };
    default:
      return null;
  }
}

function getAppliedStatusNotificationContent(
  status: ApplicantApplicationStatus,
  projectTitle: string,
) {
  switch (status) {
    case "applied":
    case "pending":
      return {
        title: "สมัครโปรเจกต์สำเร็จ",
        message: `คุณได้สมัครโปรเจกต์ ${projectTitle} แล้ว`,
      };
    case "in_review":
      return {
        title: "ใบสมัครกำลังถูกพิจารณา",
        message: `ใบสมัครของคุณในโปรเจกต์ ${projectTitle} อยู่ระหว่างการพิจารณา`,
      };
    case "accepted":
      return {
        title: "คุณได้รับคัดเลือก",
        message: `คุณผ่านการคัดเลือกในโปรเจกต์ ${projectTitle}`,
      };
    case "rejected":
      return {
        title: "ผลการสมัครไม่ผ่าน",
        message: `คุณไม่ผ่านการคัดเลือกในโปรเจกต์ ${projectTitle}`,
      };
  }
}

export async function createMyProjectStatusNotification(input: {
  userId: string;
  projectId: string;
  projectTitle: string;
  status: CreatorProjectStatus;
}) {
  const content = getStatusNotificationContent(input.status, input.projectTitle);
  if (!content) return;

  const { error } = await supabaseAdminClient.from("notifications").insert({
    user_id: input.userId,
    project_id: input.projectId,
    category: "my-project",
    event_type: "project_status_changed",
    title: content.title,
    message: content.message,
    status: input.status,
    is_read: false,
  });

  if (error && !isMissingTableError(error.message)) {
    throw error;
  }
}

export async function syncMyProjectNewApplicantNotificationsForOwner(
  ownerId: string,
) {
  const { data: ownedProjects, error: ownedProjectsError } = await supabaseAdminClient
    .from("projects")
    .select("id,title")
    .eq("owner_id", ownerId);

  if (ownedProjectsError) {
    if (isMissingTableError(ownedProjectsError.message)) return;
    throw ownedProjectsError;
  }

  const projects = (ownedProjects ?? []) as Array<{ id: string; title: string }>;
  if (projects.length === 0) return;

  const projectIds = projects.map((project) => project.id);
  const [{ data: applications, error: applicationsError }, { data: existing, error: existingError }] =
    await Promise.all([
      supabaseAdminClient
        .from("project_applications")
        .select("project_id,applicant_id")
        .in("project_id", projectIds),
      supabaseAdminClient
        .from("notifications")
        .select("event_type")
        .eq("user_id", ownerId)
        .eq("category", "my-project"),
    ]);

  if (applicationsError) {
    if (isMissingTableError(applicationsError.message)) return;
    throw applicationsError;
  }

  if (existingError) {
    if (isMissingTableError(existingError.message)) return;
    throw existingError;
  }

  const appRows = (applications ?? []) as Array<{
    project_id: string;
    applicant_id: string;
  }>;
  if (appRows.length === 0) return;

  const applicantIds = Array.from(new Set(appRows.map((item) => item.applicant_id)));
  const { data: profiles, error: profilesError } = await supabaseAdminClient
    .from("profiles")
    .select("id,name")
    .in("id", applicantIds);

  if (profilesError) {
    throw profilesError;
  }

  const projectTitleById = new Map(projects.map((project) => [project.id, project.title]));
  const applicantNameById = new Map(
    ((profiles ?? []) as Array<{ id: string; name: string | null }>).map((profile) => [
      profile.id,
      profile.name?.trim() || "มีผู้สมัครใหม่",
    ]),
  );

  const existingEventTypes = new Set(
    ((existing ?? []) as Array<{ event_type: string | null }>)
      .map((row) => row.event_type ?? "")
      .filter(Boolean),
  );

  const toInsert = appRows
    .map((application) => {
      const eventType = `new_applicant:${application.project_id}:${application.applicant_id}`;
      if (existingEventTypes.has(eventType)) return null;

      const projectTitle = projectTitleById.get(application.project_id) ?? "โปรเจกต์";
      const applicantName = applicantNameById.get(application.applicant_id) ?? "มีผู้สมัครใหม่";

      return {
        user_id: ownerId,
        project_id: application.project_id,
        category: "my-project",
        event_type: eventType,
        title: "มีผู้สมัครเข้ามาใหม่",
        message: `${applicantName} สมัครเข้าร่วมโปรเจกต์ ${projectTitle}`,
        status: "pending_approval",
        is_read: false,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (toInsert.length === 0) return;

  const { error: insertError } = await supabaseAdminClient
    .from("notifications")
    .insert(toInsert);

  if (insertError && !isMissingTableError(insertError.message)) {
    throw insertError;
  }
}

function mapApplicationStatus(status: string | null): ApplicantApplicationStatus {
  if (
    status === "pending" ||
    status === "applied" ||
    status === "in_review" ||
    status === "accepted" ||
    status === "rejected"
  ) {
    return status;
  }
  return "pending";
}

export async function syncAppliedNotificationsForUser(userId: string) {
  const { data: applications, error: applicationsError } = await supabaseAdminClient
    .from("project_applications")
    .select("id,project_id,status")
    .eq("applicant_id", userId);

  if (applicationsError) {
    if (isMissingTableError(applicationsError.message)) return;
    throw applicationsError;
  }

  const appRows = (applications ?? []) as Array<{
    id: string;
    project_id: string;
    status: string | null;
  }>;

  if (appRows.length === 0) return;

  const projectIds = Array.from(new Set(appRows.map((item) => item.project_id)));
  const [{ data: projects, error: projectsError }, { data: existing, error: existingError }] =
    await Promise.all([
      supabaseAdminClient.from("projects").select("id,title").in("id", projectIds),
      supabaseAdminClient
        .from("notifications")
        .select("project_id,status")
        .eq("user_id", userId)
        .eq("category", "applied"),
    ]);

  if (projectsError) {
    throw projectsError;
  }

  if (existingError) {
    if (isMissingTableError(existingError.message)) return;
    throw existingError;
  }

  const projectTitleById = new Map<string, string>(
    ((projects ?? []) as Array<{ id: string; title: string }>).map((project) => [
      project.id,
      project.title,
    ]),
  );

  const existingKeys = new Set(
    ((existing ?? []) as Array<{ project_id: string | null; status: string | null }>)
      .filter((item) => item.project_id)
      .map((item) => `${item.project_id}:${item.status ?? "applied"}`),
  );

  const toInsert = appRows
    .map((application) => {
      const status = mapApplicationStatus(application.status);
      const key = `${application.project_id}:${status}`;
      if (existingKeys.has(key)) return null;

      const projectTitle =
        projectTitleById.get(application.project_id) ?? "โปรเจกต์";
      const content = getAppliedStatusNotificationContent(status, projectTitle);
      return {
        user_id: userId,
        project_id: application.project_id,
        category: "applied",
        event_type: "application_status_changed",
        title: content.title,
        message: content.message,
        status,
        is_read: false,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (toInsert.length === 0) return;

  const { error: insertError } = await supabaseAdminClient
    .from("notifications")
    .insert(toInsert);

  if (insertError && !isMissingTableError(insertError.message)) {
    throw insertError;
  }
}
