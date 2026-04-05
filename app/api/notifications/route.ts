import { NextRequest, NextResponse } from "next/server";

import {
  syncAppliedNotificationsForUser,
  syncMyProjectNewApplicantNotificationsForOwner,
} from "@/lib/server/notifications";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NotificationCategory, NotificationItem } from "@/types/notification";

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

type DbProject = {
  id: string;
  title: string;
};

function isMissingTableError(message?: string) {
  if (!message) return false;
  return message.includes("Could not find the table");
}

function formatShortThaiDate(dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

function mapCategory(value: string): NotificationCategory {
  return value === "applied" ? "applied" : "my-project";
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")?.trim();
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    await syncMyProjectNewApplicantNotificationsForOwner(userId);
    await syncAppliedNotificationsForUser(userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync notifications";
    if (!isMissingTableError(message)) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("id,event_type,title,message,project_id,created_at,is_read,status,category")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) {
      return NextResponse.json({ data: [] as NotificationItem[] });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from("projects")
      .select("id,title")
      .in("id", projectIds);
    if (!projectsError) {
      projectTitleById = new Map(
        ((projects ?? []) as DbProject[]).map((project) => [project.id, project.title]),
      );
    }
  }

  const items: NotificationItem[] = notificationRows.map((row) => ({
    id: row.id,
    eventType: row.event_type ?? "",
    category: mapCategory(row.category),
    title: row.title,
    message: row.message,
    projectTitle: row.project_id
      ? projectTitleById.get(row.project_id) ?? "โปรเจกต์"
      : "โปรเจกต์",
    projectId: row.project_id ?? "",
    date: formatShortThaiDate(row.created_at),
    isRead: row.is_read,
    status: (row.status ?? "draft") as NotificationItem["status"],
  }));

  return NextResponse.json({ data: items });
}

export async function DELETE(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")?.trim();
  const category = request.nextUrl.searchParams.get("category")?.trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  let query = supabaseAdmin.from("notifications").delete().eq("user_id", userId);
  if (category === "my-project" || category === "applied") {
    query = query.eq("category", category);
  }

  const { error } = await query;
  if (error) {
    if (isMissingTableError(error.message)) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
