"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getProjectApplicationsForUser,
  type AppliedProjectCard,
} from "@/features/applications/actions/project-applications.action";
import { ApplicantManagementSection } from "@/features/applications/components/applicant-management-section";
import { ApplyProjectModal } from "@/features/applications/components/apply-project-modal";
import { useAuth } from "@/features/auth/components/auth-provider";
import {
  getProjectRecruitmentStatusLabel,
  resolveProjectRecruitmentStatus,
} from "@/features/projects/utils/project-recruitment-status";

type Props = {
  projectId: string;
  ownerId?: string;
  isOpen: boolean;
  applicationEndDateLabel: string;
  projectStatus?: string;
};

export function ProjectApplicationControls({
  projectId,
  ownerId,
  isOpen,
  applicationEndDateLabel,
  projectStatus,
}: Props) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [applyOpen, setApplyOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [application, setApplication] = useState<Pick<
    AppliedProjectCard,
    "id" | "projectId" | "status"
  > | null>(null);
  const [isCheckingApplication, setIsCheckingApplication] = useState(false);

  const isOwner = Boolean(user?.id && ownerId && user.id === ownerId);

  async function loadApplicationStatus() {
    if (!user?.id || isLoading) {
      setApplication(null);
      setIsCheckingApplication(false);
      return;
    }

    setIsCheckingApplication(true);
    const result = await getProjectApplicationsForUser(user.id);

    if (result.ok) {
      setApplication(
        result.data.find((item) => item.projectId === projectId) ?? null,
      );
    } else {
      setApplication(null);
    }

    setIsCheckingApplication(false);
  }

  useEffect(() => {
    void loadApplicationStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user?.id, isLoading]);

  const applicationStatus = application?.status ?? null;
  const isDuplicateApplication =
    applicationStatus === "pending" || applicationStatus === "accepted";
  const recruitmentStatus = resolveProjectRecruitmentStatus(projectStatus);
  const isClosed = recruitmentStatus === "closed";
  const canApply =
    isOpen &&
    !isClosed &&
    !isLoading &&
    !isCheckingApplication &&
    !!user?.id &&
    !isOwner &&
    !isDuplicateApplication;

  const buttonLabel = !user?.id && !isLoading
    ? "เข้าสู่ระบบเพื่อสมัคร"
    : isClosed
      ? getProjectRecruitmentStatusLabel(projectStatus)
      : !isOpen
        ? getProjectRecruitmentStatusLabel(projectStatus)
        : isCheckingApplication
          ? "กำลังตรวจสอบสถานะ..."
          : applicationStatus === "pending"
            ? "ส่งใบสมัครแล้ว"
            : applicationStatus === "accepted"
              ? "เข้าร่วมทีมแล้ว"
              : applicationStatus === "rejected"
                ? "สมัครใหม่อีกครั้ง"
                : "สมัครเลย";

  return (
    <>
      <button
        className="min-h-11 w-full rounded-lg bg-white px-4 py-3 font-semibold shadow-lg transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
        style={{ color: "var(--form-primary)" }}
        disabled={!canApply && Boolean(user?.id)}
        onClick={() => {
          if (!user?.id) {
            router.push("/login");
            return;
          }
          setApplyOpen(true);
        }}
      >
        {buttonLabel}
      </button>
      {!user?.id && !isLoading && (
        <p className="mt-3 text-center text-xs text-white/80">
          กรุณาเข้าสู่ระบบก่อนสมัคร
        </p>
      )}
      {isOwner && (
        <p className="mt-3 text-center text-xs text-white/80">
          คุณเป็นเจ้าของโปรเจกต์นี้
        </p>
      )}
      {isClosed && !isOwner && (
        <p className="mt-3 text-center text-xs text-white/80">
          โปรเจกต์นี้ปิดรับสมาชิกแล้ว
        </p>
      )}
      {!isOpen && !isClosed && (
        <p className="mt-3 text-center text-xs opacity-75">
          หมดเวลา {applicationEndDateLabel}
        </p>
      )}

      {user?.id && (
        <ApplyProjectModal
          open={applyOpen}
          projectId={projectId}
          userId={user.id}
          onOpenChange={setApplyOpen}
          onSuccess={async () => {
            await loadApplicationStatus();
            setSuccessOpen(true);
          }}
        />
      )}

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ส่งใบสมัครเรียบร้อยแล้ว</DialogTitle>
            <DialogDescription>
              ระบบได้ส่งใบสมัครของคุณไปยังเจ้าของโปรเจกต์แล้ว กรุณารอการตอบกลับ
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuccessOpen(false)}>
              ปิด
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-brand-500 via-brand-400 to-brand-300 text-white"
            >
              <Link href="/my-project">ดูสถานะใบสมัคร</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isOwner && user?.id && (
        <ApplicantManagementSection projectId={projectId} ownerId={user.id} />
      )}
    </>
  );
}
