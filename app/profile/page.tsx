"use client";

import Navbar from "@/components/Navbar";
import ProfilePage from "@/components/ProfilePage";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [isLoading, router, user]);

  return (
    <>
      <Navbar />
      {user && <ProfilePage editable userId={user.id} />}
    </>
  );
}
