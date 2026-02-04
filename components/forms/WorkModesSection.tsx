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
    <div className="form-card">
      <SectionHeader
        icon={<Users className="w-5 h-5" />}
        title="กลุ่มเป้าหมายการทำงาน"
      />
      <div>
        <FormField label="รูปแบบ" required>
          <div className="work-mode-group">
            {WORK_MODES.map((mode) => (
              <label key={mode.value} className="work-mode-option">
                <input
                  type="radio"
                  name="workMode"
                  value={mode.value}
                  checked={formData.workMode === mode.value}
                  onChange={(e) =>
                    updateFormData({ workMode: e.target.value as WorkMode })
                  }
                  className="work-mode-radio"
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
