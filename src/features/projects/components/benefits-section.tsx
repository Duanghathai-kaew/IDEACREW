import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { COMPENSATION_TYPE_OPTIONS } from "@/features/projects/types/compensation.type";
import { Benefit, ProjectFormData } from "@/features/projects/types/project.type";
import { formatCompensationPreview } from "@/features/projects/utils/compensation.utils";
import { Target } from "lucide-react";
import React from "react";
import { FormField, SectionHeader } from "./form-components";

const BENEFITS: { value: Benefit; label: string }[] = [
  { value: "certificate", label: "ใบประกาศนียบัตร" },
  { value: "experience", label: "ประสบการณ์" },
  { value: "portfolio", label: "ผลงานใส่ Portfolio" },
  { value: "compensation", label: "ค่าตอบแทน" },
  { value: "network", label: "เครือข่าย/Networking" },
];

interface BenefitsSectionProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
  onBenefitChange: (benefit: Benefit) => void;
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({
  formData,
  updateFormData,
  onBenefitChange,
}) => {
  const showCompensation = formData.benefits.includes("compensation");
  const requiresAmount =
    formData.compensationType && formData.compensationType !== "none";
  const preview = formatCompensationPreview(
    formData.compensationAmount ?? null,
    formData.compensationType ?? null,
  );

  function handleCompensationToggle(enabled: boolean) {
    if (!enabled) {
      updateFormData({
        compensationEnabled: false,
        compensationAmount: null,
        compensationType: null,
        compensationNote: "",
        compensationDetail: "",
      });
      return;
    }
    updateFormData({ compensationEnabled: true });
  }

  return (
    <div className="mb-8 rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
      <SectionHeader
        icon={<Target className="h-5 w-5" />}
        title="ศักยภาพและผลตอบแทนที่ต้องการ"
        isAlt={true}
      />
      <div>
        <div className="flex flex-wrap gap-4">
          {BENEFITS.map((benefit) => (
            <label
              key={benefit.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                checked={formData.benefits.includes(benefit.value)}
                onChange={() => {
                  const willSelect = !formData.benefits.includes(benefit.value);
                  if (benefit.value === "compensation") {
                    handleCompensationToggle(willSelect);
                  }
                  onBenefitChange(benefit.value);
                }}
                className="accent-(--form-primary)"
              />
              {benefit.label}
            </label>
          ))}
        </div>

        {showCompensation && (
          <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <FormField label="ประเภทค่าตอบแทน" required>
              <select
                value={formData.compensationType ?? ""}
                onChange={(e) => {
                  const nextType = e.target.value || null;
                  updateFormData({
                    compensationType: nextType as ProjectFormData["compensationType"],
                    compensationAmount:
                      nextType === "none" ? null : formData.compensationAmount,
                    compensationEnabled: true,
                  });
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">เลือกประเภทค่าตอบแทน</option>
                {COMPENSATION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            {requiresAmount && (
              <FormField label="จำนวนค่าตอบแทน" required>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={100}
                  value={formData.compensationAmount ?? ""}
                  onChange={(e) =>
                    updateFormData({
                      compensationAmount:
                        e.target.value === ""
                          ? null
                          : Number(e.target.value),
                      compensationEnabled: true,
                    })
                  }
                  placeholder="เช่น 5000"
                />
              </FormField>
            )}

            <FormField label="รายละเอียดเพิ่มเติม">
              <Textarea
                value={formData.compensationNote || ""}
                onChange={(e) =>
                  updateFormData({
                    compensationNote: e.target.value,
                    compensationEnabled: true,
                  })
                }
                placeholder="เช่น ต่อรองได้, มี incentive เพิ่ม"
              />
            </FormField>

            {preview && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                ตัวอย่าง: {preview}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
