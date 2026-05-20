"use client";

import { useAuth } from "@/features/auth/components/auth-provider";
import ProjectCreateForm from "@/features/projects/components/project-create-form";
import { normalizeProjectFormData } from "@/features/projects/schemas/projects-api.schema";
import {
  ProjectFormData,
  ProjectStatus,
} from "@/features/projects/types/project.type";
import { ArrowLeft, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDraftProjectId?: string | null;
}

type ProjectDetailResponse = {
  data?: {
    id: string;
    formData?: ProjectFormData;
  };
};

const initialFormData: ProjectFormData = {
  title: "",
  categories: [],
  summary: "",
  description: "",
  workMode: "onsite",
  workingHours: "",
  applicationStartDate: "",
  applicationEndDate: "",
  benefits: [],
  compensationEnabled: false,
  compensationAmount: null,
  compensationType: null,
  compensationNote: "",
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
};

export function AddProjectModal({
  isOpen,
  onClose,
  initialDraftProjectId = null,
}: AddProjectModalProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [draftProjectId, setDraftProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) return;
    setSubmitError(null);
    setSubmitSuccess(null);
    setDraftProjectId(null);
    setFormData(initialFormData);
    setIsLoadingDraft(false);
  }, [isOpen]);

  useEffect(() => {
    let mounted = true;

    async function loadDraftIntoForm() {
      if (!isOpen || !initialDraftProjectId || !user?.id) return;

      setIsLoadingDraft(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      try {
        const response = await fetch(
          `/api/my-projects/${initialDraftProjectId}?ownerId=${encodeURIComponent(user.id)}`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error("Failed to load draft");
        }

        const result = (await response.json()) as ProjectDetailResponse;
        if (!mounted) return;

        const nextFormData = result.data?.formData;
        if (!nextFormData) {
          throw new Error("Draft data is missing");
        }

        setDraftProjectId(initialDraftProjectId);
        setFormData(normalizeProjectFormData(nextFormData));
      } catch {
        if (!mounted) return;
        setSubmitError("ไม่สามารถโหลดข้อมูลแบบร่างได้");
      } finally {
        if (mounted) {
          setIsLoadingDraft(false);
        }
      }
    }

    loadDraftIntoForm();

    return () => {
      mounted = false;
    };
  }, [initialDraftProjectId, isOpen, user?.id]);

  if (!isOpen) return null;

  async function persistProject(
    values: ProjectFormData,
    status: ProjectStatus,
  ) {
    if (!user?.id) {
      setSubmitError("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      throw new Error("Missing user");
    }

    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      if (!draftProjectId) {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ownerId: user.id,
            status,
            formData: values,
          }),
        });

        if (!response.ok) {
          throw new Error("Create project failed");
        }

        const result = (await response.json()) as { data?: { id?: string } };
        const createdProjectId = result.data?.id;
        if (!createdProjectId) {
          throw new Error("Project id is missing");
        }

        if (status === "draft") {
          setDraftProjectId(createdProjectId);
          setFormData(values);
          setSubmitSuccess("บันทึกร่างแล้ว สามารถกลับมาแก้ไขต่อได้");
          return;
        }

        onClose();
        return;
      }

      const response = await fetch(
        `/api/my-projects/${draftProjectId}?ownerId=${encodeURIComponent(user.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            formData: values,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Update project failed");
      }

      if (status === "draft") {
        setSubmitSuccess("อัปเดตร่างเรียบร้อย");
        setFormData(values);
        return;
      }

      onClose();
    } catch {
      setSubmitError(
        status === "draft"
          ? "ไม่สามารถบันทึกร่างได้ กรุณาลองใหม่"
          : "ไม่สามารถส่งโปรเจกต์ได้ กรุณาลองใหม่",
      );
      throw new Error("Persist project failed");
    }
  }

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-900/45 p-4"
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
                      สร้างโปรเจกต์ใหม่
                    </h1>
                    <p className="m-0 text-sm text-(--form-text-secondary)">
                      กรอกข้อมูลโปรเจกต์เพื่อเปิดรับสมาชิกและอธิบายรายละเอียดให้ชัดเจน
                    </p>
                  </div>
                </div>
              </div>

              <ProjectCreateForm
                initialValues={formData}
                isBusy={isLoadingDraft}
                submitError={submitError}
                submitSuccess={submitSuccess}
                onSaveDraft={(values) => persistProject(values, "draft")}
                onSubmitProject={(values) =>
                  persistProject(values, "pending_approval")
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddProjectModal;
