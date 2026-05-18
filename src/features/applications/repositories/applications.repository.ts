import { supabaseAdminClient } from "@/lib/supabase/admin-client";

export function fetchApplyProfilePrefillData(userId: string) {
  return Promise.all([
    supabaseAdminClient
      .from("profiles")
      .select("skills,bio")
      .eq("id", userId)
      .maybeSingle(),
    supabaseAdminClient
      .from("profile_links")
      .select("url")
      .eq("user_id", userId)
      .eq("link_type", "portfolio")
      .order("sort_order", { ascending: true }),
  ]);
}

export function fetchProjectById(projectId: string) {
  return supabaseAdminClient
    .from("projects")
    .select("id,owner_id,status,title")
    .eq("id", projectId)
    .maybeSingle();
}

export function fetchProjectPositionForApplication(projectId: string, positionId: string) {
  return supabaseAdminClient
    .from("project_positions")
    .select("id,needed_count,accepted_count,is_active")
    .eq("id", positionId)
    .eq("project_id", projectId)
    .maybeSingle();
}

export function countAcceptedApplicationsForPosition(projectId: string, positionId: string) {
  return supabaseAdminClient
    .from("project_applications")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("position_id", positionId)
    .eq("status", "accepted");
}

export function fetchExistingApplicationForApplicant(projectId: string, userId: string) {
  return supabaseAdminClient
    .from("project_applications")
    .select("id,status")
    .eq("project_id", projectId)
    .eq("applicant_id", userId)
    .maybeSingle();
}

export function insertProjectApplication(payload: Record<string, unknown>) {
  return supabaseAdminClient
    .from("project_applications")
    .insert(payload)
    .select("id")
    .single();
}

export function updateProjectApplication(id: string, payload: Record<string, unknown>) {
  return supabaseAdminClient
    .from("project_applications")
    .update(payload)
    .eq("id", id)
    .select("id")
    .single();
}

export function updatePendingProjectApplication(
  id: string,
  payload: Record<string, unknown>,
) {
  return supabaseAdminClient
    .from("project_applications")
    .update(payload)
    .eq("id", id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
}

export function fetchProjectApplicationsByApplicant(userId: string) {
  return supabaseAdminClient
    .from("project_applications")
    .select("id,project_id,status,rejection_reason,created_at")
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });
}

export function fetchProjectsByIds(projectIds: string[]) {
  return supabaseAdminClient
    .from("projects")
    .select("id,title,owner_id")
    .in("id", projectIds);
}

export function fetchProjectOwnersByIds(ownerIds: string[]) {
  return supabaseAdminClient
    .from("profiles")
    .select("id,displayname,name,username,email")
    .in("id", ownerIds);
}

export function fetchProjectOwnerContacts(ownerIds: string[]) {
  return supabaseAdminClient
    .from("profile_links")
    .select("user_id,url")
    .eq("link_type", "social")
    .in("user_id", ownerIds)
    .order("sort_order", { ascending: true });
}

export function fetchProjectApplicants(projectId: string) {
  return supabaseAdminClient
    .from("project_applications")
    .select(
      "id,applicant_id,position_id,status,motivation_message,skills,portfolio_urls,additional_note,created_at,project_positions(title,needed_count,accepted_count,required_skills)",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
}

export function fetchProjectApplicantsFallback(projectId: string) {
  return supabaseAdminClient
    .from("project_applications")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
}

export function fetchProjectApplicationForOwner(applicationId: string) {
  return supabaseAdminClient
    .from("project_applications")
    .select("id,project_id,applicant_id,position_id,projects!inner(owner_id)")
    .eq("id", applicationId)
    .maybeSingle();
}

export function fetchProjectByOwner(projectId: string, ownerId: string) {
  return supabaseAdminClient
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .maybeSingle();
}

export function fetchAdminProjects() {
  return supabaseAdminClient
    .from("projects")
    .select(
      "id,title,description,owner_id,approval_status,status,created_at,application_end_date",
    )
    .order("created_at", { ascending: false });
}

export function fetchAdminProjectOwners(ownerIds: string[]) {
  return supabaseAdminClient
    .from("profiles")
    .select("id,displayname,name,email")
    .in("id", ownerIds);
}

export function fetchAdminProjectPositions(projectIds: string[]) {
  return supabaseAdminClient
    .from("project_positions")
    .select("id,project_id,title,needed_count,accepted_count,required_skills")
    .in("project_id", projectIds);
}

export function fetchAdminProjectApplications(projectIds: string[]) {
  return supabaseAdminClient
    .from("project_applications")
    .select("project_id,position_id")
    .in("project_id", projectIds);
}
