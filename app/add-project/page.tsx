"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { BasicInfoSection } from "@/components/forms/BasicInfoSection";
import { BenefitsSection } from "@/components/forms/BenefitsSection";
import { PositionsSection } from "@/components/forms/PositionsSection";
import { ScheduleSection } from "@/components/forms/ScheduleSection";
import { Benefit, ProjectFormData, ProjectStatus } from "@/types/project";
import { ArrowLeft, Shield } from "lucide-react";
import { useState } from "react";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProjectModal({
  isOpen,
  onClose,
}: AddProjectModalProps) {
  const { user } = useAuth();

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

  const [newCategory, setNewCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<ProjectStatus>("draft");
  type PositionForm = ProjectFormData["positions"][number];

  if (!isOpen) return null;

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
  };

  const removePosition = (index: number) => {
    if (formData.positions.length > 1) {
      updateFormData({
        positions: formData.positions.filter((_, i) => i !== index),
      });
    }
  };

  const updatePosition = <K extends keyof PositionForm>(
    index: number,
    field: K,
    value: PositionForm[K],
  ) => {
    const newPositions = [...formData.positions];
    newPositions[index][field] = value;
    updateFormData({ positions: newPositions });
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user?.id || isSubmitting) {
      setSubmitError("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: user.id,
          status: submitStatus,
          formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Create project failed");
      }

      onClose();
    } catch {
      setSubmitError("ไม่สามารถบันทึกโปรเจกต์ได้ กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/45 p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[20px] bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="p-8">
              <div className="mb-8 flex items-center gap-4">
                <button
                  className="flex h-fit items-center gap-2 whitespace-nowrap rounded-lg border border-(--form-border) bg-white px-4 py-2 text-sm font-medium text-(--form-text-secondary) transition hover:border-(--form-primary) hover:bg-(--form-bg-light)"
                  onClick={onClose}
                >
                  <ArrowLeft className="w-4 h-4" />
                  ปิด
                </button>
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center rounded-xl bg-(--form-primary) p-3 text-white">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-700">
                      วิธีการสร้างโปรเจกต์
                    </h1>
                    <p className="m-0 text-sm text-(--form-text-secondary)">
                      กรอกข้อมูลในแบบฟอร์มเพื่อเขียนเนียน
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* ข้อมูลโปรเจกต์ */}
                <BasicInfoSection
                  formData={formData}
                  updateFormData={updateFormData}
                  newCategory={newCategory}
                  setNewCategory={setNewCategory}
                  onCategoryToggle={handleCategoryToggle}
                  onAddCategory={addCategory}
                />

                {/* รูปแบบการทำงานและระยะเวลารับสมัคร */}
                <ScheduleSection
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
                  onAddPosition={addPosition}
                  onRemovePosition={removePosition}
                  onUpdatePosition={updatePosition}
                />

                {submitError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {submitError}
                  </div>
                )}

                <div className="flex flex-wrap justify-end gap-4 pt-6 max-[480px]:flex-col">
                  <button
                    type="submit"
                    onClick={() => setSubmitStatus("draft")}
                    disabled={isSubmitting}
                    className="h-fit whitespace-nowrap rounded-lg border border-(--form-border) bg-white px-4 py-2 text-sm font-medium text-(--form-text-secondary) transition hover:border-(--form-primary) hover:bg-(--form-bg-light) max-[480px]:w-full"
                  >
                    บันทึกร่าง
                  </button>
                  <button
                    type="submit"
                    onClick={() => setSubmitStatus("pending_approval")}
                    disabled={isSubmitting}
                    className="cursor-pointer rounded-[10px] bg-linear-to-br from-(--brand-500) via-(--brand-400) to-(--brand-300) px-8 py-3 text-base font-semibold text-white shadow-[0_4px_12px_rgb(253_94_75/0.22)] transition hover:-translate-y-px hover:shadow-[0_4px_12px_rgb(253_94_75/0.3)] max-[480px]:w-full"
                  >
                    {isSubmitting ? "กำลังบันทึก..." : "ส่งโปรเจกต์"}
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
