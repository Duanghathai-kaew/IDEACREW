"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function GuestAccessGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isHomePage = pathname === "/";

  useEffect(() => {
    if (isLoading) return;
    if (!user && !isHomePage) {
      router.replace("/");
    }
  }, [isHomePage, isLoading, router, user]);

  if (isLoading && !isHomePage) {
    return null;
  }

  if (!user && !isHomePage) {
    return null;
  }

  return <>{children}</>;
}
