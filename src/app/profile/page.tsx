"use client";

import Navbar from "@/components/layout/navbar";
import ProfilePage from "@/features/profile/components/profile-page";
import { useAuth } from "@/features/auth/components/auth-provider";
import { ProfileData } from "@/features/projects/services/project-mock-data";
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
