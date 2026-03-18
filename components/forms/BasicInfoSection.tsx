import { Input } from "@/components/ui/input";
import { ProjectFormData } from "@/types/project";
import { Shield } from "lucide-react";
import React from "react";
import { FormField, SectionHeader } from "./FormComponents";

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
  const customCategories = formData.categories.filter(
    (category) => !CATEGORIES.includes(category),
  );

  return (
    <div className="mb-8 rounded-[20px] border border-[var(--form-border)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
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
            className="min-h-24 w-full resize-y rounded-lg border border-[var(--form-border)] px-3 py-3 text-sm transition focus:border-[var(--form-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-400)]"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="อธิบายรายละเอียดโปรเจกต์..."
            required
          />
        </FormField>

        <FormField label="หมวดหมู่">
          <div className="mb-3 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <div
                key={category}
                className={`inline-flex cursor-pointer items-center rounded-[20px] border-2 border-transparent px-4 py-2 text-sm font-medium transition ${
                  formData.categories.includes(category)
                    ? "bg-[var(--form-primary)] text-white"
                    : "bg-[var(--form-primary-light)] text-[var(--brand-500)] hover:-translate-y-px hover:bg-[var(--form-primary)] hover:text-white"
                }`}
                onClick={() => onCategoryToggle(category)}
              >
                {category}
              </div>
            ))}
          </div>
          {customCategories.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {customCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategoryToggle(category)}
                  className="inline-flex items-center rounded-[20px] bg-[var(--form-primary-light)] px-4 py-2 text-sm font-medium text-[var(--brand-500)]"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-end gap-3 max-md:flex-col max-md:items-stretch">
            <Input
              className="min-w-0 flex-1"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="เพิ่มหมวดหมู่ใหม่"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddCategory();
                }
              }}
            />
            <button
              type="button"
              onClick={onAddCategory}
              className="h-fit whitespace-nowrap rounded-lg bg-[var(--form-primary)] px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-px hover:bg-[var(--brand-400)] hover:shadow-[0_4px_12px_rgb(253_94_75/0.3)]"
            >
              เพิ่ม
            </button>
          </div>
        </FormField>
      </div>
    </div>
  );
};
