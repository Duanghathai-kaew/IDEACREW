"use client";

import Sidebar, { type SidebarProps } from "@/components/layout/sidebar";
import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect } from "react";

type MobileFilterDrawerProps = Omit<SidebarProps, "variant"> & {
  open: boolean;
  onClose: () => void;
  activeFilterCount: number;
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
      id="project-filter-toggle"
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-controls="project-filter-panel"
      className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 lg:hidden"
    >
      <SlidersHorizontal className="h-4 w-4 text-brand-500" />
      ตัวกรอง
      {activeFilterCount > 0 && (
        <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-white">
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
    const desktop = window.matchMedia("(min-width: 1024px)");
    function closeOnDesktop(event: MediaQueryListEvent) {
      if (event.matches) onClose();
    }
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [open, onClose]);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content
          id="project-filter-panel"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const toggle = document.getElementById("project-filter-toggle");
            if (toggle?.getClientRects().length) toggle.focus();
          }}
          className="fixed inset-x-0 bottom-0 z-50 flex h-[90dvh] max-h-[48rem] min-h-0 flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl outline-none sm:inset-y-0 sm:right-auto sm:h-dvh sm:max-h-none sm:w-96 sm:rounded-none"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
            <Dialog.Title className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <SlidersHorizontal className="h-4 w-4 text-brand-500" />
              ตัวกรองโปรเจกต์
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  {activeFilterCount}
                </span>
              )}
            </Dialog.Title>
            <Dialog.Close type="button" aria-label="ปิดตัวกรอง" className="icon-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <X className="icon-sm" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <Sidebar {...sidebarProps} variant="drawer" />
          </div>
          <div className="shrink-0 border-t border-slate-100 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Dialog.Close type="button" className="min-h-11 w-full cursor-pointer rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 active:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">
              ดูโปรเจกต์
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
