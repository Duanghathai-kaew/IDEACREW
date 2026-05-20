import { Benefit, Project } from "@/features/projects/types/project.type";
import { resolveProjectRecruitmentStatus } from "@/features/projects/utils/project-recruitment-status";
import { supabaseAdminClient } from "@/lib/supabase/admin-client";
import { unstable_noStore as noStore } from "next/cache";

type DbProject = {
  id: string;
  owner_id: string;
  title: string;
  summary: string | null;
  description: string | null;
  work_mode: string | null;
  working_hours: string | null;
  application_start_date: string | null;
  application_end_date: string | null;
  benefits: string[] | null;
  compensation_detail: string | null;
  status: string | null;
  approval_status: string | null;
  created_at: string | null;
};

type DbProfile = { name: string | null };
type DbPosition = {
  id: string;
  project_id: string;
  title: string;
  needed_count: number;
  required_skills: string[] | null;
  preferred_qualifications: string | null;
};
type DbCategory = { category_name: string };
type DbBasicQualification = { position_id: string; qualification_text: string };
type DbPositionSkill = { position_id: string; skill_name: string };

const allowedBenefits: Benefit[] = [
  "certificate",
  "experience",
  "portfolio",
  "compensation",
  "network",
];

function mapBenefitArray(raw: string[] | null): Benefit[] {
  if (!raw) return [];
  return raw.filter((item): item is Benefit =>
    allowedBenefits.includes(item as Benefit),
  );
}

function mapProjectStatus(status: string | null): Project["status"] {
  return resolveProjectRecruitmentStatus(status);
}

function mapWorkMode(mode: string | null): Project["workMode"] {
  if (mode === "onsite" || mode === "hybrid" || mode === "online") return mode;
  return "online";
}

export async function getProjectDetail(id: string): Promise<Project | null> {
  noStore();

  const { data: project, error } = await supabaseAdminClient
    .from("projects")
    .select(
      "id,owner_id,title,summary,description,work_mode,working_hours,application_start_date,application_end_date,benefits,compensation_detail,status,approval_status,created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !project) return null;

  const projectRow = project as DbProject;
  if (projectRow.approval_status !== "approved") return null;

  const [{ data: profile }, { data: categories }, { data: positions }] =
    await Promise.all([
      supabaseAdminClient
        .from("profiles")
        .select("name")
        .eq("id", projectRow.owner_id)
        .maybeSingle(),
      supabaseAdminClient
        .from("project_categories")
        .select("category_name")
        .eq("project_id", id)
        .eq("status", "enabled")
        .eq("type", "category"),
      supabaseAdminClient
        .from("project_positions")
        .select(
          "id,project_id,title,needed_count,required_skills,preferred_qualifications",
        )
        .eq("project_id", id),
    ]);

  const { data: skillTags } = await supabaseAdminClient
    .from("project_categories")
    .select("category_name")
    .eq("project_id", id)
    .eq("status", "enabled")
    .eq("type", "skill");

  const positionRows = (positions as DbPosition[] | null) ?? [];

  const profileRow = (profile as DbProfile | null) ?? null;
  const positionIds = positionRows.map((position) => position.id);
  const [legacySkillsResult, qualificationResult] =
    positionIds.length === 0
      ? [{ data: [] }, { data: [] }]
      : await Promise.all([
          supabaseAdminClient
            .from("project_position_skills")
            .select("position_id,skill_name")
            .in("position_id", positionIds),
          supabaseAdminClient
            .from("project_position_basic_qualifications")
            .select("position_id,qualification_text")
            .in("position_id", positionIds),
        ]);

  const legacySkillRows = (legacySkillsResult.data ?? []) as DbPositionSkill[];
  const qualificationRows = (qualificationResult.data ??
    []) as DbBasicQualification[];

  const skillsByPosition = new Map<string, string[]>();
  const projectSkillTags = (
    (skillTags as Array<{ category_name: string }> | null) ?? []
  ).map((row) => row.category_name);
  for (const row of legacySkillRows) {
    const current = skillsByPosition.get(row.position_id) ?? [];
    current.push(row.skill_name);
    skillsByPosition.set(row.position_id, current);
  }

  const qualificationsByPosition = new Map<string, string[]>();
  for (const row of qualificationRows) {
    const current = qualificationsByPosition.get(row.position_id) ?? [];
    current.push(row.qualification_text);
    qualificationsByPosition.set(row.position_id, current);
  }

  return {
    id: projectRow.id,
    ownerId: projectRow.owner_id,
    title: projectRow.title,
    categories: ((categories as DbCategory[] | null) ?? []).map(
      (row) => row.category_name,
    ),
    summary: projectRow.summary ?? "",
    description: projectRow.description ?? "",
    workMode: mapWorkMode(projectRow.work_mode),
    workingHours: projectRow.working_hours ?? undefined,
    applicationStartDate: projectRow.application_start_date ?? "2025-01-01",
    applicationEndDate: projectRow.application_end_date ?? "2025-01-01",
    benefits: mapBenefitArray(projectRow.benefits),
    compensationDetail: projectRow.compensation_detail ?? "",
    status: mapProjectStatus(projectRow.status),
    positions: positionRows.map((position) => ({
      id: position.id,
      projectId: position.project_id,
      title: position.title,
      neededCount: position.needed_count,
      skills: Array.from(
        new Set([
          ...projectSkillTags,
          ...(position.required_skills ?? []),
          ...(skillsByPosition.get(position.id) ?? []),
        ]),
      ),
      basicQualifications: qualificationsByPosition.get(position.id) ?? [],
      preferredQualifications: position.preferred_qualifications ?? undefined,
    })),
    createdBy: profileRow?.name ?? "Unknown Team",
    createdAt: projectRow.created_at ?? new Date().toISOString(),
  };
}
