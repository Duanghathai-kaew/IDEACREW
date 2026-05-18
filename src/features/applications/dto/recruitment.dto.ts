export type RecruitmentPosition = {
  id: string;
  title: string;
  neededCount: number;
  acceptedCount: number;
  requiredSkills: string[];
  isFull: boolean;
};

export type TeamMember = {
  userId: string;
  displayName: string;
  avatarUrl: string;
  positionTitle: string;
  acceptedAt: string;
};

export type AdminProjectPosition = {
  id: string;
  title: string;
  neededCount: number;
  acceptedCount: number;
  requiredSkills: string[];
  applicantCount: number;
  isFull: boolean;
};

export type AdminRecruitmentProgress = {
  totalPositions: number;
  filledPositions: number;
  totalNeeded: number;
  acceptedCount: number;
  completionRate: number;
};

export type AdminProject = {
  id: string;
  title: string;
  description: string;
  ownerName: string;
  ownerEmail: string;
  approvalStatus: "pending" | "approved" | "rejected";
  projectStatus: "open" | "closed";
  createdAt: string;
  applicationEndDate: string;
  applicantCount: number;
  positions: AdminProjectPosition[];
  recruitmentProgress: AdminRecruitmentProgress;
};
