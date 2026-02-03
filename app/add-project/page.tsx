"use client";

import { Input } from "@/components/ui/input";
import { Benefit, ProjectFormData, WorkMode } from "@/types/project";
import {
  ArrowLeft,
  Calendar,
  Plus,
  Shield,
  Target,
  Trash2,
  Users,
} from "lucide-react";
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
  <div className="form-field">
    <label className="form-label">
      {label} {required && <span className="form-required">*</span>}
    </label>
    {children}
  </div>
);

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
    <div className="tag-container">
      {items.map((item, index) => (
        <div key={index} className="tag-item">
          {item}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="tag-remove"
          >
            ×
          </button>
        </div>
      ))}
    </div>
    <div className="tag-input-row">
      <Input
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        placeholder={placeholder}
      />
      <button type="button" onClick={onAdd} className="btn-primary">
        เพิ่ม
      </button>
    </div>
  </>
);

export default function AddProjectModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

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
    <>
      {/* Modal Overlay */}
      <div
        className="modal-overlay"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        {/* Modal Content */}
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "white",
            borderRadius: "20px",
            maxWidth: "64rem",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            position: "relative",
          }}
        >
          <div
            className="form-container"
            style={{ background: "transparent", minHeight: "auto", padding: 0 }}
          >
            <div className="form-wrapper" style={{ padding: "2rem" }}>
              <div className="form-header">
                <button
                  className="btn-secondary"
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  ปิด
                </button>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div
                    style={{
                      backgroundColor: "var(--form-primary)",
                      borderRadius: "12px",
                      padding: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Shield className="w-6 h-6" style={{ color: "white" }} />
                  </div>
                  <div>
                    <h1 className="form-title">วิธีการสร้างโปรเจกต์</h1>
                    <p
                      style={{
                        color: "var(--form-text-secondary)",
                        fontSize: "0.875rem",
                        margin: 0,
                      }}
                    >
                      กรอกข้อมูลในแบบฟอร์มเพื่อเขียนเนียน
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("Form Data:", formData);
                }}
              >
                {/* ข้อมูลโปรเจกต์ */}
                <div className="form-card">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "var(--form-primary)",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Shield className="w-5 h-5" style={{ color: "white" }} />
                    </div>
                    <h2 className="form-section-title" style={{ margin: 0 }}>
                      ข้อมูลพื้นฐานโปรเจกต์
                    </h2>
                  </div>
                  <div>
                    <FormField label="ชื่อโปรเจกต์" required>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          updateFormData({ title: e.target.value })
                        }
                        placeholder="เช่น CSTU E-Sport Tournament 2025"
                        required
                      />
                    </FormField>
                    <FormField label="สรุปย่อ" required>
                      <Input
                        value={formData.summary}
                        onChange={(e) =>
                          updateFormData({ summary: e.target.value })
                        }
                        placeholder="สรุปโปรเจกต์ในประโยคสั้นๆ"
                        required
                      />
                    </FormField>
                    <FormField label="รายละเอียดโปรเจกต์" required>
                      <textarea
                        className="form-textarea"
                        value={formData.description}
                        onChange={(e) =>
                          updateFormData({ description: e.target.value })
                        }
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
                              formData.categories.includes(category)
                                ? "active"
                                : ""
                            }`}
                            onClick={() => handleCategoryToggle(category)}
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
                          onClick={addCategory}
                          className="btn-primary"
                        >
                          เพิ่ม
                        </button>
                      </div>
                    </FormField>
                  </div>
                </div>

                {/* รูปแบบการทำงาน */}
                <div className="form-card">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "var(--form-primary)",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Users className="w-5 h-5" style={{ color: "white" }} />
                    </div>
                    <h2 className="form-section-title" style={{ margin: 0 }}>
                      กลุ่มเป้าหมายการทำงาน
                    </h2>
                  </div>
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
                                updateFormData({
                                  workMode: e.target.value as WorkMode,
                                })
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
                        onChange={(e) =>
                          updateFormData({ workingHours: e.target.value })
                        }
                        placeholder="เช่น เสาร์-อาทิตย์ 4-6 ชั่วโมง"
                      />
                    </FormField>
                  </div>
                </div>

                {/* ระยะเวลารับสมัคร */}
                <div className="form-card">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "var(--form-primary)",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Calendar
                        className="w-5 h-5"
                        style={{ color: "white" }}
                      />
                    </div>
                    <h2 className="form-section-title" style={{ margin: 0 }}>
                      ระยะเวลารับสมัคร
                    </h2>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
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

                {/* ผลตอบแทน */}
                <div className="form-card">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#ffa726",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Target className="w-5 h-5" style={{ color: "white" }} />
                    </div>
                    <h2 className="form-section-title" style={{ margin: 0 }}>
                      ศักยภาพและผลตอบแทนที่ค้องการ
                    </h2>
                  </div>
                  <div>
                    <div className="benefit-group">
                      {BENEFITS.map((benefit) => (
                        <label key={benefit.value} className="benefit-option">
                          <input
                            type="checkbox"
                            checked={formData.benefits.includes(benefit.value)}
                            onChange={() => handleBenefitChange(benefit.value)}
                            className="benefit-checkbox"
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
                            updateFormData({
                              compensationDetail: e.target.value,
                            })
                          }
                          placeholder="เช่น 5,000 บาท/เดือน"
                          required
                        />
                      </FormField>
                    )}
                  </div>
                </div>

                {/* ตำแหน่งงาน */}
                <div className="form-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "var(--form-primary)",
                          borderRadius: "8px",
                          padding: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Calendar
                          className="w-5 h-5"
                          style={{ color: "white" }}
                        />
                      </div>
                      <h2 className="form-section-title" style={{ margin: 0 }}>
                        คุณลักษณะที่ค้องการ
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={addPosition}
                      className="btn-primary"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มตำแหน่ง
                    </button>
                  </div>
                  <div>
                    {formData.positions.map((position, index) => (
                      <div key={index} className="position-card">
                        {formData.positions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePosition(index)}
                            className="position-remove-btn btn-secondary"
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "1rem",
                            }}
                          >
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
                                addToPosition(
                                  index,
                                  "skills",
                                  newSkill[index] || "",
                                )
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
                              className="form-textarea"
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
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary">
                    บันทึกร่าง
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #ff6b47, #ffa726)",
                      color: "white",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "8px",
                      fontWeight: "500",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    ส่งโปรเจกต์
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
