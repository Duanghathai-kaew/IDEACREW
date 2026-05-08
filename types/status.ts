export type StatusColor =
  | "gray"
  | "yellow"
  | "blue"
  | "green"
  | "red"
  | "purple"
  | "dark_gray";

export type CreatorProjectStatus =
  | "draft"
  | "pending_approval"
  | "rejected_by_admin"
  | "approved"
  | "open"
  | "reviewing"
  | "closed";

export type ApplicantApplicationStatus =
  | "pending"
  | "applied"
  | "in_review"
  | "rejected"
  | "accepted";

export type AdminProjectAction = "approve" | "reject";

export const CREATOR_PROJECT_STATUS_META: Record<
  CreatorProjectStatus,
  { label: string; color: StatusColor }
> = {
  draft: { label: "Draft", color: "gray" },
  pending_approval: { label: "Pending Approval", color: "yellow" },
  rejected_by_admin: { label: "Rejected by Admin", color: "red" },
  approved: { label: "Approved", color: "blue" },
  open: { label: "Open", color: "green" },
  reviewing: { label: "Reviewing", color: "purple" },
  closed: { label: "Closed", color: "dark_gray" },
};

export const APPLICANT_APPLICATION_STATUS_META: Record<
  ApplicantApplicationStatus,
  { label: string; color: StatusColor }
> = {
  pending: { label: "Pending", color: "yellow" },
  applied: { label: "Applied", color: "blue" },
  in_review: { label: "In Review", color: "yellow" },
  rejected: { label: "Rejected", color: "red" },
  accepted: { label: "Accepted", color: "green" },
};
