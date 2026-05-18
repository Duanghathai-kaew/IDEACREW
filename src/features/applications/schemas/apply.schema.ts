import { z } from "zod";

export const applyProfilePrefillSchema = z.object({
  userId: z.string().min(1),
});

export const projectPositionsQuerySchema = z.object({
  projectId: z.string().min(1),
});

export const projectApplicationsQuerySchema = z.object({
  userId: z.string().min(1),
});

export const submitProjectApplicationSchema = z.object({
  projectId: z.string().min(1),
  userId: z.string().min(1),
  positionId: z.string().min(1),
  motivationMessage: z.string(),
  skills: z.array(z.string()),
  portfolioUrls: z.array(z.string()),
  additionalNote: z.string(),
});

export type SubmitProjectApplicationInput = z.infer<
  typeof submitProjectApplicationSchema
>;
