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
    <div className="form-card">
      <SectionHeader
        icon={<Calendar className="w-5 h-5" />}
        title="ระยะเวลารับสมัคร"
      />
      <div className="form-grid-2">
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
