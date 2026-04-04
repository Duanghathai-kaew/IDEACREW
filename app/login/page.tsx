"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { signInForDevelopment } = useAuth();

  async function handleMockSignIn() {
    await signInForDevelopment();
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#FFF9F6] px-6 py-16">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-500">
          Login Placeholder
        </p>
        <h1 className="text-2xl font-bold text-slate-800">ยังไม่เปิดใช้งานระบบ Login</h1>
        <p className="mt-3 text-sm text-slate-600">
          หน้านี้เตรียมไว้สำหรับเชื่อมต่อ API มหาวิทยาลัยในลำดับถัดไป ตอนนี้สามารถพัฒนาหน้าอื่นได้ต่อทันที
          โดยไม่บังคับเข้าสู่ระบบ
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="rounded-xl bg-linear-to-br from-(--brand-500) via-(--brand-400) to-(--brand-300) px-6 py-2 text-white"
            onClick={handleMockSignIn}
          >
            เข้าใช้งานด้วย Mock User
          </Button>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-slate-200 px-6 py-2 text-sm font-medium text-slate-700"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </main>
  );
}
