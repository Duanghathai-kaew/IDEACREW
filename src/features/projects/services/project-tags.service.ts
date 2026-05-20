import type { ProjectFormData } from "@/features/projects/types/project.type";
import { supabaseAdminClient } from "@/lib/supabase/admin-client";

const TAG_TYPES = ["category", "skill"] as const;

type TagType = (typeof TAG_TYPES)[number];

type TagStatus = "enabled" | "pending";

type TagInput = { name: string; type: TagType };

type EnabledTagRow = { category_name: string; type: string | null };

function normalizeTag(value: string) {
  return value.trim();
}

function normalizeTagKey(value: string) {
  return normalizeTag(value).toLowerCase().replace(/\s+/g, " ");
}

function buildTagInputs(formData: ProjectFormData): TagInput[] {
  const categories = new Map<string, string>();
  for (const value of formData.categories) {
    const name = normalizeTag(value);
    if (!name) continue;
    const key = normalizeTagKey(name);
    if (!categories.has(key)) {
      categories.set(key, name);
    }
  }

  const skills = new Map<string, string>();
  for (const value of formData.positions.flatMap(
    (position) => position.skills,
  )) {
    const name = normalizeTag(value);
    if (!name) continue;
    const key = normalizeTagKey(name);
    if (!skills.has(key)) {
      skills.set(key, name);
    }
  }

  return [
    ...Array.from(categories.values()).map((name) => ({
      name,
      type: "category" as const,
    })),
    ...Array.from(skills.values()).map((name) => ({
      name,
      type: "skill" as const,
    })),
  ];
}

function toKey(input: {
  name?: string;
  category_name?: string;
  type?: string | null;
}) {
  const type = input.type === "skill" ? "skill" : "category";
  const name = normalizeTag(input.category_name ?? input.name ?? "");
  return `${type}::${normalizeTagKey(name)}`;
}

export async function syncProjectCategoriesForProject(input: {
  projectId: string;
  formData: ProjectFormData;
}) {
  const tagInputs = buildTagInputs(input.formData);

  const { error: deleteError } = await supabaseAdminClient
    .from("project_categories")
    .delete()
    .eq("project_id", input.projectId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (tagInputs.length === 0) return;

  const uniqueNames = Array.from(new Set(tagInputs.map((tag) => tag.name)));

  const { data: enabledRows, error: enabledError } = await supabaseAdminClient
    .from("project_categories")
    .select("category_name,type")
    .in("category_name", uniqueNames)
    .in("type", TAG_TYPES)
    .eq("status", "enabled");

  if (enabledError) {
    throw new Error(enabledError.message);
  }

  const enabledKeys = new Set(
    ((enabledRows ?? []) as EnabledTagRow[]).map(toKey),
  );

  const rows = tagInputs.map((tag) => {
    const status: TagStatus = enabledKeys.has(toKey(tag))
      ? "enabled"
      : "pending";
    return {
      project_id: input.projectId,
      category_name: tag.name,
      type: tag.type,
      status,
    };
  });

  const { error: insertError } = await supabaseAdminClient
    .from("project_categories")
    .insert(rows);

  if (insertError) {
    throw new Error(insertError.message);
  }
}

export async function enableSelectedTags(input: {
  projectId: string;
  selectedTagIds: string[];
}) {
  if (input.selectedTagIds.length === 0) return;

  const { error } = await supabaseAdminClient
    .from("project_categories")
    .update({ status: "enabled" })
    .eq("project_id", input.projectId)
    .eq("status", "pending")
    .in("id", input.selectedTagIds);

  if (error) {
    throw new Error(error.message);
  }
}
