"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { ApplyProjectModal } from "@/components/applications/ApplyProjectModal";
import { ApplicantManagementSection } from "@/components/applications/ApplicantManagementSection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  projectId: string;
  ownerId?: string;
  isOpen: boolean;
  applicationEndDateLabel: string;
};

export function ProjectApplicationControls({
  projectId,
  ownerId,
  isOpen,
  applicationEndDateLabel,
}: Props) {
  const { user, isLoading } = useAuth();
  const [applyOpen, setApplyOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const isOwner = Boolean(user?.id && ownerId && user.id === ownerId);

  return (
    <>
      <button
        className="w-full rounded-lg bg-white px-4 py-3 font-semibold shadow-lg transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
        style={{ color: "var(--form-primary)" }}
        disabled={!isOpen || isLoading || !user?.id || isOwner}
        onClick={() => setApplyOpen(true)}
      >
        {isOpen ? "สมัครเลย" : "ปิดรับสมัครแล้ว"}
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
      {!isOpen && (
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
          onSuccess={() => setSuccessOpen(true)}
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
            <Button asChild className="bg-gradient-to-r from-brand-500 via-brand-400 to-brand-300 text-white">
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
