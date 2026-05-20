import { FolderOpen } from "lucide-react";

import { SimpleProject } from "@/features/projects/services/simple-project-mock-data";
import ProjectCard from "./project-card";

export default function ProjectFeed({
  projects,
  hasActiveFilters = false,
  isLoading = false,
}: {
  projects: SimpleProject[];
  hasActiveFilters?: boolean;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <section className="space-y-4 sm:space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <article
            key={index}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="mb-4 h-5 w-2/3 rounded-full bg-slate-200" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded-full bg-slate-200" />
              <div className="h-4 w-[88%] rounded-full bg-slate-200" />
              <div className="h-4 w-[72%] rounded-full bg-slate-200" />
            </div>
            <div className="mt-5 flex gap-2">
              <div className="h-8 w-24 rounded-full bg-slate-200" />
              <div className="h-8 w-16 rounded-full bg-slate-200" />
            </div>
          </article>
        ))}
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/80 px-6 py-12 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <FolderOpen className="h-7 w-7 text-slate-400" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-slate-800">
          ไม่พบโปรเจกต์
        </h2>
        <p className="max-w-sm text-sm text-slate-500">
          {hasActiveFilters
            ? "ลองปรับคำค้นหาหรือตัวกรองใหม่เพื่อดูผลลัพธ์อื่น"
            : "ยังไม่มีโปรเจกต์ในขณะนี้ กลับมาดูอีกครั้งภายหลัง"}
        </p>
      </section>
    );
  }

  return (
    <section className="flex min-w-0 flex-col gap-4 sm:gap-6">
      {projects.map((p, index) => (
        <ProjectCard key={p.id} project={p} index={index} />
      ))}
    </section>
  );
}
