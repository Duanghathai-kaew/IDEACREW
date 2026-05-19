"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/components/layout/navbar";
import { GuestAccessGate } from "@/features/auth/components/guest-access-gate";

const ROUTES_WITHOUT_NAVBAR = new Set(["/login", "/home"]);

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = !ROUTES_WITHOUT_NAVBAR.has(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <GuestAccessGate>{children}</GuestAccessGate>
    </>
  );
}
