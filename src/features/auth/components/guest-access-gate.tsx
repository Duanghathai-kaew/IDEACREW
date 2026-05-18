"use client";

import { useAuth } from "@/features/auth/components/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function GuestAccessGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isGuestAllowedPath = pathname === "/" || pathname === "/login";

  useEffect(() => {
    if (isLoading) return;
    if (!user && !isGuestAllowedPath) {
      router.replace("/login");
    }
  }, [isGuestAllowedPath, isLoading, router, user]);

  if (isLoading && !isGuestAllowedPath) {
    return null;
  }

  if (!user && !isGuestAllowedPath) {
    return null;
  }

  return <>{children}</>;
}
