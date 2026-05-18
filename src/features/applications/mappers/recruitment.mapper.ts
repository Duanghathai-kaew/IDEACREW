import type {
  AdminProject,
  AdminProjectPosition,
  AdminRecruitmentProgress,
  RecruitmentPosition,
  TeamMember,
} from "@/features/applications/dto/recruitment.dto";

export function buildRecruitmentPositions(input: {
  positions: Array<{
    id: string;
    title: string;
    needed_count: number | null;
    accepted_count: number | null;
    required_skills: string[] | null;
    is_active: boolean | null;
  }>;
  acceptedCountByPositionId: Map<string, number>;
}): RecruitmentPosition[] {
  return input.positions.map((position) => {
    const neededCount = Math.max(1, position.needed_count ?? 1);
    const acceptedCount = input.acceptedCountByPositionId.get(position.id) ?? 0;

    return {
      id: position.id,
      title: position.title,
      neededCount,
      acceptedCount,
      requiredSkills: position.required_skills ?? [],
      isFull: acceptedCount >= neededCount,
    };
  });
}

export function buildTeamMembers(input: {
  members: Array<{
    user_id: string;
    position_id: string | null;
    created_at: string | null;
    project_positions: Array<{ title: string }> | null;
  }>;
  profileById: Map<
    string,
    {
      id: string;
      displayname: string | null;
      name: string | null;
      username: string | null;
      avatar_url: string | null;
    }
  >;
}): TeamMember[] {
  return input.members.map((member) => {
    const profile = input.profileById.get(member.user_id);
    const positionArray = member.project_positions as Array<{
      title: string;
    }> | null;

    return {
      userId: member.user_id,
      displayName:
        profile?.displayname?.trim() ||
        profile?.name?.trim() ||
        profile?.username?.trim() ||
        "Team Member",
      avatarUrl: profile?.avatar_url ?? "",
      positionTitle: positionArray?.[0]?.title ?? "Member",
      acceptedAt: member.created_at ?? "",
    };
  });
}

export function mapProjectLifecycleStatus(
  status: string | null,
): "open" | "closed" {
  return status === "closed" ? "closed" : "open";
}

export function mapApprovalStatus(
  approvalStatus: string | null,
  projectStatus: string | null,
): "pending" | "approved" | "rejected" {
  if (
    approvalStatus === "pending" ||
    approvalStatus === "approved" ||
    approvalStatus === "rejected"
  ) {
    return approvalStatus;
  }

  if (projectStatus === "pending_approval") return "pending";
  if (projectStatus === "rejected_by_admin") return "rejected";
  return "approved";
}

export function buildAdminRecruitmentProgress(
  positions: AdminProjectPosition[],
): AdminRecruitmentProgress {
  const totalPositions = positions.length;
  const filledPositions = positions.filter(
    (position) => position.isFull,
  ).length;
  const totalNeeded = positions.reduce(
    (sum, position) => sum + position.neededCount,
    0,
  );
  const acceptedCount = positions.reduce(
    (sum, position) => sum + position.acceptedCount,
    0,
  );
  const completionRate =
    totalNeeded > 0
      ? Math.min(100, Math.round((acceptedCount / totalNeeded) * 100))
      : 0;

  return {
    totalPositions,
    filledPositions,
    totalNeeded,
    acceptedCount,
    completionRate,
  };
}

export function buildAdminProject(input: {
  id: string;
  title: string;
  description: string | null;
  ownerName: string;
  ownerEmail: string;
  approvalStatus: string | null;
  projectStatus: string | null;
  createdAt: string | null;
  applicationEndDate: string | null;
  applicantCount: number;
  positions: AdminProjectPosition[];
}): AdminProject {
  return {
    id: input.id,
    title: input.title,
    description: input.description ?? "",
    ownerName: input.ownerName,
    ownerEmail: input.ownerEmail,
    approvalStatus: mapApprovalStatus(
      input.approvalStatus,
      input.projectStatus,
    ),
    projectStatus: mapProjectLifecycleStatus(input.projectStatus),
    createdAt: input.createdAt ?? "",
    applicationEndDate: input.applicationEndDate ?? "",
    applicantCount: input.applicantCount,
    positions: input.positions,
    recruitmentProgress: buildAdminRecruitmentProgress(input.positions),
  };
}
