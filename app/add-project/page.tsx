"use client";

import { ApplicationDatesSection } from "@/components/forms/ApplicationDatesSection";
import { BasicInfoSection } from "@/components/forms/BasicInfoSection";
import { BenefitsSection } from "@/components/forms/BenefitsSection";
import { PositionsSection } from "@/components/forms/PositionsSection";
import { WorkModesSection } from "@/components/forms/WorkModesSection";
import { Benefit, ProjectFormData } from "@/types/project";
import { ArrowLeft, Shield } from "lucide-react";
import { useState } from "react";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
      <div className="modal-overlay" onClick={onClose}>
        {/* Modal Content */}
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-form-container">
            <div className="modal-form-wrapper">
              <div className="form-header">
                <button
                  className="btn-secondary close-button"
                  onClick={onClose}
                >
                  <ArrowLeft className="w-4 h-4" />
                  ปิด
                </button>
                <div className="header-info">
                  <div className="header-icon-large">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="form-title">วิธีการสร้างโปรเจกต์</h1>
                    <p className="header-text">
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
                <BasicInfoSection
                  formData={formData}
                  updateFormData={updateFormData}
                  newCategory={newCategory}
                  setNewCategory={setNewCategory}
                  onCategoryToggle={handleCategoryToggle}
                  onAddCategory={addCategory}
                />

                {/* รูปแบบการทำงาน */}
                <WorkModesSection
                  formData={formData}
                  updateFormData={updateFormData}
                />

                {/* ระยะเวลารับสมัคร */}
                <ApplicationDatesSection
                  formData={formData}
                  updateFormData={updateFormData}
                />

                {/* ผลตอบแทน */}
                <BenefitsSection
                  formData={formData}
                  updateFormData={updateFormData}
                  onBenefitChange={handleBenefitChange}
                />

                {/* ตำแหน่งงาน */}
                <PositionsSection
                  formData={formData}
                  updateFormData={updateFormData}
                  newSkill={newSkill}
                  setNewSkill={setNewSkill}
                  newQualification={newQualification}
                  setNewQualification={setNewQualification}
                  onAddPosition={addPosition}
                  onRemovePosition={removePosition}
                  onUpdatePosition={updatePosition}
                  onAddToPosition={addToPosition}
                  onRemoveFromPosition={removeFromPosition}
                />

                <div className="form-actions">
                  <button type="button" className="btn-secondary">
                    บันทึกร่าง
                  </button>
                  <button type="submit" className="btn-submit">
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
