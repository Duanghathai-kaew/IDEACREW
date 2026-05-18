import { supabaseAdminClient } from "@/lib/supabase/admin-client";

export type AdminTag = {
  id: string;
  name: string;
  type: "skill" | "category";
  usageCount: number;
  status: "enabled" | "disabled";
};

export async function getAdminTagsService() {
  const [categoriesRes, skillsRes] = await Promise.all([
    supabaseAdminClient.from("project_categories").select("category_name"),
    supabaseAdminClient.from("project_position_skills").select("skill_name"),
  ]);

  const categoryCounts = new Map<string, number>();
  for (const row of (categoriesRes.data ?? []) as Array<{ category_name: string }>) {
    const name = row.category_name.trim();
    if (!name) continue;
    categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
  }

  const skillCounts = new Map<string, number>();
  for (const row of (skillsRes.data ?? []) as Array<{ skill_name: string }>) {
    const name = row.skill_name.trim();
    if (!name) continue;
    skillCounts.set(name, (skillCounts.get(name) ?? 0) + 1);
  }

  const tags: AdminTag[] = [
    ...Array.from(categoryCounts.entries()).map(([name, usageCount], index) => ({
      id: `category-${index}-${name}`,
      name,
      type: "category" as const,
      usageCount,
      status: usageCount > 0 ? ("enabled" as const) : ("disabled" as const),
    })),
    ...Array.from(skillCounts.entries()).map(([name, usageCount], index) => ({
      id: `skill-${index}-${name}`,
      name,
      type: "skill" as const,
      usageCount,
      status: usageCount > 0 ? ("enabled" as const) : ("disabled" as const),
    })),
  ].sort((a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name));

  return {
    tags,
    error: categoriesRes.error?.message || skillsRes.error?.message || null,
  };
}
