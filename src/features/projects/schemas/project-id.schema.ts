import { z } from "zod";

export const projectIdSchema = z.object({
  id: z.string().min(1),
});
