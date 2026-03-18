"use client";

import AddProjectModal from "@/app/add-project/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CircleUserRound, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import NotificationDropdown from "@/components/NotificationDropdown";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const notiRef = useRef<HTMLDivElement | null>(null);
  const active: "home" | "my-project" = pathname?.startsWith("/my-project")
    ? "my-project"
    : "home";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!notiRef.current) return;
      if (!notiRef.current.contains(event.target as Node)) {
        setIsNotiOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { key: "home", label: "หน้าหลัก" },
    { key: "my-project", label: "โปรเจกต์ของฉัน" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full overflow-visible border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between overflow-visible px-6 py-4">
        <div className="flex items-center w-full">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => router.push("/")} className="inline-flex items-center">
              <Image
                src="/logo-text.png"
                alt="IDEACREW"
                className="h-10 w-auto"
                width={193}
                height={67}
                priority
              />
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="flex-1 flex justify-center">
            <div className="hidden gap-6 md:flex">
              {menuItems.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() =>
                    router.push(key === "home" ? "/" : "/my-project")
                  }
                  className={`text-nav pb-1 ${
                    active === key
                      ? "border-b-2 border-[var(--brand-500)] text-[var(--brand-500)]"
                      : "text-slate-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <div className="relative flex items-center" ref={notiRef}>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsNotiOpen((prev) => !prev)}
              >
                <Bell className="icon-sm text-gray-600" />
              </button>
              <Badge className="pointer-events-none absolute -right-0.5 -top-1.5 z-[1] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-(--brand-500) to-(--brand-400) px-1.5 text-[0.85rem] font-medium text-white shadow-[0_2px_8px_rgb(253_94_75/0.22)]">
                4
              </Badge>
              {isNotiOpen && (
                <NotificationDropdown onClose={() => setIsNotiOpen(false)} />
              )}
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={() => router.push("/profile")}
            >
              <CircleUserRound className="icon-sm text-gray-600" />
            </button>
            <Button
              className="rounded-xl bg-linear-to-br from-(--brand-500) via-(--brand-400) to-(--brand-300) px-6 py-2 text-base font-medium text-white shadow-[0_4px_24px_rgb(253_94_75/0.2)] hover:bg-linear-to-br hover:from-(--brand-500) hover:to-(--brand-400)"
              onClick={() => setIsModalOpen(true)}
            >
              เพิ่มโปรเจกต์
            </Button>
            <div className="icon-btn">
              <LogOut className="icon-sm text-[var(--brand-500)]" />
            </div>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            <div className="icon-btn">
              {open ? <X className="icon-sm" /> : <Menu className="icon-sm" />}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t bg-white px-6 py-4 space-y-4">
          {menuItems.map(({ key, label }) => (
            <button
              key={label}
              className="block w-full text-left text-nav"
              onClick={() => router.push(key === "home" ? "/" : "/my-project")}
            >
              {label}
            </button>
          ))}
          <Button
            className="w-full rounded-xl bg-linear-to-br from-(--brand-500) via-(--brand-400) to-(--brand-300) px-6 py-2 text-base font-medium text-white shadow-[0_4px_24px_rgb(253_94_75/0.2)] hover:bg-linear-to-br hover:from-(--brand-500) hover:to-(--brand-400)"
            onClick={() => setIsModalOpen(true)}
          >
            เพิ่มโปรเจกต์
          </Button>
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setIsNotiOpen((prev) => !prev)}
            >
              <Bell className="icon-sm text-gray-600" />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => router.push("/profile")}
            >
              <CircleUserRound className="icon-sm text-gray-600" />
            </button>
            <LogOut className="icon-sm text-[var(--brand-500)]" />
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </nav>
  );
}
