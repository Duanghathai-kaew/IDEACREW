import { getCurrentSession } from "@/lib/auth/current-session";
import { NextRequest, NextResponse } from "next/server";

import {
  deleteNotificationByIdService,
  mapNotificationsZodError,
} from "@/features/notifications/services/notifications-api.service";
import { notificationIdParamsSchema } from "@/features/notifications/schemas/notifications-api.schema";

type ParamsContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: ParamsContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Please login again" }, { status: 401 });
  }
  try {
    const params = notificationIdParamsSchema.parse(await context.params);
    const result = await deleteNotificationByIdService({
      id: params.id,
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
