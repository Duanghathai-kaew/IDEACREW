import { Input } from "@/components/ui/input";
import { ProjectFormData } from "@/features/projects/types/project.type";
import { Calendar, Plus, Trash2 } from "lucide-react";
import React from "react";
import { FormField, SectionHeader, TagInput } from "./form-components";

type PositionForm = ProjectFormData["positions"][number];

interface PositionsSectionProps {
  formData: ProjectFormData;
  onAddPosition: () => void;
  onRemovePosition: (index: number) => void;
  onUpdatePosition: <K extends keyof PositionForm>(
    index: number,
    field: K,
    value: PositionForm[K],
  ) => void;
}

export const PositionsSection: React.FC<PositionsSectionProps> = ({
  formData,
  onAddPosition,
  onRemovePosition,
  onUpdatePosition,
}) => {
  return (
    <div className="mb-8 rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
      <SectionHeader
        icon={<Calendar className="w-5 h-5" />}
        title="คุณลักษณะที่ต้องการ"
      >
        <button
          type="button"
          onClick={onAddPosition}
          className="flex items-center gap-2 rounded-[10px] bg-(--form-primary) px-5 py-2.5 text-sm text-white shadow-[0_2px_4px_rgb(253_94_75/0.2)] transition hover:-translate-y-px hover:bg-(--brand-400)"
        >
          <Plus className="w-4 h-4" />
          เพิ่มตำแหน่ง
        </button>
      </SectionHeader>
      <div>
        {formData.positions.map((position, index) => (
          <div
            key={index}
            className="relative mb-6 rounded-xl border border-(--form-border) bg-white p-4"
          >
            {formData.positions.length > 1 && (
              <button
                type="button"
                onClick={() => onRemovePosition(index)}
                className="absolute right-2 top-2 flex min-w-auto items-center rounded-lg border border-(--form-border) bg-white p-1 text-(--form-text-secondary) transition hover:border-(--form-primary) hover:bg-(--form-bg-light)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <FormField label="ชื่อตำแหน่ง" required>
                  <Input
                    value={position.title}
                    onChange={(e) =>
                      onUpdatePosition(index, "title", e.target.value)
                    }
                    placeholder="เช่น Caster"
                    required
                  />
                </FormField>
                <FormField label="จำนวนที่ต้องการ" required>
                  <Input
                    type="number"
                    min="1"
                    value={position.neededCount}
                    onChange={(e) =>
                      onUpdatePosition(
                        index,
                        "neededCount",
                        parseInt(e.target.value),
                      )
                    }
                    required
                  />
                </FormField>
              </div>
              <FormField label="ทักษะที่ต้องการ">
                <TagInput
                  items={position.skills}
                  onChangeItems={(next) =>
                    onUpdatePosition(index, "skills", next)
                  }
                  placeholder="เพิ่มทักษะ"
                />
              </FormField>
              <FormField label="คุณสมบัติพื้นฐาน">
                <TagInput
                  items={position.basicQualifications}
                  onChangeItems={(next) =>
                    onUpdatePosition(index, "basicQualifications", next)
                  }
                  placeholder="เพิ่มคุณสมบัติ"
                />
              </FormField>
              <FormField label="คุณสมบัติที่ต้องการเพิ่มเติม">
                <textarea
                  className="min-h-24 w-full resize-y rounded-lg border border-(--form-border) px-3 py-3 text-sm transition focus:border-(--form-primary) focus:outline-none focus:ring-4 focus:ring-[rgb(253_94_75/0.16)]"
                  value={position.preferredQualifications || ""}
                  onChange={(e) =>
                    onUpdatePosition(
                      index,
                      "preferredQualifications",
                      e.target.value,
                    )
                  }
                  placeholder="คุณสมบัติพิเศษหรือประสบการณ์ที่ต้องการ..."
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
