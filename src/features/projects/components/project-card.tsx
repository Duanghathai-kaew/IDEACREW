"use client";

import { SimpleProject } from "@/features/projects/services/simple-project-mock-data";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";

export default function ProjectCard({
  project,
  index,
}: {
  project: SimpleProject;
  index: number;
}) {
  const router = useRouter();
  const avatar = project.org.slice(0, 2).toUpperCase();
  const isOpen = project.status === "open";

  function openProjectDetail() {
    router.push(`/project/${project.id}`);
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    openProjectDetail();
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`ดูรายละเอียดโปรเจกต์ ${project.title}`}
      className="group project-card-enter flex min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_6px_20px_rgb(15_23_42/0.08)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-[0_14px_34px_rgb(15_23_42/0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 sm:p-5 md:flex-row md:gap-6"
      style={{
        animationDelay: `${Math.min(index * 70, 420)}ms`,
      }}
      onClick={openProjectDetail}
      onKeyDown={handleCardKeyDown}
    >
      <div className="flex min-w-0 flex-1 gap-3 sm:gap-4 md:basis-3/5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-500 text-base font-semibold text-white transition-transform duration-300 ease-out group-hover:scale-105 sm:text-lg">
          {avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2 md:hidden">
            <h3 className="min-w-0 flex-1 wrap-break-word font-semibold leading-snug">
              {project.title}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
                isOpen
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {isOpen ? "เปิดรับ" : "ปิดรับ"}
            </span>
          </div>
          <h3 className="mb-1 hidden font-semibold leading-snug md:block">
            {project.title}
          </h3>
          <p className="mb-2 text-[13px] text-slate-500">
            by ทีม {project.org}
          </p>
          <p className="mb-0 line-clamp-3 wrap-break-word text-sm text-slate-600 md:mb-3">
            {project.description}
          </p>
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col md:basis-2/5 md:items-end">
        <div className="mb-2 hidden self-end md:block">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs ${
              isOpen
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {isOpen ? "เปิดรับ" : "ปิดรับ"}
          </span>
        </div>

        <div className="mb-2 w-full min-w-0">
          <p className="mb-1 text-left text-sm text-slate-500">
            ตำแหน่งที่ต้องการ
          </p>
          <div className="mb-3 flex flex-wrap justify-start gap-1.5">
            {project.positions.map((pos) => (
              <span
                key={pos.role}
                className="max-w-full wrap-break-word rounded-full bg-amber-100 px-2.5 py-1 text-xs transition-colors duration-200 hover:bg-amber-200"
              >
                {pos.role} ({pos.needed} คน)
              </span>
            ))}
          </div>
          {project.category.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-left text-sm text-slate-500">
                หมวดหมู่
              </p>
              <div className="mb-3 flex flex-wrap justify-start gap-1.5">
                {project.category.map((cat) => (
                  <span
                    key={cat}
                    className="max-w-full wrap-break-word rounded-full bg-amber-100 px-2.5 py-1 text-xs transition-colors duration-200 hover:bg-amber-200"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="mt-2 min-h-11 w-full rounded-xl bg-linear-to-r from-brand-500 via-brand-400 to-brand-300 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgb(253_94_75/0.22)] active:scale-[0.98] md:mt-4"
          onClick={(event) => {
            event.stopPropagation();
            openProjectDetail();
          }}
        >
          ดูรายละเอียด →
        </button>
      </div>
    </article>
  );
}
