import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { ProfileData } from "@/lib/mockData";

type DbProfileRow = {
  id: string;
  name: string | null;
  headline: string | null;
  status: string | null;
  faculty: string | null;
  major: string | null;
  year: string | null;
  student_id: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  skills: string[] | null;
  interests: string[] | null;
};

type DbProfileLinkRow = {
  link_type: "portfolio" | "social";
  label: string;
  url: string;
};

type DbProfileProjectRow = {
  title: string;
  role: string;
  year: string;
  description: string | null;
  tags: string[] | null;
};

function parseBody(request: NextRequest) {
  return request.json() as Promise<{
    userId?: string;
    profile?: ProfileData;
  }>;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getAcademicThaiYear(now = new Date()) {
  const buddhistYear = now.getFullYear() + 543;
  const month = now.getMonth() + 1;
  return month >= 8 ? buddhistYear : buddhistYear - 1;
}

function deriveYearFromStudentId(studentId: string) {
  if (!/^\d{10}$/.test(studentId)) return "";

  const intakeYearShort = Number(studentId.slice(0, 2));
  const currentYearShort = getAcademicThaiYear() % 100;
  let year = currentYearShort - intakeYearShort + 1;

  while (year < 1) year += 8;
  while (year > 8) year -= 8;

  return `ชั้นปีที่ ${year}`;
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")?.trim();
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (!isUuid(userId)) {
    return NextResponse.json(
      { error: "Invalid session user id. Please login again." },
      { status: 400 },
    );
  }

  const [{ data: profile, error: profileError }, { data: links, error: linksError }, { data: projects, error: projectsError }] =
    await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select(
          "id,name,headline,status,faculty,major,year,student_id,email,phone,location,bio,skills,interests",
        )
        .eq("id", userId)
        .maybeSingle(),
      supabaseAdmin
        .from("profile_links")
        .select("link_type,label,url")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("profile_projects")
        .select("title,role,year,description,tags")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true }),
    ]);

  if (profileError || linksError || projectsError) {
    return NextResponse.json(
      {
        error:
          profileError?.message ||
          linksError?.message ||
          projectsError?.message ||
          "Failed to load profile",
      },
      { status: 500 },
    );
  }

  const row = profile as DbProfileRow | null;
  if (!row) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const linkRows = (links ?? []) as DbProfileLinkRow[];
  const projectRows = (projects ?? []) as DbProfileProjectRow[];

  const payload: ProfileData = {
    id: row.id,
    name: row.name ?? "",
    headline: row.headline ?? "",
    status: row.status ?? "",
    faculty: row.faculty ?? "",
    major: row.major ?? "",
    year: deriveYearFromStudentId(row.student_id ?? "") || (row.year ?? ""),
    studentId: row.student_id ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    location: row.location ?? "",
    bio: row.bio ?? "",
    skills: row.skills ?? [],
    interests: row.interests ?? [],
    portfolioLinks: linkRows
      .filter((item) => item.link_type === "portfolio")
      .map((item) => ({ label: item.label, url: item.url })),
    socialLinks: linkRows
      .filter((item) => item.link_type === "social")
      .map((item) => ({ label: item.label, url: item.url })),
    projects: projectRows.map((item) => ({
      title: item.title,
      role: item.role,
      year: item.year,
      description: item.description ?? "",
      tags: item.tags ?? [],
    })),
  };

  return NextResponse.json({ data: payload });
}

export async function PATCH(request: NextRequest) {
  const body = await parseBody(request);
  const userId = body.userId?.trim();
  const profile = body.profile;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (!isUuid(userId)) {
    return NextResponse.json(
      { error: "Invalid session user id. Please login again." },
      { status: 400 },
    );
  }

  if (!profile) {
    return NextResponse.json({ error: "profile is required" }, { status: 400 });
  }

  const studentId = profile.studentId.trim();
  if (!/^\d{10}$/.test(studentId)) {
    return NextResponse.json(
      { error: "studentId must be exactly 10 numeric digits" },
      { status: 400 },
    );
  }

  const computedYear = deriveYearFromStudentId(studentId);

  const { error: updateProfileError } = await supabaseAdmin
    .from("profiles")
    .update({
      name: profile.name.trim(),
      headline: profile.headline.trim(),
      status: profile.status.trim(),
      faculty: profile.faculty.trim(),
      major: profile.major.trim(),
      year: computedYear,
      student_id: studentId,
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      location: profile.location.trim(),
      bio: profile.bio.trim(),
      skills: profile.skills,
      interests: profile.interests,
    })
    .eq("id", userId);

  if (updateProfileError) {
    return NextResponse.json({ error: updateProfileError.message }, { status: 500 });
  }

  const { error: deleteLinksError } = await supabaseAdmin
    .from("profile_links")
    .delete()
    .eq("user_id", userId);

  if (deleteLinksError) {
    return NextResponse.json({ error: deleteLinksError.message }, { status: 500 });
  }

  const allLinks = [
    ...profile.portfolioLinks.map((item, index) => ({
      user_id: userId,
      link_type: "portfolio",
      label: item.label.trim(),
      url: item.url.trim(),
      sort_order: index,
    })),
    ...profile.socialLinks.map((item, index) => ({
      user_id: userId,
      link_type: "social",
      label: item.label.trim(),
      url: item.url.trim(),
      sort_order: index,
    })),
  ].filter((item) => item.label && item.url);

  if (allLinks.length > 0) {
    const { error: insertLinksError } = await supabaseAdmin
      .from("profile_links")
      .insert(allLinks);

    if (insertLinksError) {
      return NextResponse.json({ error: insertLinksError.message }, { status: 500 });
    }
  }

  const { error: deleteProjectsError } = await supabaseAdmin
    .from("profile_projects")
    .delete()
    .eq("user_id", userId);

  if (deleteProjectsError) {
    return NextResponse.json({ error: deleteProjectsError.message }, { status: 500 });
  }

  const allProjects = profile.projects
    .map((item, index) => ({
      user_id: userId,
      title: item.title.trim(),
      role: item.role.trim(),
      year: item.year.trim(),
      description: item.description.trim(),
      tags: item.tags,
      sort_order: index,
    }))
    .filter((item) => item.title && item.role && item.year);

  if (allProjects.length > 0) {
    const { error: insertProjectsError } = await supabaseAdmin
      .from("profile_projects")
      .insert(allProjects);

    if (insertProjectsError) {
      return NextResponse.json({ error: insertProjectsError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
