import { Input } from "@/components/ui/input";
import { ProjectFormData } from "@/types/project";
import { Calendar } from "lucide-react";
import React from "react";
import { FormField } from "./FormComponents";
import { SectionHeader } from "./SectionHeader";

interface ApplicationDatesSectionProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
}

export const ApplicationDatesSection: React.FC<
  ApplicationDatesSectionProps
> = ({ formData, updateFormData }) => {
  return (
    <div className="mb-8 rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
      <SectionHeader
        icon={<Calendar className="w-5 h-5" />}
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
