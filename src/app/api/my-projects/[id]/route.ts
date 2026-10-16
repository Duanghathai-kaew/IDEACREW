import { getCurrentSession } from "@/lib/auth/current-session";
import { unstable_noStore as noStore } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import {
  myProjectOwnerQuerySchema,
  myProjectParamsSchema,
  updateMyProjectBodySchema,
} from "@/features/projects/schemas/projects-api.schema";
import {
  deleteMyProjectByIdService,
  getMyProjectByIdService,
  mapMyProjectDetailZodError,
  patchMyProjectByIdService,
} from "@/features/projects/services/my-project-detail-api.service";

export const runtime = "nodejs";

type ParamsContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: ParamsContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Please login again" }, { status: 401 });
  }
  try {
    noStore();
    const params = myProjectParamsSchema.parse(await context.params);
    const query = myProjectOwnerQuerySchema.parse({
      ownerId: session.userId,
    });
    const result = await getMyProjectByIdService({
      id: params.id,
      ownerId: query.ownerId,
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const zodResult = mapMyProjectDetailZodError(error);
    if (zodResult) {
      return NextResponse.json(zodResult.body, { status: zodResult.status });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: ParamsContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Please login again" }, { status: 401 });
  }
  try {
    noStore();
    const params = myProjectParamsSchema.parse(await context.params);
    const query = myProjectOwnerQuerySchema.parse({
      ownerId: session.userId,
    });
    const body = updateMyProjectBodySchema.parse(await request.json());

    const result = await patchMyProjectByIdService({
      id: params.id,
      ownerId: query.ownerId,
      body,
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const zodResult = mapMyProjectDetailZodError(error);
    if (zodResult) {
      return NextResponse.json(zodResult.body, { status: zodResult.status });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: ParamsContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Please login again" }, { status: 401 });
  }
  try {
    noStore();
    const params = myProjectParamsSchema.parse(await context.params);
    const query = myProjectOwnerQuerySchema.parse({
      ownerId: session.userId,
    });
    const result = await deleteMyProjectByIdService({
      id: params.id,
      ownerId: query.ownerId,
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const zodResult = mapMyProjectDetailZodError(error);
    if (zodResult) {
      return NextResponse.json(zodResult.body, { status: zodResult.status });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
