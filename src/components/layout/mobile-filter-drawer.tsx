"use client";

import Sidebar from "@/components/layout/sidebar";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect } from "react";

type MobileFilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  activeFilterCount: number;
  selectedSkills: string[];
  onSkillsChange: (next: string[]) => void;
  selectedCategories: string[];
  onCategoriesChange: (next: string[]) => void;
  status: "all" | "open" | "closed";
  onStatusChange: (next: "all" | "open" | "closed") => void;
  onReset: () => void;
  canReset: boolean;
};

export function MobileFilterToggle({
  activeFilterCount,
  onOpen,
}: {
  activeFilterCount: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
    >
      <SlidersHorizontal className="h-4 w-4 text-(--brand-500)" />
      ตัวกรอง
      {activeFilterCount > 0 && (
        <span className="rounded-full bg-linear-to-br from-(--brand-500) to-(--brand-400) px-2 py-0.5 text-xs text-white">
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}

export default function MobileFilterDrawer({
  open,
  onClose,
  activeFilterCount,
  ...sidebarProps
}: MobileFilterDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        aria-label="ปิดตัวกรอง"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="ตัวกรองโปรเจกต์"
        className="absolute left-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <SlidersHorizontal className="h-4 w-4 text-(--brand-500)" />
            ตัวกรอง
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="ปิด"
            className="icon-btn"
            onClick={onClose}
          >
            <X className="icon-sm" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <Sidebar {...sidebarProps} variant="drawer" />
        </div>
      </aside>
    </div>
  );
}
