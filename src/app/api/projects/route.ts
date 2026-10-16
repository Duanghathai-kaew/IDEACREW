import { getCurrentSession } from "@/lib/auth/current-session";
import { NextRequest, NextResponse } from "next/server";

import {
  createProjectService,
  getProjectsFeedService,
  mapZodError,
} from "@/features/projects/services/projects-api.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await getProjectsFeedService({});
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const zodResult = mapZodError(error);
    if (zodResult) {
      return NextResponse.json(zodResult.body, { status: zodResult.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Please login again" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const result = await createProjectService({ ...body, ownerId: session.userId });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const zodResult = mapZodError(error);
    if (zodResult) {
      return NextResponse.json(zodResult.body, { status: zodResult.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
