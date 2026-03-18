import { Input } from "@/components/ui/input";
import { ProjectFormData, WorkMode } from "@/types/project";
import { Users } from "lucide-react";
import React from "react";
import { FormField } from "./FormComponents";
import { SectionHeader } from "./SectionHeader";

const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: "onsite", label: "ทำงานที่สถานที่" },
  { value: "hybrid", label: "ผสมผสาน" },
  { value: "online", label: "ทำงานออนไลน์" },
];

interface WorkModesSectionProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
}

export const WorkModesSection: React.FC<WorkModesSectionProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <div className="mb-8 rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
      <SectionHeader
        icon={<Users className="w-5 h-5" />}
        title="กลุ่มเป้าหมายการทำงาน"
      />
      <div>
        <FormField label="รูปแบบ" required>
          <div className="flex flex-wrap gap-6">
            {WORK_MODES.map((mode) => (
              <label key={mode.value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="workMode"
                  value={mode.value}
                  checked={formData.workMode === mode.value}
                  onChange={(e) =>
                    updateFormData({ workMode: e.target.value as WorkMode })
                  }
                  className="accent-(--form-primary)"
                />
                {mode.label}
              </label>
            ))}
          </div>
        </FormField>

        <FormField label="เวลาทำงาน">
          <Input
            value={formData.workingHours || ""}
            onChange={(e) => updateFormData({ workingHours: e.target.value })}
            placeholder="เช่น เสาร์-อาทิตย์ 4-6 ชั่วโมง"
          />
        </FormField>
      </div>
    </div>
  );
};
