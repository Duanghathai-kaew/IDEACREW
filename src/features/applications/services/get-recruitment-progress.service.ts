import type { ActionResult } from "@/features/applications/dto/application.dto";
import type { RecruitmentPosition } from "@/features/applications/dto/recruitment.dto";
import { buildRecruitmentPositions } from "@/features/applications/mappers/recruitment.mapper";
import {
  fetchAcceptedApplicationsForPositions,
  fetchActiveProjectPositions,
} from "@/features/applications/repositories/project-positions.repository";

export async function getProjectRecruitmentProgress(
  projectId: string,
): Promise<ActionResult<RecruitmentPosition[]>> {
  const { data, error } = await fetchActiveProjectPositions(projectId);
  if (error) {
    return { ok: false, error: error.message };
  }

  const positions = (data ?? []) as Array<{
    id: string;
    title: string;
    needed_count: number | null;
    accepted_count: number | null;
    required_skills: string[] | null;
    is_active: boolean | null;
  }>;

  const positionIds = positions.map((position) => position.id);
  const acceptedCountByPositionId = new Map<string, number>();

  if (positionIds.length > 0) {
    const { data: acceptedApps, error: acceptedAppsError } =
      await fetchAcceptedApplicationsForPositions(projectId, positionIds);
    if (acceptedAppsError) {
      return { ok: false, error: acceptedAppsError.message };
    }

    for (const row of (acceptedApps ?? []) as Array<{
      position_id: string | null;
      status: string | null;
    }>) {
      if (!row.position_id) continue;
      acceptedCountByPositionId.set(
        row.position_id,
        (acceptedCountByPositionId.get(row.position_id) ?? 0) + 1,
      );
    }
  }

  return {
    ok: true,
    data: buildRecruitmentPositions({
      positions,
      acceptedCountByPositionId,
    }),
  };
}
