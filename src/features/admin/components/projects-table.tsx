"use client";

import { ArrowUpDown, Check, Eye, Loader2, Search, X } from "lucide-react";
import * as React from "react";

import {
  approveProject,
  getAdminProjects,
  rejectProject,
  type AdminProject,
} from "@/features/applications/actions/project-applications.action";
import {
  DataTable,
  DataTableColumn,
} from "@/features/admin/components/data-table";
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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 8;

const approvalFilters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

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
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const selectedProject = React.useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

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
    const result = await approveProject(projectId);
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
          <Select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "all"
                  | "pending"
                  | "approved"
                  | "rejected",
              )
            }
            className="h-11 rounded-xl border-slate-200 bg-slate-50"
          >
            {approvalFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
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
        <DialogContent className="max-w-3xl">
          {selectedProject ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProject.title}</DialogTitle>
                <DialogDescription>
                  Project detail and moderation actions
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 text-sm text-slate-600">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="font-medium text-slate-800">Owner</p>
                    <p>{selectedProject.ownerName}</p>
                    <p className="text-xs text-slate-500">
                      {selectedProject.ownerEmail || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="font-medium text-slate-800">Applicants</p>
                    <p>{selectedProject.applicantCount}</p>
                    <p className="text-xs text-slate-500">
                      Completion{" "}
                      {selectedProject.recruitmentProgress.completionRate}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-1 font-medium text-slate-800">Description</p>
                  <p className="rounded-lg border border-slate-200 bg-white p-3">
                    {selectedProject.description || "No description"}
                  </p>
                </div>

                <div>
                  <p className="mb-1 font-medium text-slate-800">
                    Recruitment progress
                  </p>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {selectedProject.recruitmentProgress.acceptedCount}/
                        {selectedProject.recruitmentProgress.totalNeeded}{" "}
                        accepted
                      </span>
                      <span>
                        {selectedProject.recruitmentProgress.completionRate}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${getProgressClass(selectedProject.recruitmentProgress.completionRate)}`}
                        style={{
                          width: calculateProgressWidth(
                            selectedProject.recruitmentProgress.completionRate,
                          ),
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-2 font-medium text-slate-800">Positions</p>
                  <div className="space-y-2">
                    {selectedProject.positions.map((position) => (
                      <div
                        key={position.id}
                        className="rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-slate-800">
                            {position.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {position.acceptedCount}/{position.neededCount}{" "}
                            accepted · {position.applicantCount} applicants
                          </p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {position.requiredSkills.length > 0 ? (
                            position.requiredSkills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">
                              No required skills
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1 font-medium text-slate-800">
                    Reject reason
                  </p>
                  <Textarea
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    placeholder="Provide a reason for rejection"
                    className="min-h-24"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedProjectId(null);
                    setRejectReason("");
                  }}
                >
                  Close
                </Button>
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
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={actionProjectId === selectedProject.id}
                  onClick={() => void handleApprove(selectedProject.id)}
                >
                  Approve
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
