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
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Continue local sign out even if network request fails.
    }

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
    <nav className="sticky top-0 z-50 w-full overflow-visible border-b border-slate-200 bg-white">
      {isNotiOpen && (
        <button
          type="button"
          aria-label="Close notifications"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={() => setIsNotiOpen(false)}
        />
      )}
      <div className="mx-auto flex max-w-7xl items-center justify-between overflow-visible px-6 py-4">
        <div className="flex w-full items-center">
          <div className="flex items-center">
            <Link href="/" aria-label="Go to home">
              <Image
                src="/logo-text.svg"
                alt="IDEACREW"
                width={193}
                height={67}
                priority
                className="h-9 w-auto"
              />
            </Link>
          </div>

          <div className="flex flex-1 justify-center">
            <div className="hidden gap-6 md:flex">
              {menuItems.map(({ key, label, href }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => router.push(href)}
                  className={`text-nav pb-1 ${
                    active === key
                      ? "border-b-2 border-(--brand-500) text-(--brand-500)"
                      : "text-slate-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <div className="relative z-50 flex items-center" ref={notiRef}>
              <button
                type="button"
                className="icon-btn"
                onClick={() =>
                  requireAuth(() => {
                    setIsNotiOpen((prev) => !prev);
                  })
                }
              >
                <Bell className="icon-sm text-gray-600" />
              </button>
              <Badge className="pointer-events-none absolute -right-0.5 -top-1.5 z-[1] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-(--brand-500) to-(--brand-400) px-1.5 text-[0.85rem] font-medium text-white shadow-[0_2px_8px_rgb(253_94_75/0.22)]">
                {unreadCount}
              </Badge>
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
              className="icon-btn"
              onClick={() => requireAuth(() => router.push("/profile"))}
            >
              <CircleUserRound className="icon-sm text-gray-600" />
            </button>
            <span className="text-sm text-slate-600">
              {isLoading ? "กำลังโหลด..." : user ? user.name : "ผู้เยี่ยมชม"}
            </span>
            <Button
              className="rounded-xl bg-linear-to-br from-(--brand-500) via-(--brand-400) to-(--brand-300) px-6 py-2 text-base font-medium text-white shadow-[0_4px_24px_rgb(253_94_75/0.2)] hover:bg-linear-to-br hover:from-(--brand-500) hover:to-(--brand-400)"
              onClick={() => requireAuth(() => setIsModalOpen(true))}
            >
              เพิ่มโปรเจกต์
            </Button>
            <button
              type="button"
              className="icon-btn"
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

          <button
            type="button"
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            <div className="icon-btn">
              {open ? <X className="icon-sm" /> : <Menu className="icon-sm" />}
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t bg-white px-6 py-4 md:hidden">
          {menuItems.map(({ key, label, href }) => (
            <button
              key={key}
              type="button"
              className="block w-full text-left text-nav"
              onClick={() => {
                router.push(href);
                setOpen(false);
              }}
            >
              {label}
            </button>
          ))}
          <Button
            className="w-full rounded-xl bg-linear-to-br from-(--brand-500) via-(--brand-400) to-(--brand-300) px-6 py-2 text-base font-medium text-white shadow-[0_4px_24px_rgb(253_94_75/0.2)] hover:bg-linear-to-br hover:from-(--brand-500) hover:to-(--brand-400)"
            onClick={() => requireAuth(() => setIsModalOpen(true))}
          >
            เพิ่มโปรเจกต์
          </Button>
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              className="icon-btn"
              onClick={() =>
                requireAuth(() => {
                  setIsNotiOpen((prev) => !prev);
                })
              }
            >
              <Bell className="icon-sm text-gray-600" />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => requireAuth(() => router.push("/profile"))}
            >
              <CircleUserRound className="icon-sm text-gray-600" />
            </button>
            <button
              type="button"
              className="icon-btn"
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
            <span className="text-sm text-slate-600">
              {isLoading ? "กำลังโหลด..." : user ? user.name : "ผู้เยี่ยมชม"}
            </span>
          </div>
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
