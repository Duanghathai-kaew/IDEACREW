import type { CompensationType } from "@/features/projects/types/compensation.type";
import { CreatorProjectStatus } from "@/types/status";

export type WorkMode = "onsite" | "hybrid" | "online";

export type Benefit =
  | "certificate"
  | "experience"
  | "portfolio"
  | "compensation"
  | "network";

export type ProjectStatus = CreatorProjectStatus;

export interface Project {
  id: string;
  ownerId?: string;
  title: string;
  categories: string[];
  summary: string;
  description: string;

  workMode: WorkMode;
  workingHours?: string;

  applicationStartDate: string;
  applicationEndDate: string;

  benefits: Benefit[];
  compensationEnabled?: boolean;
  compensationAmount?: number | null;
  compensationType?: CompensationType | null;
  compensationNote?: string;
  /** Legacy free-text or formatted preview for display */
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

export type { ProjectFormData } from "@/features/projects/schemas/projects-api.schema";
