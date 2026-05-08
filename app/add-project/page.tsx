"use client";

import AddProjectModal from "@/components/AddProjectModal";
import { useRouter, useSearchParams } from "next/navigation";

export default function AddProjectPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const draftId = searchParams.get("draftId");

  return (
    <AddProjectModal
      isOpen
      onClose={() => router.push("/my-project")}
      initialDraftProjectId={draftId}
    />
  );
}
