import { z } from "zod";

import {
  deleteNotificationsQuerySchema,
  notificationIdParamsSchema,
  notificationsQuerySchema,
} from "@/features/notifications/schemas/notifications-api.schema";
import {
  NotificationCategory,
  NotificationItem,
} from "@/features/notifications/types/notification.type";
import {
  syncAppliedNotificationsForUser,
  syncMyProjectNewApplicantNotificationsForOwner,
} from "@/lib/server/notifications";
import { supabaseAdminClient } from "@/lib/supabase/admin-client";
import {
  ApplicantApplicationStatus,
  CreatorProjectStatus,
} from "@/types/status";

type DbNotification = {
  id: string;
  event_type: string | null;
  title: string;
  message: string;
  project_id: string | null;
  created_at: string;
  is_read: boolean;
  status: string | null;
  category: string;
};

function isMissingTableError(message?: string) {
  return Boolean(message?.includes("Could not find the table"));
}

function formatShortThaiDate(dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

function mapCategory(value: string): NotificationCategory {
  return value === "applied" ? "applied" : "my-project";
}

function mapCreatorStatus(value: string | null): CreatorProjectStatus {
  switch (value) {
    case "pending_approval":
    case "rejected_by_admin":
    case "approved":
    case "open":
    case "reviewing":
    case "closed":
      return value;
    default:
      return "draft";
  }
}

function mapApplicantStatus(value: string | null): ApplicantApplicationStatus {
  switch (value) {
    case "in_review":
    case "pending":
    case "accepted":
    case "rejected":
      return value;
    default:
      return "pending";
  }
}

export async function getNotificationsService(query: unknown) {
  const { userId } = notificationsQuerySchema.parse(query);

  try {
    await syncMyProjectNewApplicantNotificationsForOwner(userId);
    await syncAppliedNotificationsForUser(userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync notifications";
    if (!isMissingTableError(message)) {
      return { status: 500, body: { error: message } };
    }
  }

  const { data, error } = await supabaseAdminClient
    .from("notifications")
    .select("id,event_type,title,message,project_id,created_at,is_read,status,category")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) {
      return { status: 200, body: { data: [] as NotificationItem[] } };
    }
    return { status: 500, body: { error: error.message } };
  }

  const notificationRows = (data ?? []) as DbNotification[];
  const projectIds = Array.from(
    new Set(
      notificationRows
        .map((item) => item.project_id)
        .filter((item): item is string => Boolean(item)),
    ),
  );

  let projectTitleById = new Map<string, string>();
  if (projectIds.length > 0) {
    const { data: projects, error: projectsError } = await supabaseAdminClient
      .from("projects")
      .select("id,title")
      .in("id", projectIds);
    if (!projectsError) {
      projectTitleById = new Map(
        ((projects ?? []) as Array<{ id: string; title: string }>).map((project) => [
          project.id,
          project.title,
        ]),
      );
    }
  }

  const items: NotificationItem[] = notificationRows.map((row) => {
    const category = mapCategory(row.category);
    const common = {
      id: row.id,
      eventType: row.event_type ?? "",
      title: row.title,
      message: row.message,
      projectTitle: row.project_id
        ? projectTitleById.get(row.project_id) ?? "โปรเจกต์"
        : "โปรเจกต์",
      projectId: row.project_id ?? "",
      date: formatShortThaiDate(row.created_at),
      isRead: row.is_read,
    };

    if (category === "applied") {
      return { ...common, category, status: mapApplicantStatus(row.status) };
    }

    return { ...common, category, status: mapCreatorStatus(row.status) };
  });

  return { status: 200, body: { data: items } };
}

export async function deleteNotificationsService(query: unknown) {
  const { userId, category } = deleteNotificationsQuerySchema.parse(query);
  let deleteQuery = supabaseAdminClient
    .from("notifications")
    .delete()
    .eq("user_id", userId);

  if (category) {
    deleteQuery = deleteQuery.eq("category", category);
  }

  const { error } = await deleteQuery;
  if (error) {
    if (isMissingTableError(error.message)) {
      return { status: 200, body: { ok: true } };
    }
    return { status: 500, body: { error: error.message } };
  }

  return { status: 200, body: { ok: true } };
}

export function mapNotificationsZodError(error: unknown) {
  if (error instanceof z.ZodError) {
    return { status: 400, body: { error: "Invalid query", issues: error.issues } };
  }
  return null;
}

export async function markAllNotificationsAsReadService(query: unknown) {
  const { userId } = notificationsQuerySchema.parse(query);
  const { error } = await supabaseAdminClient
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) return { status: 500, body: { error: error.message } };
  return { status: 200, body: { ok: true } };
}

export async function markNotificationAsReadService(input: unknown) {
  const parsed = notificationIdParamsSchema.extend({ userId: z.string().min(1) }).parse(input);
  const { data, error } = await supabaseAdminClient
    .from("notifications")
    .update({ is_read: true })
    .eq("id", parsed.id)
    .eq("user_id", parsed.userId)
    .select("id")
    .maybeSingle();
  if (error) return { status: 500, body: { error: error.message } };
  if (!data) return { status: 404, body: { error: "Notification not found" } };
  return { status: 200, body: { ok: true } };
}

export async function deleteNotificationByIdService(input: unknown) {
  const parsed = notificationIdParamsSchema.extend({ userId: z.string().min(1) }).parse(input);
  const { data, error } = await supabaseAdminClient
    .from("notifications")
    .delete()
    .eq("id", parsed.id)
    .eq("user_id", parsed.userId)
    .select("id")
    .maybeSingle();
  if (error) return { status: 500, body: { error: error.message } };
  if (!data) return { status: 404, body: { error: "Notification not found" } };
  return { status: 200, body: { ok: true } };
}
