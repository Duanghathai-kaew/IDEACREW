"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/components/layout/navbar";
import { GuestAccessGate } from "@/features/auth/components/guest-access-gate";

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <GuestAccessGate>{children}</GuestAccessGate>
    </>
  );
}
