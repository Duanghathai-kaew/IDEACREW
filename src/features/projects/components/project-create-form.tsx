"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  normalizeProjectFormData,
  projectFormDataSchema,
} from "@/features/projects/schemas/projects-api.schema";
import type {
  Benefit,
  ProjectFormData,
  WorkMode,
} from "@/features/projects/types/project.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
  type FieldErrors,
  type FieldPath,
} from "react-hook-form";

const categoryOptions = [
  "E-Sport",
  "พัฒนาเว็บไซต์",
  "งานอีเวนต์",
  "การศึกษา",
  "ธุรกิจ",
  "อื่นๆ",
];

const workModes: { value: WorkMode; label: string; description: string }[] = [
  {
    value: "onsite",
    label: "ทำงานที่สถานที่",
    description: "เหมาะกับทีมที่นัดพบกันได้",
  },
  {
    value: "hybrid",
    label: "ผสมผสาน",
    description: "บางวันเข้าทีม บางวันทำงานระยะไกล",
  },
  {
    value: "online",
    label: "ทำงานออนไลน์",
    description: "ทำงานร่วมกันได้จากทุกที่",
  },
];

const benefitOptions: { value: Benefit; label: string }[] = [
  { value: "certificate", label: "ใบประกาศนียบัตร" },
  { value: "experience", label: "ประสบการณ์" },
  { value: "portfolio", label: "ผลงานใส่ Portfolio" },
  { value: "compensation", label: "ค่าตอบแทน" },
  { value: "network", label: "เครือข่าย/Networking" },
];

interface ProjectCreateFormProps {
  initialValues: ProjectFormData;
  isBusy: boolean;
  submitError: string | null;
  submitSuccess: string | null;
  onSaveDraft: (formData: ProjectFormData) => Promise<void>;
  onSubmitProject: (formData: ProjectFormData) => Promise<void>;
}

