import { z } from "zod";

export const notificationsQuerySchema = z.object({
  userId: z.string().min(1),
});

export const deleteNotificationsQuerySchema = z.object({
  userId: z.string().min(1),
  category: z.enum(["my-project", "applied"]).optional(),
});

export const notificationIdParamsSchema = z.object({
  id: z.string().min(1),
});
