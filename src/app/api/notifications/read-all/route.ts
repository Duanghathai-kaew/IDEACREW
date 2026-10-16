import { getCurrentSession } from "@/lib/auth/current-session";
import { NextResponse } from "next/server";

import {
  mapNotificationsZodError,
  markAllNotificationsAsReadService,
} from "@/features/notifications/services/notifications-api.service";

export async function PATCH() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Please login again" }, { status: 401 });
  }
  try {
    const result = await markAllNotificationsAsReadService({
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
