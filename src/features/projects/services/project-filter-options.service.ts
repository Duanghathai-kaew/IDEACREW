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

  const { data, error } = await supabaseAdminClient
    .from("project_categories")
    .select("category_name,type,status,project_id")
    .eq("status", "enabled")
    .in("type", ["skill", "category"])
    .in("project_id", approvedProjectIds);

  if (error) {
    return {
      options: { skills: [], categories: [] } satisfies ProjectFilterOptions,
      error: error.message,
    };
  }

  const optionByKey = new Map<
    string,
    { label: string; type: "skill" | "category"; projectIds: Set<string> }
  >();

  for (const row of (data ?? []) as Array<{
    category_name: string;
    type: string | null;
    status: string | null;
    project_id: string;
  }>) {
    const label = row.category_name.trim();
    if (!label) continue;

    const type = row.type === "skill" ? "skill" : "category";
    const key = buildFilterKey(type, label);
    const existing = optionByKey.get(key);

    if (!existing) {
      optionByKey.set(key, {
        label,
        type,
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
