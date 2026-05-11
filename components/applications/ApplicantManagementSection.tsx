"use client";

import { ExternalLink, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  acceptApplication,
  ApplicantCard,
  ApplicationStatus,
  getProjectApplicants,
  rejectApplication,
} from "@/app/actions/project-applications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

function getStatusBadgeColor(status: ApplicationStatus) {
  switch (status) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "accepted":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "rejected":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getStatusLabel(status: ApplicationStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    default:
      return "Unknown";
  }
}

export function ApplicantManagementSection({ projectId, ownerId }: Props) {
  const [applicants, setApplicants] = useState<ApplicantCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null,
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmingAccept, setConfirmingAccept] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<ApplicantCard | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Memoized filtered applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const statusMatch =
        filterStatus === "all" || applicant.status === filterStatus;
      const searchMatch = applicant.displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [applicants, filterStatus, searchQuery]);

  // Get selected applicant
  const selectedApplicant = applicants.find(
    (a) => a.id === selectedApplicantId,
  );

  // Count by status
  const statusCounts = useMemo(() => {
    return {
      all: applicants.length,
      pending: applicants.filter((a) => a.status === "pending").length,
      accepted: applicants.filter((a) => a.status === "accepted").length,
      rejected: applicants.filter((a) => a.status === "rejected").length,
    };
  }, [applicants]);

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

  // Auto-select first applicant when modal opens and no selection exists
  useEffect(() => {
    if (isDetailOpen && !selectedApplicantId && filteredApplicants.length > 0) {
      setSelectedApplicantId(filteredApplicants[0].id);
    }
  }, [isDetailOpen, selectedApplicantId, filteredApplicants]);

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
      await refreshApplicants();
      // Keep selected applicant visible
      setSelectedApplicantId(selectedApplicant.id);
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
      // Keep selected applicant visible if it's still in the list
      if (rejectTarget.id === selectedApplicantId) {
        const nextApplicant = filteredApplicants.find(
          (a) => a.id !== rejectTarget.id,
        );
        setSelectedApplicantId(nextApplicant?.id || null);
      }
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

      {/* Split-panel recruiter modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="flex h-[90vh] max-h-[90vh] w-[96vw] max-w-7xl flex-col gap-0 overflow-hidden rounded-3xl p-0">
          <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
            {/* LEFT PANEL: Applicant list */}
            <div className="flex flex-col border-b border-slate-200 sm:w-85 sm:border-b-0 sm:border-r sm:shadow-[-1px_0_0_rgba(226,232,240,1)]">
              <div className="border-b border-slate-200 p-4">
                <DialogHeader>
                  <DialogTitle className="text-base">
                    ผู้สมัครทั้งหมด ({applicants.length})
                  </DialogTitle>
                </DialogHeader>
              </div>

              {/* Search input */}
              <div className="border-b border-slate-200 p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                  <Input
                    type="text"
                    placeholder="ค้นหาชื่อ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Status filter tabs */}
              <div className="border-b border-slate-200 px-3 py-2">
                <div className="flex gap-1 overflow-x-auto">
                  {(["all", "pending", "accepted", "rejected"] as const).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          filterStatus === status
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {status === "all"
                          ? `ทั้งหมด (${statusCounts.all})`
                          : status === "pending"
                            ? `Pending (${statusCounts.pending})`
                            : status === "accepted"
                              ? `Accepted (${statusCounts.accepted})`
                              : `Rejected (${statusCounts.rejected})`}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Applicant list */}
              <div className="flex-1 overflow-y-auto">
                {filteredApplicants.length === 0 ? (
                  <div className="flex items-center justify-center px-4 py-8 text-center text-sm text-slate-500">
                    {applicants.length === 0
                      ? "ไม่มีผู้สมัคร"
                      : "ไม่พบผลการค้นหา"}
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredApplicants.map((applicant) => (
                      <button
                        key={applicant.id}
                        onClick={() => setSelectedApplicantId(applicant.id)}
                        className={`w-full rounded-lg px-3 py-2 text-left transition-all duration-200 ${
                          selectedApplicantId === applicant.id
                            ? "bg-orange-50 ring-1 ring-orange-200"
                            : "hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-orange-100 to-amber-100 text-brand-500">
                            <UserRound className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {applicant.displayName}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {applicant.skills[0] || "No skill"}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={`border text-[10px] font-medium ${getStatusBadgeColor(
                                  applicant.status,
                                )}`}
                              >
                                {getStatusLabel(applicant.status)}
                              </Badge>
                              <span className="text-[10px] text-slate-400">
                                {formatDate(applicant.appliedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: Applicant detail */}
            <div className="flex-1 overflow-y-auto">
              {selectedApplicant ? (
                <div className="space-y-6 p-6">
                  {/* Header */}
                  <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-orange-100 to-amber-100 text-brand-500">
                      <UserRound className="h-7 w-7 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-slate-800">
                        {selectedApplicant.displayName}
                      </h2>
                      <p className="text-sm text-slate-500">
                        สมัครเมื่อ {formatDate(selectedApplicant.appliedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Position Information */}
                  {selectedApplicant.positionTitle && (
                    <div className="rounded-xl border border-slate-100 bg-linear-to-br from-slate-50 to-slate-100 p-4">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                        ตำแหน่ง
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {selectedApplicant.positionTitle}
                          </h3>
                          {selectedApplicant.positionNeededCount !== null && (
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">
                                  ตำแหน่งที่ว่าง
                                </span>
                                <span className="font-semibold text-slate-800">
                                  {selectedApplicant.positionAcceptedCount ?? 0} /{" "}
                                  {selectedApplicant.positionNeededCount}
                                </span>
                              </div>
                              {/* Progress bar */}
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className={`h-full transition-all ${
                                    (selectedApplicant.positionAcceptedCount ?? 0) >=
                                    selectedApplicant.positionNeededCount
                                      ? "bg-red-500"
                                      : (selectedApplicant.positionAcceptedCount ?? 0) >=
                                          (selectedApplicant.positionNeededCount ?? 0) * 0.7
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      ((selectedApplicant.positionAcceptedCount ??
                                        0) /
                                        (selectedApplicant.positionNeededCount ?? 1)) *
                                        100,
                                      100,
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        {selectedApplicant.positionRequiredSkills &&
                          selectedApplicant.positionRequiredSkills.length > 0 && (
                            <div>
                              <p className="mb-2 text-xs font-medium text-slate-600">
                                ทักษะที่ต้องการ
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {selectedApplicant.positionRequiredSkills.map(
                                  (skill) => (
                                    <Badge
                                      key={skill}
                                      className="border border-slate-300 bg-slate-200 text-[10px] font-medium text-slate-700"
                                    >
                                      {skill}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Motivation */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Motivation
                    </p>
                    <p className="text-sm leading-6 text-slate-700">
                      {selectedApplicant.motivationMessage ||
                        "ไม่ได้ระบุ motivation message"}
                    </p>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplicant.skills.length === 0 ? (
                        <span className="text-xs text-slate-400">
                          ไม่มีข้อมูลทักษะ
                        </span>
                      ) : (
                        selectedApplicant.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-700"
                          >
                            {skill}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {selectedApplicant.additionalNote && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-slate-700">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Bio / Additional Note
                      </p>
                      {selectedApplicant.additionalNote}
                    </div>
                  )}

                  {/* Portfolio links */}
                  {selectedApplicant.portfolioUrls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Portfolio
                      </p>
                      <div className="space-y-1">
                        {selectedApplicant.portfolioUrls.map((url) => (
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
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="sticky bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur supports-backdrop-filter:bg-white/75 pt-4">
                    {/* Position full warning */}
                    {selectedApplicant.positionNeededCount !== null &&
                      (selectedApplicant.positionAcceptedCount ?? 0) >=
                        selectedApplicant.positionNeededCount && (
                        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                          ตำแหน่งนี้เต็มแล้ว
                        </div>
                      )}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        asChild
                        className="h-9 w-full justify-center text-xs"
                      >
                        <Link href={`/user/${selectedApplicant.applicantId}`}>
                          View Profile
                        </Link>
                      </Button>
                      <Button
                        className="h-9 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                        disabled={
                          selectedApplicant.status === "accepted" ||
                          isPending ||
                          (selectedApplicant.positionNeededCount !== null &&
                            (selectedApplicant.positionAcceptedCount ?? 0) >=
                              selectedApplicant.positionNeededCount)
                        }
                        onClick={() => setConfirmingAccept(true)}
                        size="sm"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        className="h-9 w-full text-xs"
                        disabled={
                          selectedApplicant.status === "rejected" || isPending
                        }
                        onClick={() => setRejectTarget(selectedApplicant)}
                        size="sm"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-12">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-6 py-8">
                    <p className="text-center text-sm font-medium text-slate-600">
                      เลือกผู้สมัครจากรายการทางซ้าย
                    </p>
                    <p className="mt-2 text-center text-xs text-slate-500">
                      ดูรายละเอียดและรับสมาชิกเข้าทีม
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Accept confirmation dialog */}
      <Dialog open={confirmingAccept} onOpenChange={setConfirmingAccept}>
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
              onClick={() => setConfirmingAccept(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setConfirmingAccept(false);
                handleAccept();
              }}
              disabled={isPending}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject confirmation dialog */}
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
