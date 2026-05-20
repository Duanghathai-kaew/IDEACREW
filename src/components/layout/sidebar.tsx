"use client";

import Image from "next/image";

import type { ProjectFilterOption } from "@/features/projects/types/filter-options.type";

export type SidebarProps = {
  selectedSkills: string[];
  onSkillsChange: (next: string[]) => void;
  selectedCategories: string[];
  onCategoriesChange: (next: string[]) => void;
  status: "all" | "open" | "closed";
  onStatusChange: (next: "all" | "open" | "closed") => void;
  onReset: () => void;
  canReset: boolean;
  skillOptions: ProjectFilterOption[];
  categoryOptions: ProjectFilterOption[];
  variant?: "default" | "drawer";
};

const statusOptions: Array<{ id: "all" | "open" | "closed"; label: string }> = [
  { id: "all", label: "ทั้งหมด" },
  { id: "open", label: "เปิดรับ" },
  { id: "closed", label: "ปิดรับแล้ว" },
];

function toggle(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export default function Sidebar({
  selectedSkills,
  onSkillsChange,
  selectedCategories,
  onCategoriesChange,
  status,
  onStatusChange,
  onReset,
  canReset,
  skillOptions,
  categoryOptions,
  variant = "default",
}: SidebarProps) {
  const isDrawer = variant === "drawer";

  return (
    <aside
      className={
        isDrawer
          ? "flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[20px] bg-white shadow-none"
          : "sidebar-enter lg:sticky lg:top-24 lg:z-20 lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-hidden"
      }
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] bg-white/90 shadow-[0_10px_30px_rgb(15_23_42/0.08)] backdrop-blur-[14px]">
        <div className="flex items-center gap-3 bg-linear-to-r from-brand-500 via-brand-400 to-brand-300 px-4.5 py-4 font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.15)]">
          <Image
            src="/logo.svg"
            alt="IdeaCrew logo"
            width={61}
            height={67}
            className="h-12 w-auto shrink-0"
          />
          <span>ตัวกรอง</span>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="mb-7 border-b border-slate-200/80 pb-5">
              <p className="mb-2.5 block font-medium">ทักษะที่ต้องการ</p>
              {skillOptions.length > 0 ? (
                skillOptions.map((option) => (
                  <label
                    key={option.key}
                    className={`mb-2 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-all duration-200 ${
                      selectedSkills.includes(option.key)
                        ? "bg-rose-50 text-rose-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      className="accent-brand-500"
                      type="checkbox"
                      checked={selectedSkills.includes(option.key)}
                      onChange={() =>
                        onSkillsChange(toggle(selectedSkills, option.key))
                      }
                    />{" "}
                    {option.label}
                  </label>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  ยังไม่มีทักษะที่เปิดใช้งาน
                </p>
              )}
            </div>

            <div className="mb-7 border-b border-slate-200/80 pb-5">
              <p className="mb-2.5 block font-medium">หมวดหมู่</p>
              {categoryOptions.length > 0 ? (
                categoryOptions.map((option) => (
                  <label
                    key={option.key}
                    className={`mb-2 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-all duration-200 ${
                      selectedCategories.includes(option.key)
                        ? "bg-amber-50 text-amber-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      className="accent-brand-500"
                      type="checkbox"
                      checked={selectedCategories.includes(option.key)}
                      onChange={() =>
                        onCategoriesChange(
                          toggle(selectedCategories, option.key),
                        )
                      }
                    />{" "}
                    {option.label}
                  </label>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  ยังไม่มีหมวดหมู่ที่เปิดใช้งาน
                </p>
              )}
            </div>

            <div>
              <p className="mb-2.5 block font-medium">สถานะ</p>
              {statusOptions.map((option) => (
                <label
                  key={option.id}
                  className={`mb-2 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-all duration-200 ${
                    status === option.id
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    className="accent-brand-500"
                    type="radio"
                    name="status"
                    checked={status === option.id}
                    onChange={() => onStatusChange(option.id)}
                  />{" "}
                  {option.label}
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={onReset}
              disabled={!canReset}
              className="mt-5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-50"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
