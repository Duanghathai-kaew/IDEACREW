import { Input } from "@/components/ui/input";
import { ProjectFormData, WorkMode } from "@/types/project";
import { Calendar, Users } from "lucide-react";
import React from "react";
import { FormField, SectionHeader } from "./FormComponents";

const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: "onsite", label: "ทำงานที่สถานที่" },
  { value: "hybrid", label: "ผสมผสาน" },
  { value: "online", label: "ทำงานออนไลน์" },
];

interface ScheduleSectionProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <div className="mb-8 rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
      <SectionHeader
        icon={<Users className="h-5 w-5" />}
        title="รูปแบบการทำงานและระยะเวลารับสมัคร"
      />

      <FormField label="รูปแบบการทำงาน" required>
        <div className="flex flex-wrap gap-6">
          {WORK_MODES.map((mode) => (
            <label
              key={mode.value}
              className="flex cursor-pointer items-center gap-2"
            >
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

      <SectionHeader
        icon={<Calendar className="h-5 w-5" />}
        title="ระยะเวลารับสมัคร"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <FormField label="เริ่มรับสมัคร" required>
          <Input
            type="date"
            value={formData.applicationStartDate}
            onChange={(e) =>
              updateFormData({
                applicationStartDate: e.target.value,
              })
            }
            required
          />
        </FormField>
        <FormField label="ปิดรับสมัคร" required>
          <Input
            type="date"
            value={formData.applicationEndDate}
            onChange={(e) =>
              updateFormData({ applicationEndDate: e.target.value })
            }
            required
          />
        </FormField>
      </div>
    </div>
  );
};
