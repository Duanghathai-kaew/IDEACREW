"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import * as React from "react";

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

// จำกัดจำนวนสูงสุดที่จะแสดงในตอนแรกก่อนกด "ดูเพิ่มเติม"
const INITIAL_DISPLAY_LIMIT = 6;
const FILTER_LIST_MAX_HEIGHT_CLASS = "max-h-64 overflow-y-auto pr-1";

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

  // State สำหรับควบคุมการย่อขยายของกลุ่มทักษะและหมวดหมู่
  const [showAllSkills, setShowAllSkills] = React.useState(false);
  const [showAllCategories, setShowAllCategories] = React.useState(false);

  // ตัดแบ่งอาร์เรย์ตามการสั่งเปิด-ปิด ย่อขยาย
  const displayedSkills = showAllSkills
    ? skillOptions
    : skillOptions.slice(0, INITIAL_DISPLAY_LIMIT);

  const displayedCategories = showAllCategories
    ? categoryOptions
    : categoryOptions.slice(0, INITIAL_DISPLAY_LIMIT);

  return (
    <aside
      className={
        isDrawer
          ? "flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[20px] bg-white shadow-none"
          : /* คุมความสูงสูงสุดด้วย max-h เพื่อให้กล่องหดตามเนื้อหาจริงได้ และไม่ยืดทะลุขอบจอ */
            "sidebar-enter lg:sticky lg:top-24 lg:z-20 lg:self-start lg:max-h-[calc(100vh-120px)] lg:w-full lg:flex-col lg:overflow-hidden"
      }
    >
      {/* กล่องสีขาวหลัก: ถอด h-full ออกแล้วใส่ max-h-full คู่กับ min-h-0 เพื่อรองรับการยืดหด (Fit Content) */}
      <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-[20px] bg-white/90 shadow-[0_10px_30px_rgb(15_23_42/0.08)] backdrop-blur-[14px]">
        {/* Header ส่วนหัวตัวกรอง */}
        <div className="flex items-center gap-3 bg-linear-to-r from-brand-500 via-brand-400 to-brand-300 px-4.5 py-4 font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.15)] shrink-0">
          <Image
            src="/logo.svg"
            alt="IdeaCrew logo"
            width={61}
            height={67}
            className="h-12 w-auto shrink-0"
          />
          <span>ตัวกรอง</span>
        </div>

        {/* Content Area: ใส่ min-h-0 เพื่อปล่อยให้ย่อยหดตัวตามจริง และสกรอลล์ในนี้เมื่อยาวเกินหน้าจอเท่านั้น */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 custom-scrollbar">
          {/* Section: ทักษะที่ต้องการ */}
          <div className="mb-7 border-b border-slate-200/80 pb-5">
            <p className="mb-2.5 block font-medium text-slate-800">
              ทักษะที่ต้องการ
            </p>
            <div
              className={`space-y-1 ${
                showAllSkills ? FILTER_LIST_MAX_HEIGHT_CLASS : ""
              }`}
            >
              {skillOptions.length > 0 ? (
                displayedSkills.map((option) => (
                  <label
                    key={option.key}
                    className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                      selectedSkills.includes(option.key)
                        ? "bg-rose-50 text-rose-700 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      className="accent-brand-500 h-4 w-4 cursor-pointer rounded"
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
                <p className="text-sm text-slate-400 py-2">
                  ยังไม่มีทักษะที่เปิดใช้งาน
                </p>
              )}
            </div>

            {/* ปุ่มเปิด-ปิดสำหรับ ทักษะ */}
            {skillOptions.length > INITIAL_DISPLAY_LIMIT && (
              <button
                type="button"
                onClick={() => setShowAllSkills(!showAllSkills)}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
              >
                {showAllSkills ? (
                  <>
                    <span>แสดงน้อยลง</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>
                      ดูเพิ่มเติม ({skillOptions.length - INITIAL_DISPLAY_LIMIT}
                      )
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Section: หมวดหมู่ */}
          <div className="mb-7 border-b border-slate-200/80 pb-5">
            <p className="mb-2.5 block font-medium text-slate-800">หมวดหมู่</p>
            <div
              className={`space-y-1 ${
                showAllCategories ? FILTER_LIST_MAX_HEIGHT_CLASS : ""
              }`}
            >
              {categoryOptions.length > 0 ? (
                displayedCategories.map((option) => (
                  <label
                    key={option.key}
                    className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                      selectedCategories.includes(option.key)
                        ? "bg-amber-50 text-amber-700 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      className="accent-brand-500 h-4 w-4 cursor-pointer rounded"
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
                <p className="text-sm text-slate-400 py-2">
                  ยังไม่มีหมวดหมู่ที่เปิดใช้งาน
                </p>
              )}
            </div>

            {/* ปุ่มเปิด-ปิดสำหรับ หมวดหมู่ */}
            {categoryOptions.length > INITIAL_DISPLAY_LIMIT && (
              <button
                type="button"
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition"
              >
                {showAllCategories ? (
                  <>
                    <span>แสดงน้อยลง</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>
                      ดูเพิ่มเติม (
                      {categoryOptions.length - INITIAL_DISPLAY_LIMIT})
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Section: สถานะ */}
          <div className="mb-4">
            <p className="mb-2.5 block font-medium text-slate-800">สถานะ</p>
            <div className="space-y-1">
              {statusOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                    status === option.id
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    className="accent-brand-500 h-4 w-4 cursor-pointer"
                    type="radio"
                    name="status"
                    checked={status === option.id}
                    onChange={() => onStatusChange(option.id)}
                  />{" "}
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* ปุ่มล้างตัวกรอง */}
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
    </aside>
  );
}
