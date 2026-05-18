import { NextRequest, NextResponse } from "next/server";

import {
  deleteNotificationsService,
  getNotificationsService,
  mapNotificationsZodError,
} from "@/features/notifications/services/notifications-api.service";

export async function GET(request: NextRequest) {
  try {
    const result = await getNotificationsService({
      userId: request.nextUrl.searchParams.get("userId")?.trim(),
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
  try {
    const result = await deleteNotificationsService({
      userId: request.nextUrl.searchParams.get("userId")?.trim(),
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
