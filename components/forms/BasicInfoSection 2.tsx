import { Input } from "@/components/ui/input";
import { ProjectFormData } from "@/types/project";
import { Shield } from "lucide-react";
import React from "react";
import { FormField } from "./FormComponents";
import { SectionHeader } from "./SectionHeader";

const CATEGORIES = [
  "E-Sport",
  "พัฒนาเว็บไซต์",
  "งานอีเวนต์",
  "การศึกษา",
  "ธุรกิจ",
  "อื่นๆ",
];

interface BasicInfoSectionProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
  newCategory: string;
  setNewCategory: (value: string) => void;
  onCategoryToggle: (category: string) => void;
  onAddCategory: () => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  updateFormData,
  newCategory,
  setNewCategory,
  onCategoryToggle,
  onAddCategory,
}) => {
  return (
    <div className="form-card">
      <SectionHeader
        icon={<Shield className="w-5 h-5" />}
        title="ข้อมูลพื้นฐานโปรเจกต์"
      />
      <div>
        <FormField label="ชื่อโปรเจกต์" required>
          <Input
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="เช่น CSTU E-Sport Tournament 2025"
            required
          />
        </FormField>

        <FormField label="สรุปย่อ" required>
          <Input
            value={formData.summary}
            onChange={(e) => updateFormData({ summary: e.target.value })}
            placeholder="สรุปโปรเจกต์ในประโยคสั้นๆ"
            required
          />
        </FormField>

        <FormField label="รายละเอียดโปรเจกต์" required>
          <textarea
            className="form-textarea"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="อธิบายรายละเอียดโปรเจกต์..."
            required
          />
        </FormField>

        <FormField label="หมวดหมู่">
          <div className="category-badges">
            {CATEGORIES.map((category) => (
              <div
                key={category}
                className={`category-badge ${
                  formData.categories.includes(category) ? "active" : ""
                }`}
                onClick={() => onCategoryToggle(category)}
              >
                {category}
              </div>
            ))}
          </div>
          <div className="tag-input-row">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="เพิ่มหมวดหมู่ใหม่"
            />
            <button
              type="button"
              onClick={onAddCategory}
              className="btn-primary"
            >
              เพิ่ม
            </button>
          </div>
        </FormField>
      </div>
    </div>
  );
};
