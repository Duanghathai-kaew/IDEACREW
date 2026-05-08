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
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantCard | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ApplicantCard | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function refreshApplicants() {
    setIsLoading(true);
    const result = await getProjectApplicants({ projectId, ownerId });
    if (result.ok) {
      setApplicants(result.data);
      setError("");
    } else {
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
    <section className="mt-6 rounded-2xl border border-white/20 bg-white p-5 text-slate-800 shadow-lg">
      <div className="mb-4">
        <h3 className="text-base font-semibold">จัดการผู้สมัคร</h3>
        <p className="text-sm text-slate-500">ตรวจใบสมัครและรับสมาชิกเข้าทีม</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          กำลังโหลดผู้สมัคร...
        </div>
      ) : applicants.length === 0 ? (
        <div className="rounded-xl bg-amber-50 px-4 py-6 text-center text-sm text-amber-700">
          ยังไม่มีผู้สมัครในโปรเจกต์นี้
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((applicant) => (
            <Card key={applicant.id} className="gap-4 rounded-xl border-slate-200 py-4 shadow-sm">
              <CardHeader className="gap-3 px-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-(--brand-500)">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{applicant.displayName}</CardTitle>
                    <p className="text-xs text-slate-500">
                      สมัครเมื่อ {formatDate(applicant.appliedAt)}
                    </p>
                  </div>
                  <ApplicationBadge status={applicant.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                <p className="text-sm leading-6 text-slate-600">
                  {applicant.motivationMessage || "ไม่ได้ระบุ motivation message"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {applicant.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-amber-100 text-slate-700">
                      {skill}
                    </Badge>
                  ))}
                </div>
                {applicant.portfolioUrls.length > 0 && (
                  <div className="space-y-2">
                    {applicant.portfolioUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 truncate text-sm text-sky-700 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        <span className="truncate">{url}</span>
                      </a>
                    ))}
                  </div>
                )}
                {applicant.additionalNote && (
                  <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    {applicant.additionalNote}
                  </div>
                )}
                <div className="grid gap-2 sm:grid-cols-3">
                  <Button variant="outline" asChild>
                    <Link href={`/user/${applicant.applicantId}`}>View Profile</Link>
                  </Button>
                  <Button
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    disabled={applicant.status === "accepted"}
                    onClick={() => setSelectedApplicant(applicant)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="destructive"
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
      )}

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
            <DialogDescription>ระบุเหตุผลเพื่อแจ้งให้ผู้สมัครทราบ</DialogDescription>
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

function ApplicationBadge({ status }: { status: ApplicantCard["status"] }) {
  const className =
    status === "accepted"
      ? "bg-emerald-100 text-emerald-700"
      : status === "rejected"
        ? "bg-rose-100 text-rose-700"
        : "bg-amber-100 text-amber-700";

  const label =
    status === "accepted" ? "Accepted" : status === "rejected" ? "Rejected" : "Pending";

  return <Badge className={className}>{label}</Badge>;
}
