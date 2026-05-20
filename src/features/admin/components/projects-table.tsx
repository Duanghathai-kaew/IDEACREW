"use client";

import { ArrowUpDown, Check, ChevronDown, Eye, Search } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  DataTable,
  DataTableColumn,
} from "@/features/admin/components/data-table";
import {
  approveProject,
  getAdminProjects,
  rejectProject,
  type AdminProject,
} from "@/features/applications/actions/project-applications.action";

const PAGE_SIZE = 8;

const approvalFilters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

function ApprovalStatusFilter({
  value,
  onChange,
}: {
  value: "all" | "pending" | "approved" | "rejected";
  onChange: (value: "all" | "pending" | "approved" | "rejected") => void;
}) {
  const selectedLabel =
    approvalFilters.find((option) => option.value === value)?.label ?? value;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-between rounded-xl border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 shadow-none hover:bg-slate-50"
        >
          <span>{selectedLabel}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-1"
        align="start"
      >
        <div className="space-y-1">
          {approvalFilters.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                  selected
                    ? "bg-rose-50 text-rose-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{option.label}</span>
                {selected ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function formatReadableDate(date: string) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getApprovalBadgeClass(status: AdminProject["approvalStatus"]) {
  if (status === "pending")
    return "bg-amber-100 text-amber-700 border-amber-200";
  if (status === "rejected") return "bg-rose-100 text-rose-700 border-rose-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

function getLifecycleBadgeClass(status: AdminProject["projectStatus"]) {
  if (status === "closed")
    return "bg-slate-100 text-slate-600 border-slate-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

function calculateProgressWidth(rate: number) {
  const normalized = Math.max(0, Math.min(100, rate));
  return `${normalized}%`;
}

function getProgressClass(rate: number) {
  if (rate >= 100) return "bg-emerald-500";
  if (rate >= 70) return "bg-amber-500";
  return "bg-sky-500";
}

export function ProjectsTable() {
  const [projects, setProjects] = React.useState<AdminProject[]>([]);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [sortBy, setSortBy] = React.useState<
    "createdAt" | "applicationEndDate"
  >("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [selectedProjectId, setSelectedProjectId] = React.useState<
    string | null
  >(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [actionProjectId, setActionProjectId] = React.useState<string | null>(
    null,
  );
  const [selectedPendingTagIds, setSelectedPendingTagIds] = React.useState<
    string[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const selectedProject = React.useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const approvedTags = React.useMemo(
    () => selectedProject?.tags.filter((tag) => tag.status === "enabled") ?? [],
    [selectedProject],
  );

  const pendingTags = React.useMemo(
    () => selectedProject?.tags.filter((tag) => tag.status === "pending") ?? [],
    [selectedProject],
  );

  const otherTags = React.useMemo(
    () =>
      selectedProject?.tags.filter(
        (tag) =>
          tag.status && tag.status !== "enabled" && tag.status !== "pending",
      ) ?? [],
    [selectedProject],
  );

  React.useEffect(() => {
    if (!selectedProject) {
      setSelectedPendingTagIds([]);
      return;
    }
    const pendingIds = selectedProject.tags
      .filter((tag) => tag.status === "pending")
      .map((tag) => tag.id);
    setSelectedPendingTagIds(pendingIds);
  }, [selectedProject]);

  const fetchProjects = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getAdminProjects();
    if (!result.ok) {
      setProjects([]);
      setError(result.error);
      setIsLoading(false);
      return;
    }

    console.log("[adminProjects]", result.data);
    setProjects(result.data);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const filtered = React.useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return projects
      .filter((project) => {
        if (statusFilter !== "all" && project.approvalStatus !== statusFilter) {
          return false;
        }

        if (!keyword) return true;

        return (
          project.title.toLowerCase().includes(keyword) ||
          project.ownerName.toLowerCase().includes(keyword)
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

  const paginated = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const toggleSort = (key: "createdAt" | "applicationEndDate") => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(key);
    setSortOrder("desc");
  };

  const refreshAfterAction = async () => {
    await fetchProjects();
  };

  const handleApprove = async (projectId: string) => {
    setActionProjectId(projectId);
    const result = await approveProject(projectId, selectedPendingTagIds);
    console.log("[approveProject]", result);

    if (!result.ok) {
      setError(result.error);
      setActionProjectId(null);
      return;
    }

    await refreshAfterAction();
    setActionProjectId(null);
    setSelectedProjectId(null);
  };

  const handleReject = async (projectId: string, reason: string) => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please provide rejection reason");
      return;
    }

    setActionProjectId(projectId);
    const result = await rejectProject(projectId, trimmed);
    console.log("[rejectProject]", result);

    if (!result.ok) {
      setError(result.error);
      setActionProjectId(null);
      return;
    }

    await refreshAfterAction();
    setActionProjectId(null);
    setRejectReason("");
    setSelectedProjectId(null);
  };

  const togglePendingTag = (tagId: string) => {
    setSelectedPendingTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const columns: DataTableColumn<AdminProject>[] = [
    {
      id: "title",
      header: "Project Name",
      className: "min-w-72",
      cell: (project) => (
        <button
          type="button"
          data-no-row-click="true"
          onClick={() => setSelectedProjectId(project.id)}
          className="space-y-1 text-left hover:opacity-80"
        >
          <p className="line-clamp-1 font-medium text-slate-700">
            {project.title}
          </p>
          <p className="text-xs text-slate-400">ID {project.id}</p>
        </button>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      cell: (project) => (
        <div>
          <p className="text-slate-700">{project.ownerName}</p>
          <p className="text-xs text-slate-400">{project.ownerEmail || "-"}</p>
        </div>
      ),
    },
    {
      id: "createdAt",
      header: (
        <button
          type="button"
          data-no-row-click="true"
          onClick={() => toggleSort("createdAt")}
          className="inline-flex items-center gap-1"
        >
          Submitted Date
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: (project) => (
        <span className="text-slate-600">
          {formatReadableDate(project.createdAt)}
        </span>
      ),
    },
    {
      id: "deadline",
      header: (
        <button
          type="button"
          data-no-row-click="true"
          onClick={() => toggleSort("applicationEndDate")}
          className="inline-flex items-center gap-1"
        >
          Deadline
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: (project) => (
        <span className="text-slate-600">
          {formatReadableDate(project.applicationEndDate)}
        </span>
      ),
    },
    {
      id: "approval",
      header: "Approval",
      cell: (project) => (
        <Badge
          variant="outline"
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getApprovalBadgeClass(project.approvalStatus)}`}
        >
          {project.approvalStatus}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Project Status",
      cell: (project) => (
        <Badge
          variant="outline"
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getLifecycleBadgeClass(project.projectStatus)}`}
        >
          {project.projectStatus}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "w-16",
      cell: (project) => (
        <div
          data-no-row-click="true"
          className="flex items-center justify-center"
        >
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="text-slate-500"
            onClick={() => setSelectedProjectId(project.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title or owner"
              className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-9 shadow-none"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Approval Status
          </label>
          <ApprovalStatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <DataTable
        rows={paginated}
        columns={columns}
        rowKey={(row) => row.id}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyText={isLoading ? "Loading projects..." : "No projects found"}
        onRowClick={(project) => setSelectedProjectId(project.id)}
      />

      <Dialog
        open={Boolean(selectedProject)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProjectId(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="flex h-[90vh] w-[95vw] max-w-6xl flex-col overflow-hidden p-0">
          {" "}
          {selectedProject ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-100 px-8 py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100">
                      {selectedProject.approvalStatus}
                    </Badge>

                    <div>
                      <DialogTitle className="text-3xl font-bold text-slate-900">
                        {selectedProject.title}
                      </DialogTitle>

                      <DialogDescription className="mt-2 text-base text-slate-500">
                        {selectedProject.description ||
                          "No description provided"}
                      </DialogDescription>
                    </div>
                  </div>

                  <div className="text-right text-sm text-slate-400">
                    Submitted: {formatReadableDate(selectedProject.createdAt)}
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
                <div className="space-y-6">
                  {/* Description */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="mb-4 text-xl font-semibold text-slate-900">
                      Description
                    </h3>

                    <p className="leading-7 text-slate-600">
                      {selectedProject.description ||
                        "No description available"}
                    </p>
                  </section>

                  {/* Owner Info */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="mb-5 text-xl font-semibold text-slate-900">
                      Owner Information
                    </h3>

                    <div className="grid gap-6 md:grid-cols-3">
                      <div>
                        <p className="mb-1 text-sm text-slate-400">
                          Owner Name
                        </p>

                        <p className="font-medium text-slate-800">
                          {selectedProject.ownerName}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-sm text-slate-400">Email</p>

                        <p className="font-medium text-slate-800">
                          {selectedProject.ownerEmail || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-sm text-slate-400">
                          Applicants
                        </p>

                        <p className="font-medium text-slate-800">
                          {selectedProject.applicantCount}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Project Info */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="mb-5 text-xl font-semibold text-slate-900">
                      Project Information
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="mb-1 text-sm text-slate-400">Deadline</p>

                        <p className="font-medium text-slate-800">
                          {formatReadableDate(
                            selectedProject.applicationEndDate,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-sm text-slate-400">
                          Project Status
                        </p>

                        <Badge
                          variant="outline"
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getLifecycleBadgeClass(
                            selectedProject.projectStatus,
                          )}`}
                        >
                          {selectedProject.projectStatus}
                        </Badge>
                      </div>
                    </div>
                  </section>

                  {/* Recruitment Progress */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-slate-900">
                        Recruitment Progress
                      </h3>

                      <span className="text-sm text-slate-500">
                        {selectedProject.recruitmentProgress.completionRate}%
                      </span>
                    </div>

                    <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
                      <span>
                        {selectedProject.recruitmentProgress.acceptedCount}/
                        {selectedProject.recruitmentProgress.totalNeeded}{" "}
                        accepted
                      </span>

                      <span>{selectedProject.applicantCount} applicants</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${getProgressClass(
                          selectedProject.recruitmentProgress.completionRate,
                        )}`}
                        style={{
                          width: calculateProgressWidth(
                            selectedProject.recruitmentProgress.completionRate,
                          ),
                        }}
                      />
                    </div>
                  </section>

                  {/* Positions */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="mb-5 text-xl font-semibold text-slate-900">
                      Positions
                    </h3>

                    <div className="space-y-4">
                      {selectedProject.positions.map((position) => (
                        <div
                          key={position.id}
                          className="rounded-2xl border border-slate-200 p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-lg font-semibold text-slate-800">
                                {position.title}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {position.acceptedCount}/{position.neededCount}{" "}
                                accepted · {position.applicantCount} applicants
                              </p>
                            </div>

                            <Badge variant="outline" className="rounded-full">
                              {position.neededCount} needed
                            </Badge>
                          </div>

                          {/* Skills */}
                          <div className="mt-5">
                            <p className="mb-2 text-sm font-medium text-slate-700">
                              Required Skills
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {position.requiredSkills.length > 0 ? (
                                position.requiredSkills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600"
                                  >
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-slate-400">
                                  No required skills
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Tags */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="mb-5 text-xl font-semibold text-slate-900">
                      Tags
                    </h3>

                    {selectedProject.tags?.length ? (
                      <div className="flex-1 overflow-y-auto space-y-6 px-6">
                        {approvedTags.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Approved Tags
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {approvedTags.map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant="secondary"
                                  className="rounded-full"
                                >
                                  {tag.name}
                                  <span className="ml-2 text-[11px] font-medium text-slate-500">
                                    {tag.type === "skill"
                                      ? "Skill"
                                      : "Category"}
                                  </span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {pendingTags.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Pending Tags Requiring Approval
                            </p>
                            <div className="space-y-2">
                              {pendingTags.map((tag) => (
                                <label
                                  key={tag.id}
                                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 accent-amber-500"
                                      checked={selectedPendingTagIds.includes(
                                        tag.id,
                                      )}
                                      onChange={() => togglePendingTag(tag.id)}
                                    />
                                    <div>
                                      <p className="text-sm font-semibold text-slate-800">
                                        {tag.name}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {tag.type === "skill"
                                          ? "Skill"
                                          : "Category"}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100">
                                    Pending Approval
                                  </Badge>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {otherTags.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Other Tags
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {otherTags.map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant="outline"
                                  className="rounded-full border-slate-200 text-slate-500"
                                >
                                  {tag.name}
                                  <span className="ml-2 text-[11px] font-medium">
                                    {tag.type === "skill"
                                      ? "Skill"
                                      : "Category"}
                                  </span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        No tags available
                      </p>
                    )}
                  </section>

                  {/* Approval Decision */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="mb-5 text-xl font-semibold text-slate-900">
                      Approval Decision
                    </h3>

                    <div className="flex gap-8">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input type="radio" name="decision" />
                        Approve Project
                      </label>

                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input type="radio" name="decision" />
                        Reject Project
                      </label>
                    </div>

                    {/* Reject Reason */}
                    <div className="mt-6">
                      <p className="mb-2 text-sm font-medium text-slate-700">
                        Decision Rationale & Feedback
                      </p>

                      <Textarea
                        value={rejectReason}
                        onChange={(event) =>
                          setRejectReason(event.target.value)
                        }
                        placeholder="Enter detailed comments for the project owner..."
                        className="min-h-32"
                      />
                    </div>
                  </section>
                </div>
              </div>
              {/* Footer */}
              <div className="sticky bottom-0 shrink-0 border-t bg-white p-4">
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    disabled={actionProjectId === selectedProject.id}
                    onClick={() =>
                      void handleReject(selectedProject.id, rejectReason)
                    }
                  >
                    Reject
                  </Button>

                  <Button
                    type="button"
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                    disabled={actionProjectId === selectedProject.id}
                    onClick={() => void handleApprove(selectedProject.id)}
                  >
                    Approve
                  </Button>
                </DialogFooter>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
