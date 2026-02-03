"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Benefit, ProjectFormData, WorkMode } from "@/types/project";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: "onsite", label: "ทำงานที่สถานที่" },
  { value: "hybrid", label: "ผสมผสาน" },
  { value: "online", label: "ทำงานออนไลน์" },
];

const BENEFITS: { value: Benefit; label: string }[] = [
  { value: "certificate", label: "ใบประกาศนียบัตร" },
  { value: "experience", label: "ประสบการณ์" },
  { value: "portfolio", label: "ผลงานใส่ Portfolio" },
  { value: "compensation", label: "ค่าตอบแทน" },
  { value: "network", label: "เครือข่าย/Networking" },
];

const CATEGORIES = [
  "E-Sport",
  "พัฒนาเว็บไซต์",
  "งานอีเวนต์",
  "การศึกษา",
  "ธุรกิจ",
  "อื่นๆ",
];

// Helper Components
const FormField = ({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium mb-2">
      {label} {required && "*"}
    </label>
    {children}
  </div>
);

const TagInput = ({
  items,
  newItem,
  setNewItem,
  onAdd,
  onRemove,
  placeholder,
}: {
  items: string[];
  newItem: string;
  setNewItem: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) => (
  <>
    <div className="flex flex-wrap gap-2 mb-2">
      {items.map((item, index) => (
        <Badge key={index} variant="secondary" className="gap-1">
          {item}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="ml-1 text-xs hover:bg-red-100 rounded-full w-4 h-4 flex items-center justify-center"
          >
            ×
          </button>
        </Badge>
      ))}
    </div>
    <div className="flex gap-2">
      <Input
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        placeholder={placeholder}
      />
      <Button type="button" onClick={onAdd} size="sm">
        เพิ่ม
      </Button>
    </div>
  </>
);

export default function AddProjectPage() {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    categories: [],
    summary: "",
    description: "",
    workMode: "onsite",
    workingHours: "",
    applicationStartDate: "",
    applicationEndDate: "",
    benefits: [],
    compensationDetail: "",
    positions: [
      {
        title: "",
        neededCount: 1,
        skills: [],
        basicQualifications: [],
        preferredQualifications: "",
      },
    ],
  });

  const [newSkill, setNewSkill] = useState<string[]>([""]);
  const [newQualification, setNewQualification] = useState<string[]>([""]);
  const [newCategory, setNewCategory] = useState("");

  const updateFormData = (updates: Partial<ProjectFormData>) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  const handleBenefitChange = (benefit: Benefit) => {
    const newBenefits = formData.benefits.includes(benefit)
      ? formData.benefits.filter((b) => b !== benefit)
      : [...formData.benefits, benefit];
    updateFormData({
      benefits: newBenefits,
      compensationDetail: newBenefits.includes("compensation")
        ? formData.compensationDetail
        : "",
    });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = formData.categories.includes(category)
      ? formData.categories.filter((c) => c !== category)
      : [...formData.categories, category];
    updateFormData({ categories: newCategories });
  };

  const addCategory = () => {
    if (
      newCategory.trim() &&
      !formData.categories.includes(newCategory.trim())
    ) {
      updateFormData({
        categories: [...formData.categories, newCategory.trim()],
      });
      setNewCategory("");
    }
  };

  const addPosition = () => {
    updateFormData({
      positions: [
        ...formData.positions,
        {
          title: "",
          neededCount: 1,
          skills: [],
          basicQualifications: [],
          preferredQualifications: "",
        },
      ],
    });
    setNewSkill([...newSkill, ""]);
    setNewQualification([...newQualification, ""]);
  };

  const removePosition = (index: number) => {
    if (formData.positions.length > 1) {
      updateFormData({
        positions: formData.positions.filter((_, i) => i !== index),
      });
      setNewSkill(newSkill.filter((_, i) => i !== index));
      setNewQualification(newQualification.filter((_, i) => i !== index));
    }
  };

  const updatePosition = (index: number, field: string, value: any) => {
    const newPositions = [...formData.positions];
    (newPositions[index] as any)[field] = value;
    updateFormData({ positions: newPositions });
  };

  const addToPosition = (
    positionIndex: number,
    field: "skills" | "basicQualifications",
    newValue: string,
  ) => {
    const trimmedValue = newValue.trim();
    if (
      !trimmedValue ||
      formData.positions[positionIndex][field].includes(trimmedValue)
    )
      return;

    const newPositions = [...formData.positions];
    newPositions[positionIndex][field] = [
      ...newPositions[positionIndex][field],
      trimmedValue,
    ];
    updateFormData({ positions: newPositions });

    if (field === "skills") {
      const newSkills = [...newSkill];
      newSkills[positionIndex] = "";
      setNewSkill(newSkills);
    } else {
      const newQuals = [...newQualification];
      newQuals[positionIndex] = "";
      setNewQualification(newQuals);
    }
  };

  const removeFromPosition = (
    positionIndex: number,
    field: "skills" | "basicQualifications",
    itemIndex: number,
  ) => {
    const newPositions = [...formData.positions];
    newPositions[positionIndex][field] = newPositions[positionIndex][
      field
    ].filter((_, i) => i !== itemIndex);
    updateFormData({ positions: newPositions });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
          <h1 className="text-2xl font-bold">เพิ่มโปรเจกต์ใหม่</h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Form Data:", formData);
          }}
          className="space-y-8"
        >
          {/* ข้อมูลโปรเจกต์ */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">ข้อมูลโปรเจกต์</h2>
            <div className="space-y-4">
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
                  className="w-full min-h-24 p-3 border border-gray-300 rounded-md"
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData({ description: e.target.value })
                  }
                  placeholder="อธิบายรายละเอียดโปรเจกต์..."
                  required
                />
              </FormField>
              <FormField label="หมวดหมู่">
                <div className="flex flex-wrap gap-2 mb-3">
                  {CATEGORIES.map((category) => (
                    <Badge
                      key={category}
                      variant={
                        formData.categories.includes(category)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="เพิ่มหมวดหมู่ใหม่"
                  />
                  <Button type="button" onClick={addCategory} size="sm">
                    เพิ่ม
                  </Button>
                </div>
              </FormField>
            </div>
          </Card>

          {/* รูปแบบการทำงาน */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">รูปแบบการทำงาน</h2>
            <div className="space-y-4">
              <FormField label="รูปแบบ" required>
                <div className="flex gap-4">
                  {WORK_MODES.map((mode) => (
                    <label key={mode.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="workMode"
                        value={mode.value}
                        checked={formData.workMode === mode.value}
                        onChange={(e) =>
                          updateFormData({
                            workMode: e.target.value as WorkMode,
                          })
                        }
                      />
                      {mode.label}
                    </label>
                  ))}
                </div>
              </FormField>
              <FormField label="เวลาทำงาน">
                <Input
                  value={formData.workingHours || ""}
                  onChange={(e) =>
                    updateFormData({ workingHours: e.target.value })
                  }
                  placeholder="เช่น เสาร์-อาทิตย์ 4-6 ชั่วโมง"
                />
              </FormField>
            </div>
          </Card>

          {/* ระยะเวลารับสมัคร */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">ระยะเวลารับสมัคร</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="เริ่มรับสมัคร" required>
                <Input
                  type="date"
                  value={formData.applicationStartDate}
                  onChange={(e) =>
                    updateFormData({ applicationStartDate: e.target.value })
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
          </Card>

          {/* ผลตอบแทน */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">ผลตอบแทน</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {BENEFITS.map((benefit) => (
                  <label
                    key={benefit.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.benefits.includes(benefit.value)}
                      onChange={() => handleBenefitChange(benefit.value)}
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
                      updateFormData({ compensationDetail: e.target.value })
                    }
                    placeholder="เช่น 5,000 บาท/เดือน"
                    required
                  />
                </FormField>
              )}
            </div>
          </Card>

          {/* ตำแหน่งงาน */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">ตำแหน่งงาน</h2>
              <Button type="button" onClick={addPosition} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มตำแหน่ง
              </Button>
            </div>
            <div className="space-y-6">
              {formData.positions.map((position, index) => (
                <div key={index} className="border rounded-lg p-4 relative">
                  {formData.positions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePosition(index)}
                      className="absolute top-2 right-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="ชื่อตำแหน่ง" required>
                        <Input
                          value={position.title}
                          onChange={(e) =>
                            updatePosition(index, "title", e.target.value)
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
                            updatePosition(
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
                          addToPosition(index, "skills", newSkill[index] || "")
                        }
                        onRemove={(skillIndex) =>
                          removeFromPosition(index, "skills", skillIndex)
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
                          addToPosition(
                            index,
                            "basicQualifications",
                            newQualification[index] || "",
                          )
                        }
                        onRemove={(qualIndex) =>
                          removeFromPosition(
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
                        className="w-full min-h-20 p-3 border border-gray-300 rounded-md"
                        value={position.preferredQualifications || ""}
                        onChange={(e) =>
                          updatePosition(
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
          </Card>

          <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline">
              บันทึกร่าง
            </Button>
            <Button type="submit">ส่งขออนุมัติ</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
