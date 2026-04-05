import { supabaseAdmin } from "@/lib/supabase/admin";
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
    case "draft":
      return {
        title: "โปรเจกต์ยังเป็นแบบร่าง",
        message: `โปรเจกต์ ${projectTitle} ถูกบันทึกเป็นแบบร่าง`,
      };
    case "pending_approval":
      return {
        title: "โปรเจกต์อยู่ระหว่างรออนุมัติ",
        message: `โปรเจกต์ ${projectTitle} ถูกส่งรอการตรวจสอบแล้ว`,
      };
    case "approved":
      return {
        title: "โปรเจกต์ได้รับการอนุมัติแล้ว",
        message: `โปรเจกต์ ${projectTitle} พร้อมเปิดรับสมัคร`,
      };
    case "open":
    case "reviewing":
      return {
        title: "โปรเจกต์กำลังดำเนินการ",
        message: `โปรเจกต์ ${projectTitle} อยู่ในสถานะกำลังดำเนินการ`,
      };
    case "rejected_by_admin":
      return {
        title: "โปรเจกต์ถูกตีกลับโดยแอดมิน",
        message: `โปรเจกต์ ${projectTitle} ต้องแก้ไขข้อมูลก่อนส่งใหม่`,
      };
    case "closed":
      return {
        title: "โปรเจกต์ปิดรับสมัครแล้ว",
        message: `โปรเจกต์ ${projectTitle} ถูกปิดรับสมัคร`,
      };
  }
}

function getAppliedStatusNotificationContent(
  status: ApplicantApplicationStatus,
  projectTitle: string,
) {
  switch (status) {
    case "applied":
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

  const { error } = await supabaseAdmin.from("notifications").insert({
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

function mapApplicationStatus(status: string | null): ApplicantApplicationStatus {
  if (
    status === "applied" ||
    status === "in_review" ||
    status === "accepted" ||
    status === "rejected"
  ) {
    return status;
  }
  return "applied";
}

export async function syncAppliedNotificationsForUser(userId: string) {
  const { data: applications, error: applicationsError } = await supabaseAdmin
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
      supabaseAdmin.from("projects").select("id,title").in("id", projectIds),
      supabaseAdmin
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

  const { error: insertError } = await supabaseAdmin
    .from("notifications")
    .insert(toInsert);

  if (insertError && !isMissingTableError(insertError.message)) {
    throw insertError;
  }
}
