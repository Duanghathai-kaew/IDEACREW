export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export type ApplyProfilePrefill = {
  skills: string[];
  portfolioUrls: string[];
  bio: string;
};

export type ApplicantCard = {
  id: string;
  applicantId: string;
  positionId: string | null;
  positionTitle: string | null;
  positionNeededCount: number | null;
  positionAcceptedCount: number | null;
  positionRequiredSkills: string[] | null;
  displayName: string;
  avatarUrl: string;
  skills: string[];
  portfolioUrls: string[];
  motivationMessage: string;
  additionalNote: string;
  appliedAt: string;
  status: ApplicationStatus;
};

export type ProjectPositionOption = {
  id: string;
  title: string;
  neededCount: number;
  acceptedCount: number;
  requiredSkills: string[];
  isActive: boolean;
  isFull: boolean;
};

export type AppliedProjectCard = {
  id: string;
  projectId: string;
  projectTitle: string;
  ownerName: string;
  ownerEmail: string;
  ownerContactLink: string;
  appliedAt: string;
  status: ApplicationStatus;
  rejectionReason: string;
};
