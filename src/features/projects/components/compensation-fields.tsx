"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { COMPENSATION_TYPE_OPTIONS } from "@/features/projects/types/compensation.type";
import type { ProjectFormData } from "@/features/projects/types/project.type";
import { formatCompensationPreview } from "@/features/projects/utils/compensation.utils";
import { useEffect } from "react";
import {
  useFormContext,
  useWatch,
  type FieldPath,
} from "react-hook-form";

function getFieldError(
  errors: Record<string, unknown>,
  path: string,
): string | undefined {
  const segments = path.split(".");
  let current: unknown = errors;
  for (const segment of segments) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  if (!current || typeof current !== "object") return undefined;
  const message = (current as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

export function CompensationFields({ show }: { show: boolean }) {
  const { register, formState, setValue, control } =
    useFormContext<ProjectFormData>();

  const compensationType = useWatch({ control, name: "compensationType" });
  const compensationAmount = useWatch({ control, name: "compensationAmount" });
  const requiresAmount = compensationType && compensationType !== "none";

  const preview = formatCompensationPreview(
    compensationAmount ?? null,
    compensationType ?? null,
  );

  useEffect(() => {
    if (!show) {
      setValue("compensationEnabled", false, { shouldValidate: true });
      setValue("compensationAmount", null, { shouldValidate: true });
      setValue("compensationType", null, { shouldValidate: true });
      setValue("compensationNote", "", { shouldValidate: true });
      setValue("compensationDetail", "", { shouldValidate: true });
      return;
    }
    setValue("compensationEnabled", true, { shouldValidate: true });
  }, [show, setValue]);

  useEffect(() => {
    if (compensationType === "none") {
      setValue("compensationAmount", null, { shouldValidate: true });
    }
  }, [compensationType, setValue]);

  if (!show) return null;

  const amountError = getFieldError(
    formState.errors as Record<string, unknown>,
    "compensationAmount",
  );
  const typeError = getFieldError(
    formState.errors as Record<string, unknown>,
    "compensationType",
  );
  const noteError = getFieldError(
    formState.errors as Record<string, unknown>,
    "compensationNote",
  );

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div>
        <label
          htmlFor="compensationType"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          ประเภทค่าตอบแทน <span className="text-rose-600">*</span>
        </label>
        <select
          id="compensationType"
          {...register("compensationType")}
          aria-invalid={Boolean(typeError)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800"
        >
          <option value="">เลือกประเภทค่าตอบแทน</option>
          {COMPENSATION_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {typeError && (
          <p className="mt-2 text-sm text-rose-600">{typeError}</p>
        )}
      </div>

      {requiresAmount && (
        <div>
          <label
            htmlFor="compensationAmount"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            จำนวนค่าตอบแทน <span className="text-rose-600">*</span>
          </label>
          <Input
            id="compensationAmount"
            type="number"
            inputMode="decimal"
            min={0}
            step={100}
            placeholder="เช่น 5000"
            {...register("compensationAmount" as FieldPath<ProjectFormData>, {
              setValueAs: (value) => {
                if (value === "" || value == null) return null;
                const parsed = Number(value);
                return Number.isNaN(parsed) ? null : parsed;
              },
            })}
            aria-invalid={Boolean(amountError)}
            className="h-11 rounded-xl bg-white"
          />
          {amountError && (
            <p className="mt-2 text-sm text-rose-600">{amountError}</p>
          )}
        </div>
      )}

      <div>
        <label
          htmlFor="compensationNote"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          รายละเอียดเพิ่มเติม{" "}
          <span className="text-slate-400">(ไม่บังคับ)</span>
        </label>
        <Textarea
          id="compensationNote"
          {...register("compensationNote")}
          placeholder="เช่น ต่อรองได้, มี incentive เพิ่ม, ค่าเดินทางรวมแล้ว"
          aria-invalid={Boolean(noteError)}
          className="min-h-24 rounded-xl bg-white"
        />
        {noteError && (
          <p className="mt-2 text-sm text-rose-600">{noteError}</p>
        )}
      </div>

      {preview && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs font-medium text-amber-800">ตัวอย่างที่แสดง</p>
          <p className="mt-1 text-sm font-semibold text-amber-900">{preview}</p>
        </div>
      )}
    </div>
  );
}
