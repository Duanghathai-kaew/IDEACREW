export type WorkMode = "onsite" | "hybrid" | "online";

export type Benefit =
  | "certificate"
  | "experience"
  | "portfolio"
  | "compensation"
  | "network";

export type ProjectStatus = "draft" | "pending" | "approved" | "rejected";

export interface Project {
  id: string;
  title: string;
  categories: string[];
  summary: string;
  description: string;

  workMode: WorkMode;
  workingHours?: string;

  applicationStartDate: string;
  applicationEndDate: string;

  benefits: Benefit[];
  compensationDetail?: string;

  status: ProjectStatus;

  positions: Position[];

  createdBy: string;
  createdAt: string;
}

export interface Position {
  id: string;
  projectId: string;

  title: string;
  neededCount: number;

  skills: string[];
  basicQualifications: string[];

  preferredQualifications?: string;
}

// Form data interface (สำหรับฟอร์ม ไม่รวม id, createdBy, createdAt)
export interface ProjectFormData {
  title: string;
  categories: string[];
  summary: string;
  description: string;
  workMode: WorkMode;
  workingHours?: string;
  applicationStartDate: string;
  applicationEndDate: string;
  benefits: Benefit[];
  compensationDetail?: string;
  positions: Omit<Position, "id" | "projectId">[];
}
