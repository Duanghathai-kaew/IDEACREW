import { Input } from "@/components/ui/input";
import { ProjectFormData } from "@/types/project";
import { Calendar, Plus, Trash2 } from "lucide-react";
import React from "react";
import { FormField, TagInput } from "./FormComponents";
import { SectionHeader } from "./SectionHeader";

interface PositionsSectionProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
  newSkill: string[];
  setNewSkill: (skills: string[]) => void;
  newQualification: string[];
  setNewQualification: (qualifications: string[]) => void;
  onAddPosition: () => void;
  onRemovePosition: (index: number) => void;
  onUpdatePosition: (index: number, field: string, value: any) => void;
  onAddToPosition: (
    positionIndex: number,
    field: "skills" | "basicQualifications",
    newValue: string,
  ) => void;
  onRemoveFromPosition: (
    positionIndex: number,
    field: "skills" | "basicQualifications",
    itemIndex: number,
  ) => void;
}

export const PositionsSection: React.FC<PositionsSectionProps> = ({
  formData,
  newSkill,
  setNewSkill,
  newQualification,
  setNewQualification,
  onAddPosition,
  onRemovePosition,
  onUpdatePosition,
  onAddToPosition,
  onRemoveFromPosition,
}) => {
  return (
    <div className="form-card">
      <SectionHeader
        icon={<Calendar className="w-5 h-5" />}
        title="คุณลักษณะที่ค้องการ"
      >
        <button
          type="button"
          onClick={onAddPosition}
          className="btn-primary add-position-button"
        >
          <Plus className="w-4 h-4" />
          เพิ่มตำแหน่ง
        </button>
      </SectionHeader>
      <div>
        {formData.positions.map((position, index) => (
          <div key={index} className="position-card">
            {formData.positions.length > 1 && (
              <button
                type="button"
                onClick={() => onRemovePosition(index)}
                className="position-remove-btn btn-secondary"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="form-grid-2">
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
                  newItem={newSkill[index] || ""}
                  setNewItem={(value) => {
                    const skills = [...newSkill];
                    skills[index] = value;
                    setNewSkill(skills);
                  }}
                  onAdd={() =>
                    onAddToPosition(index, "skills", newSkill[index] || "")
                  }
                  onRemove={(skillIndex) =>
                    onRemoveFromPosition(index, "skills", skillIndex)
                  }
                  placeholder="เพิ่มทักษะ"
                />
              </FormField>
              <FormField label="คุณสมบัติพื้นฐาน">
                <TagInput
                  items={position.basicQualifications}
                  newItem={newQualification[index] || ""}
                  setNewItem={(value) => {
                    const quals = [...newQualification];
                    quals[index] = value;
                    setNewQualification(quals);
                  }}
                  onAdd={() =>
                    onAddToPosition(
                      index,
                      "basicQualifications",
                      newQualification[index] || "",
                    )
                  }
                  onRemove={(qualIndex) =>
                    onRemoveFromPosition(
                      index,
                      "basicQualifications",
                      qualIndex,
                    )
                  }
                  placeholder="เพิ่มคุณสมบัติ"
                />
              </FormField>
              <FormField label="คุณสมบัติที่ต้องการเพิ่มเติม">
                <textarea
                  className="form-textarea"
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
