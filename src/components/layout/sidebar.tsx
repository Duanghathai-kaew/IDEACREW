"use client";

import Image from "next/image";

type SidebarProps = {
  selectedSkills: string[];
  onSkillsChange: (next: string[]) => void;
  selectedCategories: string[];
  onCategoriesChange: (next: string[]) => void;
  status: "all" | "open" | "closed";
  onStatusChange: (next: "all" | "open" | "closed") => void;
  onReset: () => void;
  canReset: boolean;
};

const skillOptions = [
  { id: "frontend", label: "Frontend Dev" },
  { id: "uxui", label: "UX/UI Design" },
  { id: "content", label: "Content Creator" },
];

const categoryOptions = [
  { id: "esport", label: "E-Sport" },
  { id: "openhouse", label: "Open House" },
];

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
}: SidebarProps) {
  return (
    <aside className="sidebar-enter overflow-hidden rounded-[20px] bg-white/90 shadow-[0_10px_30px_rgb(15_23_42/0.08)] backdrop-blur-[14px] lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="flex items-center gap-3 bg-linear-to-r from-(--brand-500) via-(--brand-400) to-(--brand-300) px-[18px] py-4 font-semibold text-white">
        <Image
          src="/logo.svg"
          alt="IdeaCrew logo"
          width={61}
          height={67}
          className="h-12 w-auto shrink-0"
        />
        <span>ตัวกรอง</span>
      </div>

      <div className="p-5">
        <div className="mb-7 border-b border-slate-200 pb-5">
          <p className="mb-2.5 block font-medium">ทักษะที่ต้องการ</p>
          {skillOptions.map((option) => (
            <label
              key={option.id}
              className={`mb-2 flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-all duration-200 ${
                selectedSkills.includes(option.id)
                  ? "bg-rose-50 text-rose-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <input
                className="accent-(--brand-500)"
                type="checkbox"
                checked={selectedSkills.includes(option.id)}
                onChange={() =>
                  onSkillsChange(toggle(selectedSkills, option.id))
                }
              />{" "}
              {option.label}
            </label>
          ))}
        </div>

        <div className="mb-7 border-b border-slate-200 pb-5">
          <p className="mb-2.5 block font-medium">หมวดหมู่</p>
          {categoryOptions.map((option) => (
            <label
              key={option.id}
              className={`mb-2 flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-all duration-200 ${
                selectedCategories.includes(option.id)
                  ? "bg-amber-50 text-amber-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <input
                className="accent-(--brand-500)"
                type="checkbox"
                checked={selectedCategories.includes(option.id)}
                onChange={() =>
                  onCategoriesChange(toggle(selectedCategories, option.id))
                }
              />{" "}
              {option.label}
            </label>
          ))}
        </div>

        <div>
          <p className="mb-2.5 block font-medium">สถานะ</p>
          {statusOptions.map((option) => (
            <label
              key={option.id}
              className={`mb-2 flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-all duration-200 ${
                status === option.id
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <input
                className="accent-(--brand-500)"
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
          className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-50"
        >
          ล้างตัวกรอง
        </button>
      </div>
    </aside>
  );
}
