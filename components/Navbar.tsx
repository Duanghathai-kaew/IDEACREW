"use client";

import AddProjectModal from "@/app/add-project/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CircleUserRound, LogOut, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [active, setActive] = useState<"home" | "my-project">("home");
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/my-project")) {
      setActive("my-project");
      return;
    }
    setActive("home");
  }, [pathname]);

  const menuItems = [
    { key: "home", label: "หน้าหลัก" },
    { key: "my-project", label: "โปรเจกต์ของฉัน" },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className="flex items-center w-full">
          {/* Logo */}
          <div className={styles.logo}>
            <div className={styles.logoIcon}>IC</div>
            <span className="text-logo font-semibold text-orange-500">
              IDEACREW
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="flex-1 flex justify-center">
            <div className={`${styles.menu} hidden md:flex`}>
              {menuItems.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() =>
                    router.push(key === "home" ? "/" : "/my-project")
                  }
                  className={`text-nav ${active === key ? styles.menuActive : styles.menuInactive}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <div className={styles.bellWrapper}>
              <div className="icon-btn">
                <Bell className="icon-sm text-gray-600" />
              </div>
              <Badge className={styles.badge}>4</Badge>
            </div>
            <div className="icon-btn">
              <CircleUserRound className="icon-sm text-gray-600" />
            </div>
            <Button
              className={styles.postButton}
              onClick={() => setIsModalOpen(true)}
            >
              เพิ่มโปรเจกต์
            </Button>
            <div className="icon-btn">
              <LogOut className="icon-sm text-orange-500" />
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
            className={styles.postButton + " w-full"}
            onClick={() => setIsModalOpen(true)}
          >
            เพิ่มโปรเจกต์
          </Button>
          <div className="flex items-center gap-4 pt-2">
            <Bell className="icon-sm text-gray-600" />
            <CircleUserRound className="icon-sm text-gray-600" />
            <LogOut className="icon-sm text-orange-500" />
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
