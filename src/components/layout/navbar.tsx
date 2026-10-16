"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/auth-provider";
import NotificationDropdown from "@/features/notifications/components/notification-dropdown";
import AddProjectModal from "@/features/projects/components/add-project-modal";
import { Bell, CircleUserRound, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MENU_ITEMS = [
  { key: "home", label: "หน้าหลัก", href: "/" },
  { key: "my-project", label: "โปรเจกต์ของฉัน", href: "/my-project" },
] as const;

const GUEST_MENU_ITEMS = [MENU_ITEMS[0]] as const;

const NAV_BUTTON_BASE_CLASS =
  "h-11 rounded-full px-4 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2";

const NAV_BUTTON_ACTIVE_CLASS =
  "bg-rose-50 text-brand-500 shadow-[inset_0_0_0_1px_rgba(253,94,75,0.12)] hover:bg-rose-50 hover:text-brand-500";

const NAV_BUTTON_INACTIVE_CLASS =
  "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchParams = useSearchParams();

  const draftIdFromQuery = searchParams.get("draftId");
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();
  const notiRef = useRef<HTMLDivElement | null>(null);
  const active: "home" | "my-project" = pathname?.startsWith("/my-project")
    ? "my-project"
    : "home";
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isAuthenticated = mounted && Boolean(user);
  const menuItems = isAuthenticated ? MENU_ITEMS : GUEST_MENU_ITEMS;
  const shouldAutoOpenDraftModal =
    isAuthenticated &&
    pathname?.startsWith("/my-project") &&
    Boolean(draftIdFromQuery);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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

  useEffect(() => {
    let isActive = true;

    async function fetchUnreadCount() {
      if (!user?.id) {
        if (isActive) setUnreadCount(0);
        return;
      }

      try {
        const response = await fetch(
          `/api/notifications?userId=${encodeURIComponent(user.id)}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;

        const result = (await response.json()) as {
          data?: Array<{ isRead: boolean }>;
        };
        if (!isActive) return;

        setUnreadCount(
          (result.data ?? []).filter((item) => !item.isRead).length,
        );
      } catch {
        // Keep previous count when request fails.
      }
    }

    fetchUnreadCount();

    return () => {
      isActive = false;
    };
  }, [user?.id]);

  async function handleLogout() {
    await signOut();
    setOpen(false);
    router.push("/");
  }

  function requireAuth(action: () => void) {
    if (!isAuthenticated) {
      setOpen(false);
      setIsNotiOpen(false);
      router.push("/login");
      return;
    }

    action();
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    if (shouldAutoOpenDraftModal) {
      router.replace("/my-project");
    }
  }

  if (!mounted) {
    return <nav className="h-16 animate-pulse border-b bg-white" />;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      {isNotiOpen && (
        <button
          type="button"
          aria-label="Close notifications"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsNotiOpen(false)}
        />
      )}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" aria-label="Go to home" className="shrink-0">
          <Image
            src="/logo-text.svg"
            alt="IDEACREW"
            width={193}
            height={67}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex items-center gap-2">
            {menuItems.map(({ key, label, href }) => (
              <Button
                key={key}
                asChild
                variant="ghost"
                className={`${NAV_BUTTON_BASE_CLASS} ${
                  active === key
                    ? NAV_BUTTON_ACTIVE_CLASS
                    : NAV_BUTTON_INACTIVE_CLASS
                }`}
              >
                <Link
                  href={href}
                  aria-current={active === key ? "page" : undefined}
                >
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:gap-4 xl:flex">
          <div className="relative z-50 flex items-center" ref={notiRef}>
            <button
              type="button"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
              aria-label="การแจ้งเตือน"
              aria-expanded={isNotiOpen}
              onClick={() =>
                requireAuth(() => {
                  setIsNotiOpen((prev) => !prev);
                })
              }
            >
              <Bell className="icon-sm text-slate-600" />
            </button>
            {unreadCount > 0 && (
              <Badge className="pointer-events-none absolute -right-0.5 -top-1.5 z-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-brand-400 px-1.5 text-[0.85rem] font-medium text-white shadow-[0_2px_8px_rgb(253_94_75/0.22)]">
                {unreadCount}
              </Badge>
            )}
            {isNotiOpen && (
              <NotificationDropdown
                onClose={() => setIsNotiOpen(false)}
                userId={user?.id ?? ""}
                onUnreadCountChange={setUnreadCount}
              />
            )}
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
            onClick={() => requireAuth(() => router.push("/profile"))}
            aria-label="โปรไฟล์"
          >
            <CircleUserRound className="icon-sm text-slate-600" />
          </button>
          <span className="max-w-32 truncate text-sm text-slate-600">
            {isLoading ? "กำลังโหลด..." : user ? user.name : "ผู้เยี่ยมชม"}
          </span>
          <Button
            className="min-h-11 rounded-xl bg-linear-to-br from-brand-500 via-brand-400 to-brand-300 px-4 py-2 text-sm font-medium text-white shadow-[0_4px_24px_rgb(253_94_75/0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgb(253_94_75/0.24)] active:scale-[0.98] hover:bg-linear-to-br hover:from-brand-500 hover:to-brand-400 sm:px-6 sm:text-base"
            onClick={() => requireAuth(() => setIsModalOpen(true))}
          >
            เพิ่มโปรเจกต์
          </Button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 px-3 text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
            onClick={
              isAuthenticated ? handleLogout : () => router.push("/login")
            }
            aria-label={isAuthenticated ? "Logout" : "Login"}
          >
            {isAuthenticated ? (
              <LogOut className="icon-sm text-orange-500" />
            ) : (
              <span className="text-xs font-semibold text-orange-500">
                LOGIN
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 xl:hidden">
          {!isAuthenticated && (
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-full px-3 text-xs font-semibold text-orange-500 transition-all duration-200 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 sm:px-4"
              onClick={() => router.push("/login")}
            >
              LOGIN
            </button>
          )}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
            aria-expanded={open}
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="icon-sm" /> : <Menu className="icon-sm" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 top-14.25 z-40 overflow-y-auto border-t bg-white md:top-16.25 xl:hidden">
          <div className="space-y-1 px-4 py-4 sm:px-6">
            {menuItems.map(({ key, label, href }) => (
              <Button
                key={key}
                asChild
                variant="ghost"
                className={`block min-h-11 w-full justify-start rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                  active === key
                    ? "bg-rose-50 text-brand-500 shadow-[inset_0_0_0_1px_rgba(253,94,75,0.12)]"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Link
                  href={href}
                  aria-current={active === key ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </Button>
            ))}

            <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
                aria-label="การแจ้งเตือน"
                onClick={() =>
                  requireAuth(() => {
                    setIsNotiOpen((prev) => !prev);
                    setOpen(false);
                  })
                }
              >
                <Bell className="icon-sm text-slate-600" />
              </button>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
                aria-label="โปรไฟล์"
                onClick={() => requireAuth(() => router.push("/profile"))}
              >
                <CircleUserRound className="icon-sm text-slate-600" />
              </button>
              <span className="min-w-0 flex-1 truncate text-sm text-slate-600">
                {isLoading ? "กำลังโหลด..." : user ? user.name : "ผู้เยี่ยมชม"}
              </span>
              {isAuthenticated && (
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  <LogOut className="icon-sm text-orange-500" />
                </button>
              )}
            </div>

            <Button
              className="min-h-11 w-full rounded-xl bg-linear-to-br from-brand-500 via-brand-400 to-brand-300 px-6 py-2.5 text-base font-medium text-white shadow-[0_4px_24px_rgb(253_94_75/0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgb(253_94_75/0.24)] active:scale-[0.98]"
              onClick={() => requireAuth(() => setIsModalOpen(true))}
            >
              เพิ่มโปรเจกต์
            </Button>
          </div>

          {isNotiOpen && isAuthenticated && (
            <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
              <NotificationDropdown
                onClose={() => setIsNotiOpen(false)}
                userId={user?.id ?? ""}
                onUnreadCountChange={setUnreadCount}
                variant="embedded"
              />
            </div>
          )}
        </div>
      )}

      <AddProjectModal
        isOpen={isModalOpen || shouldAutoOpenDraftModal}
        onClose={handleCloseModal}
        initialDraftProjectId={
          pathname?.startsWith("/my-project") ? draftIdFromQuery : null
        }
      />
    </nav>
  );
}
