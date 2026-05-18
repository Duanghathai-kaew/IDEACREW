import { z } from "zod";

export const projectApplicantsQuerySchema = z.object({
  projectId: z.string().min(1),
  ownerId: z.string().min(1),
});

export const acceptApplicationSchema = z.object({
  applicationId: z.string().min(1),
  ownerId: z.string().min(1),
});

export const rejectApplicationSchema = z.object({
  applicationId: z.string().min(1),
  ownerId: z.string().min(1),
  rejectionReason: z.string(),
});

export type AcceptApplicationInput = z.infer<typeof acceptApplicationSchema>;
export type RejectApplicationInput = z.infer<typeof rejectApplicationSchema>;
