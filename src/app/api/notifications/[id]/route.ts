import { NextRequest, NextResponse } from "next/server";

import {
  deleteNotificationByIdService,
  mapNotificationsZodError,
} from "@/features/notifications/services/notifications-api.service";
import { notificationIdParamsSchema } from "@/features/notifications/schemas/notifications-api.schema";

type ParamsContext = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: ParamsContext) {
  try {
    const params = notificationIdParamsSchema.parse(await context.params);
    const result = await deleteNotificationByIdService({
      id: params.id,
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
