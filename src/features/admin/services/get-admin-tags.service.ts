import { supabaseAdminClient } from "@/lib/supabase/admin-client";

export type AdminTag = {
  id: string;
  name: string;
  type: "skill" | "category";
  usageCount: number;
  status: "enabled" | "pending" | "rejected" | "disabled";
};

export async function getAdminTagsService() {
  const { data, error } = await supabaseAdminClient
    .from("project_categories")
    .select("id,project_id,category_name,type,status");

  if (error) {
    return { tags: [], error: error.message };
  }

  const rows = (data ?? []) as Array<{
    id: string;
    project_id: string;
    category_name: string;
    type: string | null;
    status: string | null;
  }>;

  type TagStatus = AdminTag["status"];
  const statusPriority: Record<TagStatus, number> = {
    pending: 0,
    rejected: 1,
    disabled: 2,
    enabled: 3,
  };

  function normalizeTag(value: string) {
    return value.trim();
  }

  function normalizeTagKey(value: string) {
    return normalizeTag(value).toLowerCase().replace(/\s+/g, " ");
  }

  const tagByKey = new Map<
    string,
    {
      name: string;
      type: "category" | "skill";
      status: TagStatus;
      usage: Set<string>;
    }
  >();

  for (const row of rows) {
    const name = normalizeTag(row.category_name);
    if (!name) continue;
    const type = row.type === "skill" ? "skill" : "category";
    const status =
      row.status === "enabled" ||
      row.status === "pending" ||
      row.status === "rejected" ||
      row.status === "disabled"
        ? row.status
        : "pending";
    const key = `${type}::${normalizeTagKey(name)}`;
    const existing = tagByKey.get(key);
    if (!existing) {
      tagByKey.set(key, {
        name,
        type,
        status,
        usage: new Set([row.project_id]),
      });
      continue;
    }
    existing.usage.add(row.project_id);
    if (statusPriority[status] < statusPriority[existing.status]) {
      existing.status = status;
    }
  }

  const tags: AdminTag[] = Array.from(tagByKey.values())
    .map((tag, index) => ({
      id: `${tag.type}-${index}-${tag.name}`,
      name: tag.name,
      type: tag.type,
      usageCount: tag.usage.size,
      status: tag.status,
    }))
    .sort(
      (a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name),
    );

  return { tags, error: null };
}
