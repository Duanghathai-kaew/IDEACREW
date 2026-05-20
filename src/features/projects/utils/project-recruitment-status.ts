export type ProjectRecruitmentStatus = "open" | "closed";

export function resolveProjectRecruitmentStatus(
  status: string | null | undefined,
): ProjectRecruitmentStatus {
  if (status === "open" || status === "reviewing" || status === "approved") {
    return "open";
  }

  return "closed";
}

export function getProjectRecruitmentStatusLabel(
  status: string | null | undefined,
): string {
  return resolveProjectRecruitmentStatus(status) === "open"
    ? "เปิดรับสมัคร"
    : "ปิดรับสมัครแล้ว";
}

export function getProjectRecruitmentStatusPillClass(
  status: string | null | undefined,
): string {
  return resolveProjectRecruitmentStatus(status) === "open"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-rose-100 text-rose-700";
}
