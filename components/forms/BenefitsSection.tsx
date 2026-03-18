import { Input } from "@/components/ui/input";
import { Benefit, ProjectFormData } from "@/types/project";
import { Target } from "lucide-react";
import React from "react";
import { FormField } from "./FormComponents";
import { SectionHeader } from "./SectionHeader";

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
  return (
    <div className="mb-8 rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
      <SectionHeader
        icon={<Target className="w-5 h-5" />}
        title="ศักยภาพและผลตอบแทนที่ค้องการ"
        isAlt={true}
      />
      <div>
        <div className="flex flex-wrap gap-4">
          {BENEFITS.map((benefit) => (
            <label key={benefit.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formData.benefits.includes(benefit.value)}
                onChange={() => onBenefitChange(benefit.value)}
                className="accent-(--form-primary)"
              />
              {benefit.label}
            </label>
          ))}
        </div>
        {formData.benefits.includes("compensation") && (
          <FormField label="รายละเอียดค่าตอบแทน" required>
            <Input
              value={formData.compensationDetail || ""}
              onChange={(e) =>
                updateFormData({
                  compensationDetail: e.target.value,
                })
              }
              placeholder="เช่น 5,000 บาท/เดือน"
              required
            />
          </FormField>
        )}
      </div>
    </div>
  );
};
