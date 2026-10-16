import { getCurrentSession } from "@/lib/auth/current-session";
import { NextRequest, NextResponse } from "next/server";

import {
  deleteNotificationsService,
  getNotificationsService,
  mapNotificationsZodError,
} from "@/features/notifications/services/notifications-api.service";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Please login again" }, { status: 401 });
  }
  try {
    const result = await getNotificationsService({
      userId: session.userId,
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const zodResult = mapNotificationsZodError(error);
    if (zodResult) {
      return NextResponse.json(zodResult.body, { status: zodResult.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Please login again" }, { status: 401 });
  }
  try {
    const result = await deleteNotificationsService({
      userId: session.userId,
      category: request.nextUrl.searchParams.get("category")?.trim() || undefined,
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const zodResult = mapNotificationsZodError(error);
    if (zodResult) {
      return NextResponse.json(zodResult.body, { status: zodResult.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
