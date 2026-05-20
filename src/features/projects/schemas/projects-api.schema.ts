import type { ProjectFormData } from "@/features/projects/types/project.type";
import { z } from "zod";

const statusSchema = z.enum([
  "draft",
  "open",
  "pending_approval",
  "rejected_by_admin",
  "approved",
  "reviewing",
  "closed",
]);

const benefitSchema = z.enum([
  "certificate",
  "experience",
  "portfolio",
  "compensation",
  "network",
]);

const workModeSchema = z.enum(["onsite", "hybrid", "online"]);

const requiredTextSchema = (message: string) =>
  z.string().trim().min(1, message);

const optionalTextSchema = z.string().trim().default("");

const tagListSchema = (message: string) =>
  z.array(z.string()).superRefine((items, ctx) => {
    const normalizedItems = items.map((item) => item.trim());
    const hasEmptyItem = normalizedItems.some((item) => item.length === 0);
    if (hasEmptyItem) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
      return;
    }

    if (normalizedItems.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
      });
      return;
    }

    const seen = new Set<string>();
    const hasDuplicate = normalizedItems.some((item) => {
      const normalized = item.toLocaleLowerCase();
      if (seen.has(normalized)) return true;
      seen.add(normalized);
      return false;
    });

    if (hasDuplicate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ห้ามเพิ่มรายการซ้ำ",
      });
    }
  });

const positionInputSchema = z.object({
  title: requiredTextSchema("กรุณากรอกชื่อตำแหน่ง"),
  neededCount: z
    .number({ error: "กรุณาระบุจำนวนที่ต้องการ" })
    .int("จำนวนที่ต้องการต้องเป็นจำนวนเต็ม")
    .min(1, "กรุณาระบุจำนวนอย่างน้อย 1 คน"),
  skills: tagListSchema("กรุณาเพิ่มทักษะอย่างน้อย 1 รายการ"),
  basicQualifications: tagListSchema("กรุณาเพิ่มคุณสมบัติอย่างน้อย 1 รายการ"),
  preferredQualifications: optionalTextSchema,
});

export const projectFormDataSchema = z
  .object({
    title: requiredTextSchema("กรุณากรอกชื่อโปรเจกต์"),
    categories: tagListSchema("กรุณาเพิ่มหมวดหมู่อย่างน้อย 1 รายการ"),
    summary: requiredTextSchema("กรุณากรอกสรุปโปรเจกต์"),
    description: requiredTextSchema("กรุณากรอกรายละเอียดโปรเจกต์"),
    workMode: workModeSchema,
    workingHours: optionalTextSchema,
    applicationStartDate: requiredTextSchema("กรุณาเลือกวันเริ่มรับสมัคร"),
    applicationEndDate: requiredTextSchema("กรุณาเลือกวันปิดรับสมัคร"),
    benefits: z.array(benefitSchema),
    compensationDetail: optionalTextSchema,
    positions: z.array(positionInputSchema),
  })
  .superRefine((data, ctx) => {
    const startDate = new Date(data.applicationStartDate);
    const endDate = new Date(data.applicationEndDate);

    if (Number.isNaN(startDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "กรุณาเลือกวันเริ่มรับสมัครให้ถูกต้อง",
        path: ["applicationStartDate"],
      });
    }

    if (Number.isNaN(endDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "กรุณาเลือกวันปิดรับสมัครให้ถูกต้อง",
        path: ["applicationEndDate"],
      });
    }

    if (
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime())
    ) {
      if (endDate <= startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "วันปิดรับสมัครต้องอยู่หลังวันเริ่มรับสมัคร",
          path: ["applicationEndDate"],
        });
      }
    }

    if (data.benefits.includes("compensation") && !data.compensationDetail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "กรุณาระบุรายละเอียดค่าตอบแทน",
        path: ["compensationDetail"],
      });
    }
  });

export type ProjectFormSchema = z.infer<typeof projectFormDataSchema>;

export function normalizeProjectFormData(
  formData: ProjectFormData,
): ProjectFormData {
  const uniqueTrimmed = (items: string[]) => {
    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const item of items) {
      const trimmed = item.trim().replace(/\s+/g, " ");
      if (!trimmed) continue;

      const key = trimmed.toLocaleLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      normalized.push(trimmed);
    }

    return normalized;
  };

  return {
    ...formData,
    title: formData.title.trim().replace(/\s+/g, " "),
    summary: formData.summary.trim().replace(/\s+/g, " "),
    description: formData.description.trim().replace(/\s+/g, " "),
    workingHours: (formData.workingHours ?? "").trim().replace(/\s+/g, " "),
    applicationStartDate: formData.applicationStartDate.trim(),
    applicationEndDate: formData.applicationEndDate.trim(),
    compensationDetail: (formData.compensationDetail ?? "")
      .trim()
      .replace(/\s+/g, " "),
    categories: uniqueTrimmed(formData.categories),
    positions: formData.positions.map(
      (position: ProjectFormData["positions"][number]) => ({
        ...position,
        title: position.title.trim().replace(/\s+/g, " "),
        skills: uniqueTrimmed(position.skills),
        basicQualifications: uniqueTrimmed(position.basicQualifications),
        preferredQualifications: (position.preferredQualifications ?? "")
          .trim()
          .replace(/\s+/g, " "),
      }),
    ),
  };
}

export const projectsQuerySchema = z.object({});

export const createProjectBodySchema = z.object({
  ownerId: z.string().min(1),
  formData: projectFormDataSchema,
  status: statusSchema.optional(),
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
  title: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  status: statusSchema,
  applicationEndDate: z.string().trim().optional(),
  formData: projectFormDataSchema.optional(),
});
