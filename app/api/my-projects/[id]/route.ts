import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { MyProjectStatus } from "@/lib/myProjectMockData";

export const runtime = "nodejs";

type DbProject = {
  id: string;
  owner_id: string;
  title: string;
  summary: string | null;
  status: string | null;
  application_end_date: string | null;
};

const allowedStatus: MyProjectStatus[] = [
  "draft",
  "open",
  "pending_approval",
  "rejected_by_admin",
  "approved",
  "reviewing",
  "closed",
];

function isMissingTableError(message?: string) {
  if (!message) return false;
  return message.includes("Could not find the table");
}

function getOwnerId(request: NextRequest) {
  return request.nextUrl.searchParams.get("ownerId")?.trim() ?? "";
}

function mapStatus(status: string | null): MyProjectStatus {
  if (status && allowedStatus.includes(status as MyProjectStatus)) {
    return status as MyProjectStatus;
  }
  return "draft";
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const ownerId = getOwnerId(request);
  const { id } = await context.params;

  if (!ownerId) {
    return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("id,owner_id,title,summary,status,application_end_date")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = data as DbProject;

  return NextResponse.json({
    data: {
      id: project.id,
      title: project.title,
      summary: project.summary ?? "",
      status: mapStatus(project.status),
      applicationEndDate: project.application_end_date
        ? project.application_end_date.slice(0, 10)
        : "",
    },
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const ownerId = getOwnerId(request);
  const { id } = await context.params;

  if (!ownerId) {
    return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
  }

  const body = (await request.json()) as {
    title?: string;
    summary?: string;
    status?: string;
    applicationEndDate?: string;
  };

  const title = (body.title ?? "").trim();
  const summary = (body.summary ?? "").trim();
  const status = (body.status ?? "").trim();
  const applicationEndDate = (body.applicationEndDate ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  if (!allowedStatus.includes(status as MyProjectStatus)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("projects")
    .update({
      title,
      summary,
      status,
      application_end_date: applicationEndDate || null,
    })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const ownerId = getOwnerId(request);
  const { id } = await context.params;

  if (!ownerId) {
    return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
  }

  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: positions, error: positionsError } = await supabaseAdmin
    .from("project_positions")
    .select("id")
    .eq("project_id", id);

  if (positionsError) {
    return NextResponse.json({ error: positionsError.message }, { status: 500 });
  }

  const positionIds = (positions ?? []).map((position) => position.id as string);

  if (positionIds.length > 0) {
    const [skillsDeleteRes, qualsDeleteRes] = await Promise.all([
      supabaseAdmin
        .from("project_position_skills")
        .delete()
        .in("position_id", positionIds),
      supabaseAdmin
        .from("project_position_basic_qualifications")
        .delete()
        .in("position_id", positionIds),
    ]);

    if (skillsDeleteRes.error || qualsDeleteRes.error) {
      return NextResponse.json(
        {
          error:
            skillsDeleteRes.error?.message ||
            qualsDeleteRes.error?.message ||
            "Failed to delete position metadata",
        },
        { status: 500 },
      );
    }
  }

  const [positionsDeleteRes, categoriesDeleteRes, applicationsDeleteRes] =
    await Promise.all([
      supabaseAdmin.from("project_positions").delete().eq("project_id", id),
      supabaseAdmin.from("project_categories").delete().eq("project_id", id),
      supabaseAdmin.from("project_applications").delete().eq("project_id", id),
    ]);

  const applicationsDeleteError =
    applicationsDeleteRes.error &&
    !isMissingTableError(applicationsDeleteRes.error.message)
      ? applicationsDeleteRes.error
      : null;

  if (
    positionsDeleteRes.error ||
    categoriesDeleteRes.error ||
    applicationsDeleteError
  ) {
    return NextResponse.json(
      {
        error:
          positionsDeleteRes.error?.message ||
          categoriesDeleteRes.error?.message ||
          applicationsDeleteError?.message ||
          "Failed to delete project relations",
      },
      { status: 500 },
    );
  }

  const { error: projectDeleteError } = await supabaseAdmin
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (projectDeleteError) {
    return NextResponse.json(
      { error: projectDeleteError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
