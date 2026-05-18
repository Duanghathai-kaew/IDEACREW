import { z } from "zod";

export const projectIdSchema = z.object({
  projectId: z.string().min(1),
});

export const adminProjectsQuerySchema = z.object({});
