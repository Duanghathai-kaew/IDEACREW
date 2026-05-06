"use client";

import Navbar from "@/components/Navbar";
import ProfilePage from "@/components/ProfilePage";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProfileData } from "@/lib/mockData";
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
      {user && (
        <ProfilePage
          editable
          userId={user.id}
          initialProfile={buildInitialProfileFromUser(user)}
        />
      )}
    </>
  );
}

function buildInitialProfileFromUser(user: {
  id: string;
  name: string;
  email: string;
  tuId?: string;
}): ProfileData {
  return {
    id: user.id,
    name: user.name ?? "",
    headline: "",
    status: "",
    faculty: "",
    major: "",
    year: "",
    studentId: user.tuId ?? "",
    email: user.email ?? "",
    phone: "",
    location: "",
    bio: "",
    skills: [],
    interests: [],
    portfolioLinks: [],
    socialLinks: [],
    projects: [],
  };
}
