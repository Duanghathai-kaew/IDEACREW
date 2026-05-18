import { z } from "zod";

const benefitSchema = z.enum([
  "certificate",
  "experience",
  "portfolio",
  "compensation",
  "network",
]);

const workModeSchema = z.enum(["onsite", "hybrid", "online"]);

const positionInputSchema = z.object({
  title: z.string(),
  neededCount: z.number().int().min(1),
  skills: z.array(z.string()),
  basicQualifications: z.array(z.string()),
  preferredQualifications: z.string(),
});

export const projectFormDataSchema = z.object({
  title: z.string(),
  categories: z.array(z.string()),
  summary: z.string(),
  description: z.string(),
  workMode: workModeSchema,
  workingHours: z.string(),
  applicationStartDate: z.string(),
  applicationEndDate: z.string(),
  benefits: z.array(benefitSchema),
  compensationDetail: z.string(),
  positions: z.array(positionInputSchema),
});

export const projectsQuerySchema = z.object({});

export const createProjectBodySchema = z.object({
  ownerId: z.string().min(1),
  formData: projectFormDataSchema,
  status: z
    .enum([
      "draft",
      "open",
      "pending_approval",
      "rejected_by_admin",
      "approved",
      "reviewing",
      "closed",
    ])
    .optional(),
});

export const myProjectsQuerySchema = z.object({
  ownerId: z.string().min(1).optional(),
});

export const myProjectParamsSchema = z.object({
  id: z.string().min(1),
});

export const myProjectOwnerQuerySchema = z.object({
  ownerId: z.string().min(1),
});

export const updateMyProjectBodySchema = z.object({
  title: z.string().optional(),
  summary: z.string().optional(),
  status: z.enum([
    "draft",
    "open",
    "pending_approval",
    "rejected_by_admin",
    "approved",
    "reviewing",
    "closed",
  ]),
  applicationEndDate: z.string().optional(),
  formData: projectFormDataSchema.optional(),
});
