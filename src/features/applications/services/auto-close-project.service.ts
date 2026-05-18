import { fetchAcceptedApplicationsForPositions, fetchActiveProjectPositions, updateProjectStatusClosed } from "@/features/applications/repositories/project-positions.repository";

export async function autoCloseProjectIfRecruitmentComplete(projectId: string) {
  try {
    const { data: positions, error } = await fetchActiveProjectPositions(projectId);
    if (error) {
      return;
    }

    const positionRows = (positions ?? []) as Array<{
      id: string;
      needed_count: number | null;
      is_active: boolean | null;
    }>;

    const positionIds = positionRows.map((position) => position.id);
    const acceptedCountByPositionId = new Map<string, number>();
    if (positionIds.length > 0) {
      const { data: acceptedApps, error: acceptedAppsError } =
        await fetchAcceptedApplicationsForPositions(projectId, positionIds);

      if (acceptedAppsError) {
        return;
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

    const allPositionsFull = positionRows.every((position) => {
      const neededCount = Math.max(1, position.needed_count ?? 1);
      const acceptedCount = acceptedCountByPositionId.get(position.id) ?? 0;
      return acceptedCount >= neededCount;
    });

    if (allPositionsFull && positionRows.length > 0) {
      await updateProjectStatusClosed(projectId);
    }
  } catch {
    return;
  }
}
