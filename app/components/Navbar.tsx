"use client";

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
          <div className={styles.logo}>
            <div className={styles.logoIcon}>IC</div>
            <span className="font-bold text-logo text-orange-500">
              IDEACREW
            </span>
          </div>

          {/* Desktop menu */}
          <div className={`${styles.menu} hidden md:flex`}>
            <button
              onClick={() => setActive("home")}
              className={
                active === "home" ? styles.menuActive : styles.menuInactive
              }
            >
              หน้าหลัก
            </button>

            <button
              onClick={() => setActive("my-project")}
              className={
                active === "my-project"
                  ? styles.menuActive
                  : styles.menuInactive
              }
            >
              โปรเจกต์ของฉัน
            </button>
          </div>
        </div>

        {/* RIGHT (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <IconButton>
            <Bell className="w-5 h-5 text-gray-600" />
          </IconButton>

          <IconButton>
            <CircleUserRound className="w-5 h-5 text-gray-600" />
          </IconButton>

          <Button className="bg-orange-500 hover:bg-orange-600">
            โพสต์โปรเจกต์
          </Button>

          <IconButton>
            <LogOut className="w-5 h-5 text-orange-500" />
          </IconButton>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white px-6 py-4 space-y-4">
          <button className="block w-full text-left">หน้าหลัก</button>
          <button className="block w-full text-left">โปรเจกต์ของฉัน</button>

          <Button className="w-full bg-orange-500 hover:bg-orange-600">
            โพสต์โปรเจกต์
          </Button>

          <div className="flex items-center gap-4">
            <Bell />
            <CircleUserRound />
            <LogOut />
          </div>
        </div>
      )}
    </nav>
  );
}

/* small helper component */
function IconButton({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
      {children}
    </div>
  );
}
