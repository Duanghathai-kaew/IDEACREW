import { FolderOpen } from "lucide-react";

import ProjectCard from "./project-card";
import { SimpleProject } from "@/features/projects/services/simple-project-mock-data";

export default function ProjectFeed({
  projects,
  hasActiveFilters = false,
}: {
  projects: SimpleProject[];
  hasActiveFilters?: boolean;
}) {
  if (projects.length === 0) {
    return (
      <section className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/80 px-6 py-12 text-center shadow-sm">
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
