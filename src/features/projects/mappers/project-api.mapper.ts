import { MyProject } from "@/features/projects/services/my-project-mock-data";
import { SimpleProject } from "@/features/projects/services/simple-project-mock-data";
import { resolveProjectRecruitmentStatus } from "@/features/projects/utils/project-recruitment-status";

export function mapProjectFeedStatus(status: string | null): "open" | "closed" {
  return resolveProjectRecruitmentStatus(status);
}

export function mapMyProjectStatus(status: string | null): MyProject["status"] {
  switch (status) {
    case "draft":
    case "open":
    case "pending_approval":
    case "rejected_by_admin":
    case "approved":
    case "reviewing":
    case "closed":
      return status;
    default:
      return "draft";
  }
}

export function formatThaiDate(value: string | null): string {
  if (!value) return "ยังไม่กำหนด";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ยังไม่กำหนด";
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function toSimpleProjects(args: {
  projectRows: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    owner_id: string;
  }>;
  ownerNameById: Map<string, string>;
  positionsByProjectId: Map<
    string,
    { role: string; needed: number; skills: string[] }[]
  >;
  categoriesByProjectId: Map<string, string[]>;
}): SimpleProject[] {
  return args.projectRows.map((project) => ({
    id: project.id,
    title: project.title,
    org: args.ownerNameById.get(project.owner_id) ?? "Unknown Team",
    description: project.description ?? "",
    status: mapProjectFeedStatus(project.status),
    category: args.categoriesByProjectId.get(project.id) ?? [],
    positions: args.positionsByProjectId.get(project.id) ?? [],
  }));
}
