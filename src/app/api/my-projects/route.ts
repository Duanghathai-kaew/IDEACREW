import { getCurrentSession } from "@/lib/auth/current-session";
import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";

import {
  getMyProjectsService,
  mapMyProjectsZodError,
} from "@/features/projects/services/my-projects-api.service";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Please login again" }, { status: 401 });
  }
  try {
    noStore();
    const result = await getMyProjectsService({
      ownerId: session.userId,
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
