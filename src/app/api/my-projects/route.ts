import { unstable_noStore as noStore } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import {
  getMyProjectsService,
  mapMyProjectsZodError,
} from "@/features/projects/services/my-projects-api.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    noStore();
    const result = await getMyProjectsService({
      ownerId: request.nextUrl.searchParams.get("ownerId")?.trim(),
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const zodResult = mapMyProjectsZodError(error);
    if (zodResult) {
      return NextResponse.json(zodResult.body, { status: zodResult.status });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
