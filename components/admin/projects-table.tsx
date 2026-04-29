"use client";

import * as React from "react";
import { ArrowUpDown, Eye, MoreHorizontal } from "lucide-react";

import { DataTable, DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  AdminProject,
  adminProjects,
  formatReadableDate,
  statusOptions,
} from "@/lib/admin/mock-data";

type SortBy = "submittedAt" | "deadline";
type SortOrder = "asc" | "desc";

const PAGE_SIZE = 8;

export function ProjectsTable() {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<SortBy>("submittedAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return adminProjects
      .filter((project) => {
        if (statusFilter !== "all" && project.status !== statusFilter) return false;
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
  }, [query, sortBy, sortOrder, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  React.useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

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
          <p className="line-clamp-1 font-medium text-slate-700">{project.name}</p>
          <p className="text-xs text-slate-400">ID {project.id}</p>
        </div>
      ),
      className: "min-w-56",
    },
    {
      id: "submittedBy",
      header: "Submitted By",
      cell: (project) => <span className="text-slate-600">{project.submittedBy}</span>,
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
      cell: (project) => <span className="text-slate-600">{formatReadableDate(project.submittedAt)}</span>,
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
      cell: (project) => <span className="text-slate-600">{formatReadableDate(project.deadline)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (project) => <StatusBadge status={project.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <div data-no-row-click="true" className="flex items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="text-slate-500"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon-sm" variant="ghost" className="text-slate-500">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Search
          </label>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search project name or requester"
            className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Status
          </label>
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-xl border-slate-200 bg-slate-50"
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
        emptyText="No projects found"
      />
    </div>
  );
}