function getFieldError(
  errors: FieldErrors<ProjectFormData>,
  path: FieldPath<ProjectFormData> | string,
) {
  const segments = String(path).split(".");
  let current: unknown = errors;

  for (const segment of segments) {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  if (!current || typeof current !== "object") {
    return undefined;
  }

  const message = (
    current as { message?: unknown; root?: { message?: unknown } }
  ).message;
  if (typeof message === "string") {
    return message;
  }

  const rootMessage = (current as { root?: { message?: unknown } }).root
    ?.message;
  return typeof rootMessage === "string" ? rootMessage : undefined;
}

function FormSectionTitle({
  title,
  description,
  required = false,
}: {
  title: string;
  description?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-slate-800">
        {title} {required && <span className="text-rose-600">*</span>}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-2 text-sm text-rose-600">{message}</p>;
}

function RequiredLabel({ children }: { children: string }) {
  return (
    <span className="text-sm font-medium text-slate-700">
      {children} <span className="text-rose-600">*</span>
    </span>
  );
}

function TagInputField({
  name,
  label,
  placeholder,
  helperText,
  required = false,
  suggestions,
}: {
  name: FieldPath<ProjectFormData>;
  label: string;
  placeholder: string;
  helperText?: string;
  required?: boolean;
  suggestions?: string[];
}) {
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const [draft, setDraft] = useState("");
  const { control, formState, setValue } = useFormContext<ProjectFormData>();
  const items = (useWatch({ control, name }) as string[] | undefined) ?? [];
  const errorMessage = getFieldError(formState.errors, name);

  function normalizeValue(value: string) {
    return value.trim().replace(/\s+/g, " ");
  }

  function addItem(nextValue?: string) {
    const normalized = normalizeValue(nextValue ?? draft);
    if (!normalized) return;

    const exists = items.some(
      (item) =>
        item.trim().toLocaleLowerCase() === normalized.toLocaleLowerCase(),
    );
    if (exists) {
      setDraft("");
      return;
    }

    setValue(name, [...items, normalized], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setDraft("");
  }

  function removeItem(index: number) {
    setValue(
      name,
      items.filter((_, itemIndex) => itemIndex !== index),
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      },
    );
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block">
        {required ? (
          <RequiredLabel>{label}</RequiredLabel>
        ) : (
          <span className="text-sm font-medium text-slate-700">{label}</span>
        )}
      </label>
      {helperText && (
        <p id={helperId} className="mb-3 text-xs text-slate-500">
          {helperText}
        </p>
      )}

      <div className="space-y-3">
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-slate-700 transition-all duration-200 hover:border-amber-300 hover:bg-amber-100"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-800"
                  aria-label={`ลบ ${item}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={inputId}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              addItem();
            }}
            placeholder={placeholder}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={
              errorMessage ? errorId : helperText ? helperId : undefined
            }
            className="h-11 rounded-xl bg-white"
          />
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl px-4"
            onClick={() => addItem()}
            disabled={!draft.trim()}
          >
            เพิ่ม
          </Button>
        </div>

        {suggestions && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => {
              const isSelected = items.some(
                (item) =>
                  item.trim().toLocaleLowerCase() ===
                  suggestion.toLocaleLowerCase(),
              );

              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addItem(suggestion)}
                  disabled={isSelected}
                  className={`inline-flex min-h-10 items-center rounded-full border px-3 py-1.5 text-sm transition-all duration-200 ${
                    isSelected
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "border-rose-200 bg-rose-50 text-rose-700 hover:-translate-y-px hover:border-rose-300 hover:bg-rose-100"
                  }`}
                >
                  {suggestion}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <FieldError message={errorMessage} />
    </div>
  );
}

function WorkModeField() {
  const { register, formState } = useFormContext<ProjectFormData>();
  const errorMessage = getFieldError(formState.errors, "workMode");

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        รูปแบบการทำงาน <span className="text-rose-600">*</span>
      </label>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {workModes.map((mode) => (
          <label
            key={mode.value}
            className="flex cursor-pointer flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-px hover:border-rose-200 hover:shadow-sm"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <input
                type="radio"
                value={mode.value}
                {...register("workMode")}
                className="accent-brand-500"
              />
              {mode.label}
            </span>
            <span className="text-xs leading-5 text-slate-500">
              {mode.description}
            </span>
          </label>
        ))}
      </div>
      <FieldError message={errorMessage} />
    </div>
  );
}

function BenefitsField() {
  const { register, watch, formState } = useFormContext<ProjectFormData>();
  const selectedBenefits = watch("benefits");
  const errorMessage = getFieldError(formState.errors, "benefits");
  const showCompensation = selectedBenefits.includes("compensation");

  return (
    <div>
      <FormSectionTitle
        title="สิ่งที่ทีมจะได้รับ"
        description="เลือกสิ่งตอบแทนหรือคุณค่าที่โปรเจกต์นี้มอบให้ผู้สมัคร"
      />

      <div className="flex flex-wrap gap-3">
        {benefitOptions.map((benefit) => (
          <label
            key={benefit.value}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-all duration-200 hover:-translate-y-px hover:border-rose-200 hover:bg-rose-50"
          >
            <input
              type="checkbox"
              value={benefit.value}
              {...register("benefits")}
              className="accent-brand-500"
            />
            {benefit.label}
          </label>
        ))}
      </div>

      {showCompensation && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            รายละเอียดค่าตอบแทน <span className="text-rose-600">*</span>
          </label>
          <Input
            {...register("compensationDetail")}
            placeholder="เช่น 5,000 บาท/เดือน หรือเบี้ยเลี้ยงตามรอบงาน"
            aria-invalid={Boolean(
              getFieldError(formState.errors, "compensationDetail"),
            )}
            className="h-11 rounded-xl bg-white"
          />
          <FieldError
            message={getFieldError(formState.errors, "compensationDetail")}
          />
        </div>
      )}

      <FieldError message={errorMessage} />
    </div>
  );
}

function PositionCard({
  index,
  onRemove,
  canRemove,
}: {
  index: number;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  const { register, formState } = useFormContext<ProjectFormData>();
  const titlePath = `positions.${index}.title` as FieldPath<ProjectFormData>;
  const countPath =
    `positions.${index}.neededCount` as FieldPath<ProjectFormData>;
  const preferredPath =
    `positions.${index}.preferredQualifications` as FieldPath<ProjectFormData>;
  const skillsPath = `positions.${index}.skills` as FieldPath<ProjectFormData>;
  const qualificationsPath =
    `positions.${index}.basicQualifications` as FieldPath<ProjectFormData>;

  return (
    <Card className="relative border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            ตำแหน่งที่ {index + 1}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            แยกความต้องการของแต่ละตำแหน่งออกจากกันให้ชัดเจน
          </p>
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-full border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50"
            onClick={() => onRemove(index)}
            aria-label={`ลบตำแหน่งที่ ${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            ชื่อตำแหน่ง <span className="text-rose-600">*</span>
          </label>
          <Input
            {...register(titlePath)}
            placeholder="เช่น Frontend Developer"
            aria-invalid={Boolean(getFieldError(formState.errors, titlePath))}
            className="h-11 rounded-xl bg-white"
          />
          <FieldError message={getFieldError(formState.errors, titlePath)} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            จำนวนที่ต้องการ <span className="text-rose-600">*</span>
          </label>
          <Input
            type="number"
            min={1}
            {...register(countPath, { valueAsNumber: true })}
            aria-invalid={Boolean(getFieldError(formState.errors, countPath))}
            className="h-11 rounded-xl bg-white"
          />
          <FieldError message={getFieldError(formState.errors, countPath)} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5">
        <TagInputField
          name={skillsPath}
          label="ทักษะที่ต้องการ"
          helperText="เช่น React, UI Design, Photography"
          placeholder="พิมพ์ทักษะแล้วกด Enter"
          required
          suggestions={["React", "UI Design", "Photography"]}
        />

        <TagInputField
          name={qualificationsPath}
          label="คุณสมบัติพื้นฐาน"
          helperText="เช่น มีเวลาประชุมทุกสัปดาห์, รับผิดชอบงานตรงเวลา"
          placeholder="พิมพ์คุณสมบัติพื้นฐานแล้วกด Enter"
          required
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            คุณสมบัติเพิ่มเติม{" "}
            <span className="text-slate-400">(ไม่บังคับ)</span>
          </label>
          <Textarea
            {...register(preferredPath)}
            placeholder="เช่น เคยผ่านการแข่งขัน มีประสบการณ์จริง หรือมี Portfolio"
            aria-invalid={Boolean(
              getFieldError(formState.errors, preferredPath),
            )}
            className="min-h-28 rounded-xl bg-white"
          />
          <FieldError
            message={getFieldError(formState.errors, preferredPath)}
          />
        </div>
      </div>
    </Card>
  );
}

export function ProjectCreateForm({
  initialValues,
  isBusy,
  submitError,
  submitSuccess,
  onSaveDraft,
  onSubmitProject,
}: ProjectCreateFormProps) {
  const methods = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormDataSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });
  const { control, handleSubmit, register, reset, watch, formState } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "positions",
  });
  const categorySuggestions = categoryOptions;

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const compensationSelected = watch("benefits").includes("compensation");
  const categoryError = getFieldError(formState.errors, "categories");
  const titleError = getFieldError(formState.errors, "title");
  const summaryError = getFieldError(formState.errors, "summary");
  const descriptionError = getFieldError(formState.errors, "description");
  const startDateError = getFieldError(
    formState.errors,
    "applicationStartDate",
  );
  const endDateError = getFieldError(formState.errors, "applicationEndDate");

  async function handlePersist(
    values: ProjectFormData,
    submitter: (formData: ProjectFormData) => Promise<void>,
  ) {
    await submitter(normalizeProjectFormData(values));
  }

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-8"
        onSubmit={handleSubmit((values) =>
          handlePersist(values, onSubmitProject),
        )}
      >
        <div className="space-y-6 rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_10px_30px_rgb(253_94_75/0.08)] sm:p-6">
          <FormSectionTitle
            title="ข้อมูลโปรเจกต์"
            description="กรอกข้อมูลโปรเจกต์เพื่อเปิดรับสมาชิกและอธิบายรายละเอียดให้ชัดเจน"
            required
          />

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                ชื่อโปรเจกต์ <span className="text-rose-600">*</span>
              </label>
              <Input
                {...register("title")}
                placeholder="เช่น IDEACREW Open House 2026"
                aria-invalid={Boolean(titleError)}
                className="h-11 rounded-xl bg-white"
              />
              <FieldError message={titleError} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                สรุปโปรเจกต์ <span className="text-rose-600">*</span>
              </label>
              <Textarea
                {...register("summary")}
                placeholder="สรุปสั้น ๆ ว่าโปรเจกต์นี้ทำอะไร และกำลังหาใครมาร่วมทีม"
                aria-invalid={Boolean(summaryError)}
                className="min-h-28 rounded-xl bg-white"
              />
              <FieldError message={summaryError} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                รายละเอียดโปรเจกต์ <span className="text-rose-600">*</span>
              </label>
              <Textarea
                {...register("description")}
                placeholder="อธิบายเป้าหมาย รูปแบบงาน หรือสิ่งที่ทีมกำลังพัฒนา..."
                aria-invalid={Boolean(descriptionError)}
                className="min-h-40 rounded-xl bg-white"
              />
              <FieldError message={descriptionError} />
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_10px_30px_rgb(253_94_75/0.08)] sm:p-6">
          <FormSectionTitle
            title="หมวดหมู่และรูปแบบการทำงาน"
            description="ช่วยให้ผู้สมัครเข้าใจลักษณะงานและค้นหาโปรเจกต์ของคุณได้ง่ายขึ้น"
          />

          <TagInputField
            name="categories"
            label="หมวดหมู่"
            helperText="เลือกจากตัวอย่างด้านล่าง หรือพิมพ์หมวดหมู่ของคุณเอง"
            placeholder="พิมพ์หมวดหมู่แล้วกด Enter"
            required
            suggestions={categorySuggestions}
          />

          <WorkModeField />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              เวลาทำงาน <span className="text-slate-400">(ไม่บังคับ)</span>
            </label>
            <Input
              {...register("workingHours")}
              placeholder="เช่น เสาร์-อาทิตย์ 4-6 ชั่วโมง"
              className="h-11 rounded-xl bg-white"
            />
          </div>

          <div>
            <FormSectionTitle title="ระยะเวลารับสมัคร" required />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  วันเริ่มรับสมัคร <span className="text-rose-600">*</span>
                </label>
                <Input
                  type="date"
                  {...register("applicationStartDate")}
                  aria-invalid={Boolean(startDateError)}
                  className="h-11 rounded-xl bg-white"
                />
                <FieldError message={startDateError} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  วันปิดรับสมัคร <span className="text-rose-600">*</span>
                </label>
                <Input
                  type="date"
                  {...register("applicationEndDate")}
                  aria-invalid={Boolean(endDateError)}
                  className="h-11 rounded-xl bg-white"
                />
                <FieldError message={endDateError} />
              </div>
            </div>
          </div>

          <BenefitsField />

          <div>
            <FormSectionTitle
              title="ตำแหน่งที่เปิดรับ"
              description="เพิ่มได้หลายตำแหน่ง แต่ละตำแหน่งจะมีทักษะและคุณสมบัติของตัวเอง"
              required
            />
            <div className="space-y-5">
              {fields.map((field, index) => (
                <PositionCard
                  key={field.id}
                  index={index}
                  onRemove={remove}
                  canRemove={fields.length > 1}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-dashed border-rose-200 px-5 text-rose-700 hover:bg-rose-50"
                onClick={() =>
                  append({
                    title: "",
                    neededCount: 1,
                    skills: [],
                    basicQualifications: [],
                    preferredQualifications: "",
                  })
                }
              >
                <Plus className="h-4 w-4" />
                เพิ่มตำแหน่ง
              </Button>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {submitError}
          </div>
        )}
        {submitSuccess && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {submitSuccess}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl px-5"
            onClick={handleSubmit((values) =>
              handlePersist(values, onSaveDraft),
            )}
            disabled={isBusy || formState.isSubmitting}
          >
            {isBusy || formState.isSubmitting ? "กำลังบันทึก..." : "บันทึกร่าง"}
          </Button>
          <Button
            type="submit"
            className="h-11 rounded-xl bg-linear-to-br from-brand-500 via-brand-400 to-brand-300 px-6 text-white shadow-[0_4px_12px_rgb(253_94_75/0.22)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_10px_28px_rgb(253_94_75/0.22)] active:scale-[0.98]"
            disabled={isBusy || formState.isSubmitting}
          >
            {isBusy || formState.isSubmitting
              ? "กำลังบันทึก..."
              : "ส่งโปรเจกต์"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export default ProjectCreateForm;
