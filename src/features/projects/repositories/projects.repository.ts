import { supabaseAdminClient } from "@/lib/supabase/admin-client";

export async function fetchProjectsForFeed() {
  const { data: projects, error } = await supabaseAdminClient
    .from("projects")
    .select("id,title,description,status,owner_id,approval_status")
    .eq("approval_status", "approved")
    .order("created_at", { ascending: false });

  const projectIds = (projects ?? []).map((project) => project.id);

  if (projectIds.length === 0) {
    return [
      { data: projects, error },
      { data: [], error: null },
      { data: [], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ] as const;
  }

  const [profilesRes, positionsRes, categoriesRes] = await Promise.all([
    supabaseAdminClient.from("profiles").select("id,name"),
    supabaseAdminClient
      .from("project_positions")
      .select("id,project_id,title,needed_count")
      .in("project_id", projectIds),
    supabaseAdminClient
      .from("project_categories")
      .select("project_id,category_name")
      .eq("status", "enabled")
      .eq("type", "category")
      .in("project_id", projectIds),
  ]);

  const positionIds = (positionsRes.data ?? []).map((position) => position.id);
  const positionSkillsRes =
    positionIds.length === 0
      ? { data: [], error: null }
      : await supabaseAdminClient
          .from("project_position_skills")
          .select("position_id,skill_name")
          .in("position_id", positionIds);

  return [
    { data: projects, error },
    profilesRes,
    positionsRes,
    positionSkillsRes,
    categoriesRes,
  ] as const;
}

export async function createProjectWithRelations(input: {
  ownerId: string;
  status: string;
  approvalStatus: "pending" | "approved";
  formData: unknown;
}) {
  return supabaseAdminClient.rpc("create_project_with_relations", {
    p_owner_id: input.ownerId,
    p_status: input.status,
    p_form_data: input.formData,
    p_approval_status: input.approvalStatus,
  });
}

export async function fetchMyProjects(ownerId?: string) {
  let query = supabaseAdminClient
    .from("projects")
    .select("id,title,summary,status,created_at,application_end_date,owner_id")
    .order("created_at", { ascending: false });

  if (ownerId) {
    query = query.eq("owner_id", ownerId);
  }

  return query;
}

export async function fetchMyProjectsMetadata(projectIds: string[]) {
  return Promise.all([
    supabaseAdminClient
      .from("project_categories")
      .select("project_id,category_name")
      .in("project_id", projectIds)
      .eq("type", "category"),
    supabaseAdminClient
      .from("project_positions")
      .select("project_id,title")
      .in("project_id", projectIds),
    supabaseAdminClient
      .from("project_applications")
      .select("project_id")
      .in("project_id", projectIds),
  ]);
}
