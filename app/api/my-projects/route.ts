import { NextRequest, NextResponse } from "next/server";

import { MyProject } from "@/lib/myProjectMockData";
import { supabaseAdmin } from "@/lib/supabase/admin";

type DbProject = {
  id: string;
  title: string;
  summary: string | null;
  status: string | null;
  created_at: string | null;
  application_end_date: string | null;
};

type DbPosition = {
  project_id: string;
  title: string;
};

type DbCategory = {
  project_id: string;
  category_name: string;
};

type DbApplication = {
  project_id: string;
};

export const runtime = "nodejs";

function mapStatus(status: string | null): MyProject["status"] {
  switch (status) {
    case "draft":
    case "open":
    case "pending_approval":
    case "rejected_by_admin":
    case "approved":
    case "reviewing":
    case "closed":
      return status;
    default:
      return "draft";
  }
}

function formatThaiDate(value: string | null): string {
  if (!value) return "ยังไม่กำหนด";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ยังไม่กำหนด";

  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function GET(request: NextRequest) {
  const ownerId = request.nextUrl.searchParams.get("ownerId")?.trim();

  let projectsQuery = supabaseAdmin
    .from("projects")
    .select("id,title,summary,status,created_at,application_end_date,owner_id")
    .order("created_at", { ascending: false });

  if (ownerId) {
    projectsQuery = projectsQuery.eq("owner_id", ownerId);
  }

  const { data: projects, error: projectsError } = await projectsQuery;

  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 });
  }

  const projectRows = (projects ?? []) as DbProject[];
  const projectIds = projectRows.map((project) => project.id);

  if (projectIds.length === 0) {
    return NextResponse.json({ data: [] as MyProject[] });
  }

  const [categoriesRes, positionsRes, applicationsRes] = await Promise.all([
    supabaseAdmin
      .from("project_categories")
      .select("project_id,category_name")
      .in("project_id", projectIds),
    supabaseAdmin
      .from("project_positions")
      .select("project_id,title")
      .in("project_id", projectIds),
    supabaseAdmin
      .from("project_applications")
      .select("project_id")
      .in("project_id", projectIds),
  ]);

  if (categoriesRes.error || positionsRes.error) {
    return NextResponse.json(
      {
        error:
          categoriesRes.error?.message ||
          positionsRes.error?.message ||
          "Failed to fetch my project metadata",
      },
      { status: 500 },
    );
  }

  const categoryRows = (categoriesRes.data ?? []) as DbCategory[];
  const positionRows = (positionsRes.data ?? []) as DbPosition[];

  const categoriesByProjectId = new Map<string, string[]>();
  for (const row of categoryRows) {
    const current = categoriesByProjectId.get(row.project_id) ?? [];
    current.push(row.category_name);
    categoriesByProjectId.set(row.project_id, current);
  }

  const positionsByProjectId = new Map<string, string[]>();
  for (const row of positionRows) {
    const current = positionsByProjectId.get(row.project_id) ?? [];
    current.push(row.title);
    positionsByProjectId.set(row.project_id, current);
  }

  const applicantCountByProjectId = new Map<string, number>();
  if (!applicationsRes.error) {
    const applicationRows = (applicationsRes.data ?? []) as DbApplication[];
    for (const row of applicationRows) {
      applicantCountByProjectId.set(
        row.project_id,
        (applicantCountByProjectId.get(row.project_id) ?? 0) + 1,
      );
    }
  }

  const payload: MyProject[] = projectRows.map((project) => {
    const tags = Array.from(
      new Set([
        ...(categoriesByProjectId.get(project.id) ?? []),
        ...(positionsByProjectId.get(project.id) ?? []),
      ]),
    );

    return {
      id: project.id,
      detailId: project.id,
      title: project.title,
      status: mapStatus(project.status),
      createdAt: formatThaiDate(project.created_at),
      summary: project.summary ?? "",
      tags,
      applicants: applicantCountByProjectId.get(project.id) ?? 0,
      deadline: formatThaiDate(project.application_end_date),
    };
  });

  return NextResponse.json({ data: payload });
}
