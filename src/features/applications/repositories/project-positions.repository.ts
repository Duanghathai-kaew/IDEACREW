import { supabaseAdminClient } from "@/lib/supabase/admin-client";

export function fetchActiveProjectPositions(projectId: string) {
  return supabaseAdminClient
    .from("project_positions")
    .select("id,title,required_skills,needed_count,accepted_count,is_active")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .order("title", { ascending: true });
}

export function fetchAcceptedApplicationsForPositions(projectId: string, positionIds: string[]) {
  return supabaseAdminClient
    .from("project_applications")
    .select("position_id,status")
    .eq("project_id", projectId)
    .eq("status", "accepted")
    .in("position_id", positionIds);
}

export function updateProjectPositionAcceptedCount(
  positionId: string,
  currentAcceptedCount: number,
  nextAcceptedCount: number,
) {
  return supabaseAdminClient
    .from("project_positions")
    .update({ accepted_count: nextAcceptedCount })
    .eq("id", positionId)
    .eq("accepted_count", currentAcceptedCount)
    .select("id")
    .maybeSingle();
}

export function updateProjectStatusClosed(projectId: string) {
  return supabaseAdminClient
    .from("projects")
    .update({
      status: "closed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);
}
