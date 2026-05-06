"use client";

import { ArrowUpDown, Eye, MoreHorizontal } from "lucide-react";
import * as React from "react";

import { DataTable, DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  AdminProject,
  formatReadableDate,
  adminProjects,
  statusOptions,
} from "@/lib/admin/mock-data";

type SortBy = "submittedAt" | "deadline";
type SortOrder = "asc" | "desc";

const PAGE_SIZE = 8;

export function ProjectsTable() {
  const [projects, setProjects] = React.useState<AdminProject[]>(adminProjects);
  const [isLoadingProjects, setIsLoadingProjects] = React.useState(false);
  const [usingMockData, setUsingMockData] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<SortBy>("submittedAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(1);
  const [activeProject, setActiveProject] = React.useState<AdminProject | null>(
    null,
  );
  const [reviewDecision, setReviewDecision] = React.useState<
    "approve" | "reject" | ""
  >("");
  const [reviewFeedback, setReviewFeedback] = React.useState("");
  const [tagDraft, setTagDraft] = React.useState<Record<string, boolean>>({});
  const [decisionError, setDecisionError] = React.useState<string | null>(null);
  const [isDeciding, setIsDeciding] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      setIsLoadingProjects(true);
      setLoadError(null);
      try {
        const response = await fetch("/api/admin/projects", { cache: "no-store" });
        if (!response.ok) {
          setUsingMockData(true);
          setLoadError("โหลดข้อมูลจริงไม่สำเร็จ กำลังแสดงข้อมูลตัวอย่าง");
          return;
        }
        const result = (await response.json()) as { data?: AdminProject[] };
        if (!mounted || !result.data) {
          setUsingMockData(true);
          return;
        }
        setProjects(result.data);
        setUsingMockData(false);
      } catch {
        setUsingMockData(true);
        setLoadError("เชื่อม API ไม่สำเร็จ กำลังแสดงข้อมูลตัวอย่าง");
      } finally {
        if (mounted) setIsLoadingProjects(false);
      }
    }
    loadProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return projects
      .filter((project) => {
        if (statusFilter !== "all" && project.status !== statusFilter)
          return false;
        if (!keyword) return true;
        return (
          project.name.toLowerCase().includes(keyword) ||
          project.submittedBy.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const valueA = new Date(a[sortBy]).getTime();
        const valueB = new Date(b[sortBy]).getTime();
        const result = valueA - valueB;
        return sortOrder === "asc" ? result : -result;
      });
  }, [projects, query, sortBy, sortOrder, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  React.useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  React.useEffect(() => {
    if (!activeProject) {
      setReviewDecision("");
      setReviewFeedback("");
      setTagDraft({});
      setDecisionError(null);
      return;
    }

    const nextDraft: Record<string, boolean> = {};
    activeProject.tags.forEach((tag) => {
      nextDraft[tag.id] = tag.approved;
    });
    setTagDraft(nextDraft);
    setReviewDecision("");
    setReviewFeedback("");
    setDecisionError(null);
  }, [activeProject]);

  function isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  async function handleConfirmDecision() {
    if (!activeProject || isDeciding) return;
    if (usingMockData) {
      setDecisionError("ยังไม่เชื่อมข้อมูลจริงกับ API (โหมดข้อมูลตัวอย่าง)");
      return;
    }
    if (!reviewDecision) {
      setDecisionError("กรุณาเลือกการตัดสินใจ");
      return;
    }
    if (reviewDecision === "reject" && !reviewFeedback.trim()) {
      setDecisionError("กรุณากรอกเหตุผลสำหรับการ Reject");
      return;
    }

    setIsDeciding(true);
    setDecisionError(null);

    const nextStatus: AdminProject["status"] =
      reviewDecision === "approve" ? "approved" : "rejected";

    try {
      if (!isUuid(activeProject.id)) {
        throw new Error("Project id ไม่ใช่ UUID จึงยังส่ง API ไม่ได้");
      }

      const response = await fetch(
        `/api/admin/projects/${activeProject.id}/decision`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision: reviewDecision,
            feedback: reviewFeedback.trim(),
          }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to save decision");
      }

      setProjects((prev) =>
        prev.map((project) =>
          project.id === activeProject.id
            ? {
                ...project,
                status: nextStatus,
              }
            : project,
        ),
      );
      setActiveProject(null);
    } catch (error) {
      setDecisionError(
        error instanceof Error ? error.message : "Failed to save decision",
      );
    } finally {
      setIsDeciding(false);
    }
  }

  const paginated = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const toggleSort = (key: SortBy) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(key);
    setSortOrder("desc");
  };

  const columns: DataTableColumn<AdminProject>[] = [
    {
      id: "name",
      header: "Project Name",
      cell: (project) => (
        <div className="space-y-1">
          <p className="line-clamp-1 font-medium text-slate-700">
            {project.name}
          </p>
          <p className="text-xs text-slate-400">ID {project.id}</p>
        </div>
      ),
      className: "min-w-56",
    },
    {
      id: "submittedBy",
      header: "Submitted By",
      cell: (project) => (
        <span className="text-slate-600">{project.submittedBy}</span>
      ),
    },
    {
      id: "submittedAt",
      header: (
        <button
          type="button"
          data-no-row-click="true"
          onClick={() => toggleSort("submittedAt")}
          className="inline-flex items-center gap-1"
        >
          Submitted Date
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: (project) => (
        <span className="text-slate-600">
          {formatReadableDate(project.submittedAt)}
        </span>
      ),
    },
    {
      id: "deadline",
      header: (
        <button
          type="button"
          data-no-row-click="true"
          onClick={() => toggleSort("deadline")}
          className="inline-flex items-center gap-1"
        >
          Deadline
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: (project) => (
        <span className="text-slate-600">
          {formatReadableDate(project.deadline)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (project) => <StatusBadge status={project.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (project) => (
        <div data-no-row-click="true" className="flex items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="text-slate-500"
            onClick={() => setActiveProject(project)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="text-slate-500"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <div className="space-y-6">
      {loadError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {loadError}
        </div>
      ) : null}
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_220px]">
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            SEARCH
          </label>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search project name or requester"
            className="h-11 rounded-lg border-slate-200 bg-slate-50 shadow-none placeholder:text-slate-400"
          />
        </div>
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            STATUS
          </label>
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-lg border-slate-200 bg-slate-50"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <DataTable
        rows={paginated}
        columns={columns}
        rowKey={(row) => row.id}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={(id, checked) => {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
          });
        }}
        onToggleSelectAll={(checked) => {
          if (!checked) {
            setSelectedIds(new Set());
            return;
          }
          setSelectedIds(new Set(paginated.map((project) => project.id)));
        }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRowClick={(row) => setActiveProject(row)}
        emptyText={isLoadingProjects ? "Loading..." : "No projects found"}
      />

      {activeProject ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setActiveProject(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-slate-100 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-4 p-6">
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                &larr; กลับ
              </button>

              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
                    {activeProject.status === "pending"
                      ? "PENDING"
                      : activeProject.status.toUpperCase()}
                  </span>
                  <p className="text-xs text-slate-500">
                    Submitted: {formatReadableDate(activeProject.submittedAt)}
                  </p>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {activeProject.name}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {activeProject.description}
                </p>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-base font-semibold text-slate-900">
                  รายละเอียดโปรเจกต์
                </h3>
                <p className="text-sm text-slate-600">
                  {activeProject.description}
                </p>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-base font-semibold text-slate-900">
                  ข้อมูลผู้ส่งคำขอ
                </h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-400">ชื่อผู้ส่งคำขอ</p>
                    <p className="text-sm text-slate-700">
                      {activeProject.requester.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">อีเมล</p>
                    <p className="text-sm text-slate-700">
                      {activeProject.requester.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">เบอร์โทร</p>
                    <p className="text-sm text-slate-700">
                      {activeProject.requester.phone}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-base font-semibold text-slate-900">
                  ข้อมูลโปรเจกต์
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-400">จำนวนทีมที่ต้องการ</p>
                    <p className="text-sm text-slate-700">
                      {activeProject.info.teamSize} คน
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">ปิดรับสมัคร</p>
                    <p className="text-sm text-slate-700">
                      {formatReadableDate(activeProject.deadline)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">ชั่วโมง/สัปดาห์</p>
                    <p className="text-sm text-slate-700">
                      {activeProject.info.workingHours}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">รูปแบบการทำงาน</p>
                    <p className="text-sm text-slate-700">
                      {activeProject.info.workType}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-semibold text-slate-800">
                    ผลตอบแทนและสิ่งที่จะได้รับ
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.benefits.map((benefit) => (
                      <span
                        key={benefit}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-base font-semibold text-slate-900">
                  ตำแหน่งที่เปิดรับสมัคร
                </h3>
                <div className="space-y-2">
                  {activeProject.positions.map((position) => (
                    <div
                      key={position.role}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {position.role}
                      </p>
                      <p className="text-xs text-slate-600">
                        {position.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">
                    Tag Management
                  </h3>
                  <Button type="button" size="sm">
                    อนุมัติ
                  </Button>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                          Type
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                          อนุมัติ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {activeProject.tags.map((tag) => (
                        <tr key={tag.id}>
                          <td className="px-3 py-2 text-sm text-slate-700">
                            {tag.name}
                          </td>
                          <td className="px-3 py-2 text-sm text-slate-600">
                            {tag.type}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="checkbox"
                              checked={Boolean(tagDraft[tag.id])}
                              onChange={(event) =>
                                setTagDraft((prev) => ({
                                  ...prev,
                                  [tag.id]: event.target.checked,
                                }))
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-base font-semibold text-slate-900">
                  Decision Section
                </h3>
                <div className="flex items-center gap-6 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="decision"
                      value="approve"
                      checked={reviewDecision === "approve"}
                      onChange={() => setReviewDecision("approve")}
                    />
                    Approve Project
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="decision"
                      value="reject"
                      checked={reviewDecision === "reject"}
                      onChange={() => setReviewDecision("reject")}
                    />
                    Reject Project
                  </label>
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs text-slate-500">
                    Decision Rationale &amp; Feedback (Required for Rejection)
                  </label>
                  <textarea
                    value={reviewFeedback}
                    onChange={(event) => setReviewFeedback(event.target.value)}
                    placeholder="Enter detailed comments for the project owner..."
                    className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Review Status: In Progress
                  </p>
                  <div className="flex items-center gap-3">
                    {decisionError ? (
                      <p className="text-xs text-rose-600">{decisionError}</p>
                    ) : null}
                    <Button type="button" disabled={isDeciding} onClick={handleConfirmDecision}>
                      {isDeciding ? "กำลังบันทึก..." : "Confirm Decision"}
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
