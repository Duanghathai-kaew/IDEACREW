import { supabaseAdminClient } from "@/lib/supabase/admin-client";

export function fetchProjectMembers(projectId: string) {
  return supabaseAdminClient
    .from("project_members")
    .select("user_id,position_id,created_at,project_positions(title)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
}

export function fetchProjectMember(projectId: string, userId: string) {
  return supabaseAdminClient
    .from("project_members")
    .select("user_id")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();
}

export function insertProjectMember(payload: {
  project_id: string;
  user_id: string;
  position_id: string | null;
  role: string;
}) {
  return supabaseAdminClient.from("project_members").insert(payload);
}

export function deleteProjectMember(projectId: string, userId: string) {
  return supabaseAdminClient
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);
}

export function fetchProfilesByIds(profileIds: string[]) {
  return supabaseAdminClient
    .from("profiles")
    .select("id,displayname,name,username,avatar_url,skills,email")
    .in("id", profileIds);
}
