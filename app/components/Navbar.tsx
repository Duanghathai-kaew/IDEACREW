"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CircleUserRound, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [active, setActive] = useState<"home" | "my-project">("home");
  const [open, setOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        {/* LEFT */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className={styles.logo}>
            <div className={styles.logoIcon}>IC</div>
            <span className="text-logo font-semibold text-orange-500">
              IDEACREW
            </span>
          </div>

          {/* Desktop menu */}
          <div className={`${styles.menu} hidden md:flex`}>
            <NavItem
              active={active === "home"}
              onClick={() => setActive("home")}
            >
              หน้าหลัก
            </NavItem>

            <NavItem
              active={active === "my-project"}
              onClick={() => setActive("my-project")}
            >
              โปรเจกต์ของฉัน
            </NavItem>
          </div>
        </div>

        {/* RIGHT (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <div className={styles.bellWrapper}>
            <IconButton>
              <Bell className="icon-sm text-gray-600" />
            </IconButton>
            <Badge className={styles.badge}>4</Badge>
          </div>

          <IconButton>
            <CircleUserRound className="icon-sm text-gray-600" />
          </IconButton>

          <Button className={styles.postButton}>โพสต์โปรเจกต์</Button>

          <IconButton>
            <LogOut className="icon-sm text-orange-500" />
          </IconButton>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden icon-btn"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="icon-sm" /> : <Menu className="icon-sm" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white px-6 py-4 space-y-4">
          <button className="block w-full text-left text-nav">หน้าหลัก</button>
          <button className="block w-full text-left text-nav">
            โปรเจกต์ของฉัน
          </button>

          <Button className={styles.postButton + " w-full"}>
            โพสต์โปรเจกต์
          </Button>

          <div className="flex items-center gap-4 pt-2">
            <Bell className="icon-sm text-gray-600" />
            <CircleUserRound className="icon-sm text-gray-600" />
            <LogOut className="icon-sm text-orange-500" />
          </div>
        </div>
      )}
    </nav>
  );
}

/* ======================
   Helper Components
====================== */

function NavItem({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-nav ${active ? styles.menuActive : styles.menuInactive}`}
    >
      {children}
    </button>
  );
}

function IconButton({ children }: { children: React.ReactNode }) {
  return <div className="icon-btn">{children}</div>;
}
