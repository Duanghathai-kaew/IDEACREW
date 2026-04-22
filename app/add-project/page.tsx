"use client";

import AddProjectModal from "@/components/AddProjectModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AddProjectPage() {
  const router = useRouter();
  const [draftId, setDraftId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDraftId(params.get("draftId"));
  }, []);

  return (
    <AddProjectModal
      isOpen
      onClose={() => router.push("/my-project")}
      initialDraftProjectId={draftId}
    />
  );
}
