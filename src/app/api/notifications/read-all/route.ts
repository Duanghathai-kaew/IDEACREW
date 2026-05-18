import { NextRequest, NextResponse } from "next/server";

import {
  mapNotificationsZodError,
  markAllNotificationsAsReadService,
} from "@/features/notifications/services/notifications-api.service";

export async function PATCH(request: NextRequest) {
  try {
    const result = await markAllNotificationsAsReadService({
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
