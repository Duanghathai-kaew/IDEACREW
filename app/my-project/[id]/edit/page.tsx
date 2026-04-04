"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import Navbar from "@/components/Navbar";
import { MyProjectStatus } from "@/lib/myProjectMockData";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type EditProjectResponse = {
  data?: {
    id: string;
    title: string;
    summary: string;
    status: MyProjectStatus;
    applicationEndDate: string;
  };
  error?: string;
};

const statusOptions: Array<{ value: MyProjectStatus; label: string }> = [
  { value: "draft", label: "แบบร่าง" },
  { value: "pending_approval", label: "รอการอนุมัติ" },
  { value: "approved", label: "อนุมัติแล้ว" },
  { value: "open", label: "เปิดรับสมัคร" },
  { value: "reviewing", label: "กำลังคัดเลือก" },
  { value: "closed", label: "ปิดรับแล้ว" },
  { value: "rejected_by_admin", label: "ตีกลับโดยแอดมิน" },
];

export default function EditMyProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id ?? "";
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<MyProjectStatus>("draft");
  const [applicationEndDate, setApplicationEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchProject() {
      if (!user?.id || !projectId) return;

      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/my-projects/${projectId}?ownerId=${encodeURIComponent(user.id)}`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch project");
        }

        const result = (await response.json()) as EditProjectResponse;
        if (!mounted || !result.data) return;

        setTitle(result.data.title);
        setSummary(result.data.summary);
        setStatus(result.data.status);
        setApplicationEndDate(result.data.applicationEndDate);
      } catch {
        if (!mounted) return;
        router.push("/my-project");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProject();

    return () => {
      mounted = false;
    };
  }, [projectId, router, user?.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.id || !projectId || isSaving) return;

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/my-projects/${projectId}?ownerId=${encodeURIComponent(user.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            summary,
            status,
            applicationEndDate,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save project");
      }

      router.push("/my-project");
    } catch {
      // Keep form values so user can retry without losing edits.
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="mb-6">
          <Link href="/my-project" className="text-sm text-slate-500 hover:text-slate-700">
            กลับไปหน้าโปรเจกต์ของฉัน
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">แก้ไขแบบร่าง</h1>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500">
            กำลังโหลดข้อมูลโปรเจกต์...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-700">
                ชื่อโปรเจกต์
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-(--brand-400)"
                required
              />
            </div>

            <div>
              <label htmlFor="summary" className="mb-2 block text-sm font-medium text-slate-700">
                สรุปโปรเจกต์
              </label>
              <textarea
                id="summary"
                rows={4}
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-(--brand-400)"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="status" className="mb-2 block text-sm font-medium text-slate-700">
                  สถานะ
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as MyProjectStatus)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-(--brand-400)"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="applicationEndDate"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  วันปิดรับสมัคร
                </label>
                <input
                  id="applicationEndDate"
                  type="date"
                  value={applicationEndDate}
                  onChange={(event) => setApplicationEndDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-(--brand-400)"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/my-project"
                className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-brand-500 via-brand-400 to-brand-300 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}
