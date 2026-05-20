import { unstable_noStore as noStore } from "next/cache";

import type {
  ProjectFilterOption,
  ProjectFilterOptions,
} from "@/features/projects/types/filter-options.type";
import { supabaseAdminClient } from "@/lib/supabase/admin-client";

function normalizeFilterValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildFilterKey(type: "skill" | "category", label: string) {
  return `${type}::${normalizeFilterValue(label)}`;
}

export async function getPublicProjectFilterOptionsService() {
  noStore();

  const { data: approvedProjects, error: projectsError } =
    await supabaseAdminClient
      .from("projects")
      .select("id")
      .eq("approval_status", "approved");

  if (projectsError) {
    return {
      options: { skills: [], categories: [] } satisfies ProjectFilterOptions,
      error: projectsError.message,
    };
  }

  const approvedProjectIds = (approvedProjects ?? []).map(
    (project) => project.id,
  );

  if (approvedProjectIds.length === 0) {
    return {
      options: { skills: [], categories: [] } satisfies ProjectFilterOptions,
      error: null,
    };
  }

  const [positionRowsRes, categoryRowsRes, skillTagRowsRes] = await Promise.all(
    [
      supabaseAdminClient
        .from("project_positions")
        .select("id,project_id,required_skills")
        .in("project_id", approvedProjectIds),
      supabaseAdminClient
        .from("project_categories")
        .select("category_name,project_id")
        .eq("status", "enabled")
        .eq("type", "category")
        .in("project_id", approvedProjectIds),
      supabaseAdminClient
        .from("project_categories")
        .select("category_name,project_id")
        .eq("status", "enabled")
        .eq("type", "skill")
        .in("project_id", approvedProjectIds),
    ],
  );

  if (positionRowsRes.error) {
    return {
      options: { skills: [], categories: [] } satisfies ProjectFilterOptions,
      error: positionRowsRes.error.message,
    };
  }

  if (categoryRowsRes.error) {
    return {
      options: { skills: [], categories: [] } satisfies ProjectFilterOptions,
      error: categoryRowsRes.error.message,
    };
  }

  if (skillTagRowsRes.error) {
    return {
      options: { skills: [], categories: [] } satisfies ProjectFilterOptions,
      error: skillTagRowsRes.error.message,
    };
  }

  const positionRows = (positionRowsRes.data ?? []) as Array<{
    id: string;
    project_id: string;
    required_skills: string[] | null;
  }>;

  const legacySkillRowsRes =
    positionRows.length === 0
      ? { data: [], error: null }
      : await supabaseAdminClient
          .from("project_position_skills")
          .select("position_id,skill_name")
          .in(
            "position_id",
            positionRows.map((position) => position.id),
          );

  if (legacySkillRowsRes.error) {
    return {
      options: { skills: [], categories: [] } satisfies ProjectFilterOptions,
      error: legacySkillRowsRes.error.message,
    };
  }

  const optionByKey = new Map<
    string,
    { label: string; type: "skill" | "category"; projectIds: Set<string> }
  >();

  for (const row of (positionRowsRes.data ?? []) as Array<{
    project_id: string;
    required_skills: string[] | null;
  }>) {
    for (const skill of row.required_skills ?? []) {
      const label = skill.trim();
      if (!label) continue;

      const key = buildFilterKey("skill", label);
      const existing = optionByKey.get(key);

      if (!existing) {
        optionByKey.set(key, {
          label,
          type: "skill",
          projectIds: new Set([row.project_id]),
        });
        continue;
      }

      existing.projectIds.add(row.project_id);
    }
  }

  const projectIdByPositionId = new Map(
    positionRows.map((position) => [position.id, position.project_id]),
  );

  for (const row of (legacySkillRowsRes.data ?? []) as Array<{
    position_id: string;
    skill_name: string;
  }>) {
    const label = row.skill_name.trim();
    const projectId = projectIdByPositionId.get(row.position_id);
    if (!label || !projectId) continue;

    const key = buildFilterKey("skill", label);
    const existing = optionByKey.get(key);

    if (!existing) {
      optionByKey.set(key, {
        label,
        type: "skill",
        projectIds: new Set([projectId]),
      });
      continue;
    }

    existing.projectIds.add(projectId);
  }

  for (const row of (categoryRowsRes.data ?? []) as Array<{
    category_name: string;
    project_id: string;
  }>) {
    const label = row.category_name.trim();
    if (!label) continue;

    const key = buildFilterKey("category", label);
    const existing = optionByKey.get(key);

    if (!existing) {
      optionByKey.set(key, {
        label,
        type: "category",
        projectIds: new Set([row.project_id]),
      });
      continue;
    }

    existing.projectIds.add(row.project_id);
  }

  for (const row of (skillTagRowsRes.data ?? []) as Array<{
    category_name: string;
    project_id: string;
  }>) {
    const label = row.category_name.trim();
    if (!label) continue;

    const key = buildFilterKey("skill", label);
    const existing = optionByKey.get(key);

    if (!existing) {
      optionByKey.set(key, {
        label,
        type: "skill",
        projectIds: new Set([row.project_id]),
      });
      continue;
    }

    existing.projectIds.add(row.project_id);
  }

  const toOptions = (type: "skill" | "category"): ProjectFilterOption[] =>
    Array.from(optionByKey.entries())
      .filter(([, option]) => option.type === type)
      .map(([key, option]) => ({
        key,
        label: option.label,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

  return {
    options: {
      skills: toOptions("skill"),
      categories: toOptions("category"),
    },
    error: null,
  };
}
