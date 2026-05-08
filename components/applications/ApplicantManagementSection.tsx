"use client";

import { ExternalLink, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import {
  acceptApplication,
  ApplicantCard,
  getProjectApplicants,
  rejectApplication,
} from "@/app/actions/project-applications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  projectId: string;
  ownerId: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ApplicantManagementSection({ projectId, ownerId }: Props) {
  const [applicants, setApplicants] = useState<ApplicantCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] =
    useState<ApplicantCard | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ApplicantCard | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function refreshApplicants() {
    setIsLoading(true);
    console.log("[ApplicantManagementSection] fetch start", { projectId });
    const result = await getProjectApplicants({ projectId, ownerId });
    if (result.ok) {
      console.log("[ApplicantManagementSection] applications", {
        projectId,
        applications: result.data,
      });
      setApplicants(result.data);
      setError("");
    } else {
      console.error("[ApplicantManagementSection] fetch failed", {
        projectId,
        error: result.error,
      });
      setError(result.error);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    refreshApplicants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, ownerId]);

  function handleAccept() {
    if (!selectedApplicant) return;
    startTransition(async () => {
      const result = await acceptApplication({
        applicationId: selectedApplicant.id,
        ownerId,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSelectedApplicant(null);
      await refreshApplicants();
    });
  }

  function handleReject() {
    if (!rejectTarget) return;
    startTransition(async () => {
      const result = await rejectApplication({
        applicationId: rejectTarget.id,
        ownerId,
        rejectionReason,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRejectTarget(null);
      setRejectionReason("");
      await refreshApplicants();
    });
  }

  return (
    <section className="mt-6 rounded-2xl border border-orange-100 bg-white/95 p-5 text-slate-800 shadow-[0_14px_30px_rgb(15_23_42/0.08)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            จัดการผู้สมัคร
          </h3>
          <p className="text-sm text-slate-500">
            ตรวจใบสมัครและรับสมาชิกเข้าทีม
          </p>
        </div>
        <Badge className="border border-orange-200 bg-orange-50 text-orange-700">
          {applicants.length} คน
        </Badge>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-7 text-center text-sm text-slate-500">
          กำลังโหลดผู้สมัคร...
        </div>
      ) : applicants.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-7 text-center text-sm text-amber-700">
          ยังไม่มีผู้สมัครในโปรเจกต์นี้
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-medium text-slate-700">
            ตอนนี้มีผู้สมัครทั้งหมด {applicants.length} คน
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full border-orange-200 bg-white text-orange-700 hover:bg-orange-50"
            onClick={() => setIsDetailOpen(true)}
          >
            ดูเพิ่มเติม
          </Button>
        </div>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>ผู้สมัครทั้งหมด ({applicants.length} คน)</DialogTitle>
            <DialogDescription>
              ตรวจรายละเอียดผู้สมัครได้จากหน้าต่างนี้
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {applicants.map((applicant) => (
              <Card
                key={applicant.id}
                className="gap-4 rounded-2xl border-slate-200/90 py-4 shadow-[0_8px_20px_rgb(15_23_42/0.06)]"
              >
                <CardHeader className="gap-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-(--brand-500)">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-[15px] font-semibold text-slate-800">
                        {applicant.displayName}
                      </CardTitle>
                      <p className="mt-1 text-xs text-slate-500">
                        สมัครเมื่อ {formatDate(applicant.appliedAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <p className="mb-1 text-xs font-medium text-slate-500">
                      Motivation
                    </p>
                    <p className="text-sm leading-6 text-slate-700">
                      {applicant.motivationMessage ||
                        "ไม่ได้ระบุ motivation message"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {applicant.skills.length === 0 && (
                        <span className="text-xs text-slate-400">
                          ไม่มีข้อมูลทักษะ
                        </span>
                      )}
                      {applicant.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-700"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {applicant.portfolioUrls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Portfolio
                      </p>
                      {applicant.portfolioUrls.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-sky-700 transition-colors hover:bg-sky-100"
                        >
                          <ExternalLink className="h-4 w-4 shrink-0" />
                          <span className="truncate">{url}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {applicant.additionalNote && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-sm text-slate-700">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Additional note
                      </p>
                      {applicant.additionalNote}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Button
                      variant="outline"
                      asChild
                      className="h-9 w-full justify-center"
                    >
                      <Link href={`/user/${applicant.applicantId}`}>
                        View Profile
                      </Link>
                    </Button>
                    <Button
                      className="h-9 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                      disabled={applicant.status === "accepted"}
                      onClick={() => setSelectedApplicant(applicant)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      className="h-9 w-full"
                      disabled={applicant.status === "rejected"}
                      onClick={() => setRejectTarget(applicant)}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedApplicant)}
        onOpenChange={(open) => !open && setSelectedApplicant(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันรับสมาชิกเข้าทีม?</DialogTitle>
            <DialogDescription>
              ระบบจะส่งการแจ้งเตือนไปยังผู้สมัครและเพิ่มเข้าสู่ทีมทันที
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedApplicant(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleAccept} disabled={isPending}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ปฏิเสธใบสมัคร</DialogTitle>
            <DialogDescription>
              ระบุเหตุผลเพื่อแจ้งให้ผู้สมัครทราบ
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="เหตุผลที่ปฏิเสธ"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectTarget(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending || !rejectionReason.trim()}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
