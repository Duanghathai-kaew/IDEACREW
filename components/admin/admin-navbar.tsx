"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Dashboard", href: "/admin/dashboard", enabled: true },
  { label: "Projects", href: "/admin/projects", enabled: true },
  { label: "Tag Management", href: "/admin/tags", enabled: true },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = pathname.startsWith("/admin/tags")
    ? "/admin/tags"
    : pathname.startsWith("/admin/projects")
      ? "/admin/projects"
      : "/admin/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/admin/dashboard" className="text-lg font-semibold tracking-tight text-slate-900">
          IDEACREW Admin
        </Link>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            const tab = TABS.find((item) => item.href === value);
            if (!tab?.enabled) return;
            router.push(value);
          }}
          className="hidden md:block"
        >
          <TabsList className="h-auto rounded-none bg-transparent p-0">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.href}
                value={tab.href}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium",
                  activeTab === tab.href
                    ? "bg-indigo-50 text-indigo-600"
                    : tab.enabled
                      ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      : "cursor-default text-slate-300",
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
            AD
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav className="mx-auto flex w-full max-w-7xl gap-1 px-4 pb-3 md:hidden sm:px-6">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);

          if (!tab.enabled) {
            return (
              <span
                key={tab.href}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-300"
              >
                {tab.label}
              </span>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium",
                active ? "bg-indigo-50 text-indigo-600" : "text-slate-500",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
