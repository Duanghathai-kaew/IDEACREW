import type { ActionResult } from "@/features/applications/dto/application.dto";
import type { TeamMember } from "@/features/applications/dto/recruitment.dto";
import { buildTeamMembers } from "@/features/applications/mappers/recruitment.mapper";
import {
  fetchProfilesByIds,
  fetchProjectMembers,
} from "@/features/applications/repositories/project-members.repository";

export async function getProjectTeamMembers(
  projectId: string,
): Promise<ActionResult<TeamMember[]>> {
  const { data: members, error } = await fetchProjectMembers(projectId);
  if (error) {
    return { ok: false, error: error.message };
  }

  const memberRows = (members ?? []) as Array<{
    user_id: string;
    position_id: string | null;
    created_at: string | null;
    project_positions: Array<{ title: string }> | null;
  }>;

  if (memberRows.length === 0) return { ok: true, data: [] };

  const applicantIds = Array.from(
    new Set(memberRows.map((member) => member.user_id)),
  );
  const { data: profiles, error: profileError } =
    await fetchProfilesByIds(applicantIds);
  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  const profileById = new Map(
    (
      (profiles ?? []) as Array<{
        id: string;
        displayname: string | null;
        name: string | null;
        username: string | null;
        avatar_url: string | null;
      }>
    ).map((profile) => [profile.id, profile]),
  );

  return {
    ok: true,
    data: buildTeamMembers({ members: memberRows, profileById }),
  };
}
