import { supabaseAdminClient } from "@/lib/supabase/admin-client";

export async function fetchProjectsForFeed() {
  return Promise.all([
    supabaseAdminClient
      .from("projects")
      .select("id,title,description,status,owner_id")
      .in("status", ["open", "reviewing", "closed"])
      .order("created_at", { ascending: false }),
    supabaseAdminClient.from("profiles").select("id,name"),
    supabaseAdminClient
      .from("project_positions")
      .select("id,project_id,title,needed_count"),
    supabaseAdminClient
      .from("project_position_skills")
      .select("position_id,skill_name"),
    supabaseAdminClient.from("project_categories").select("project_id,category_name"),
  ]);
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
      .in("project_id", projectIds),
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
