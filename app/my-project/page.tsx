"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import Navbar from "@/components/Navbar";
import { MyProject } from "@/lib/myProjectMockData";
import { CalendarDays, Gift, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const statusMeta = {
  draft: {
    label: "แบบร่าง",
    pill: "bg-slate-100 text-slate-700",
    border: "border-slate-300",
  },
  open: {
    label: "เปิดรับสมัคร",
    pill: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-400",
  },
  pending_approval: {
    label: "รอการอนุมัติ",
    pill: "bg-amber-100 text-amber-700",
    border: "border-amber-400",
  },
  rejected_by_admin: {
    label: "ตีกลับโดยแอดมิน",
    pill: "bg-rose-100 text-rose-700",
    border: "border-rose-400",
  },
  approved: {
    label: "อนุมัติแล้ว",
    pill: "bg-sky-100 text-sky-700",
    border: "border-sky-400",
  },
  reviewing: {
    label: "กำลังคัดเลือก",
    pill: "bg-purple-100 text-purple-700",
    border: "border-purple-400",
  },
  closed: {
    label: "ปิดรับแล้ว",
    pill: "bg-slate-200 text-slate-800",
    border: "border-slate-500",
  },
} as const;

const filters = [
  { key: "all", label: "ทั้งหมด" },
  { key: "draft", label: "แบบร่าง" },
  { key: "queue", label: "รอดำเนินการ" },
  { key: "active", label: "กำลังดำเนินการ" },
  { key: "done", label: "จบแล้ว" },
] as const;

type FilterKey = "all" | "draft" | "queue" | "active" | "done";

type MyProjectResponse = {
  data?: MyProject[];
  error?: string;
};

const filterRules: Record<FilterKey, (status: MyProject["status"]) => boolean> = {
  all: () => true,
  draft: (status) => status === "draft",
  queue: (status) => status === "pending_approval" || status === "approved",
  active: (status) => status === "open" || status === "reviewing",
  done: (status) => status === "closed" || status === "rejected_by_admin",
};

export default function MyProjectPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchMyProjects() {
      if (isAuthLoading) return;

      if (!user?.id) {
        if (!mounted) return;
        setProjects([]);
        setIsFetching(false);
        return;
      }

      setIsFetching(true);

      try {
        const response = await fetch(
          `/api/my-projects?ownerId=${encodeURIComponent(user.id)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Request failed");
        }

        const result = (await response.json()) as MyProjectResponse;
        if (!mounted) return;

        setProjects(result.data ?? []);
      } catch {
        if (!mounted) return;
        setProjects([]);
      } finally {
        if (mounted) {
          setIsFetching(false);
        }
      }
    }

    fetchMyProjects();

    return () => {
      mounted = false;
    };
  }, [isAuthLoading, user?.id]);

  const filteredProjects = useMemo(() => {
    const rule = filterRules[activeFilter];
    return projects.filter((project) => rule(project.status));
  }, [activeFilter, projects]);

  const counts = useMemo(() => {
    const countByFilter = (key: FilterKey) =>
      projects.filter((project) => filterRules[key](project.status)).length;

    return {
      all: countByFilter("all"),
      draft: countByFilter("draft"),
      queue: countByFilter("queue"),
      active: countByFilter("active"),
      done: countByFilter("done"),
    };
  }, [projects]);

  async function handleDeleteProject(projectId: string) {
    if (!user?.id || deletingProjectId) return;

    const isConfirmed = window.confirm("ยืนยันการลบโปรเจกต์นี้?");
    if (!isConfirmed) return;

    setDeletingProjectId(projectId);

    try {
      const response = await fetch(
        `/api/my-projects/${projectId}?ownerId=${encodeURIComponent(user.id)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch {
      // Keep current data if delete request fails.
    } finally {
      setDeletingProjectId(null);
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-surface-warm">
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-2">
              โปรเจกต์ของฉัน
            </h1>
            <p className="text-sm md:text-base text-slate-500">
              จัดการและติดตามสถานะโปรเจกต์ของคุณ
            </p>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => {
                const isActive = activeFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      isActive
                        ? "text-white border-transparent shadow"
                        : "bg-white text-slate-700 border-slate-200 hover:border-brand-400"
                    }`}
                    style={
                      isActive
                        ? { background: "var(--brand-gradient-135)" }
                        : undefined
                    }
                  >
                    {filter.label}
                    <span
                      className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {counts[filter.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            {isFetching ? (
              <div className="bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center text-slate-500">
                กำลังโหลดรายการโปรเจกต์...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-amber-100 border border-amber-200 rounded-2xl px-6 py-10 text-center">
                <div className="mx-auto w-12 h-12 rounded-full border-2 border-amber-400 flex items-center justify-center text-amber-700">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-amber-700">
                  ยังไม่มีโปรเจกต์
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  เริ่มต้นโพสต์โปรเจกต์ของคุณตอนนี้!
                </p>
              </div>
            ) : (
              filteredProjects.map((project) => {
                const meta = statusMeta[project.status];
                return (
                  <article
                    key={project.id}
                    className={`bg-white rounded-2xl shadow-sm border-t-4 ${meta.border} p-6`}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${meta.pill}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            โพสต์เมื่อ {project.createdAt}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="text-rose-400 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => handleDeleteProject(project.id)}
                          disabled={deletingProjectId === project.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                          {project.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 text-xs rounded-full bg-amber-100 text-slate-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {project.summary}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          ผู้สมัคร {project.applicants} คน
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          ปิดรับ {project.deadline}
                        </span>
                      </div>

                      {project.status === "open" ? (
                        <Link
                          href={`/project/${project.detailId ?? project.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-brand-500 via-brand-400 to-brand-300 shadow"
                        >
                          ดูรายละเอียดโปรเจกต์
                        </Link>
                      ) : project.status === "pending_approval" ? (
                        <button className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-amber-700 bg-amber-100">
                          รออนุมัติจากแอดมิน
                        </button>
                      ) : project.status === "approved" ? (
                        <button className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-sky-700 bg-sky-100">
                          พร้อมเปิดรับสมัคร
                        </button>
                      ) : project.status === "reviewing" ? (
                        <button className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-purple-700 bg-purple-100">
                          กำลังคัดเลือกผู้สมัคร
                        </button>
                      ) : project.status === "draft" ? (
                        <Link
                          href={`/my-project?draftId=${project.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100"
                        >
                          แก้ไขแบบร่าง
                        </Link>
                      ) : project.status === "closed" ? (
                        <button className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-slate-800 bg-slate-200">
                          ปิดรับสมัครแล้ว
                        </button>
                      ) : (
                        <div className="bg-rose-100 text-rose-700 text-xs rounded-lg p-3">
                          เหตุผลที่ปฏิเสธ: ข้อมูลไม่ครบถ้วนและรายละเอียดไม่ชัดเจน
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
    </>
  );
}
