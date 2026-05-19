"use client";

import { LoginForm } from "@/features/auth/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-pink-50 via-pink-50 to-slate-50 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
            <Image
              src="/logo.svg"
              alt="IDEACREW logo"
              width={80}
              height={80}
              className="h-full w-full object-contain drop-shadow-md"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">IDEACREW</h1>
          <p className="mt-2 text-sm text-slate-600">
            แพลตฟอร์มสำหรับนักศึกษาค้นหาและเข้าร่วมโปรเจกต์
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-md">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-500">
          © 2025 IDEACREW. สงวนลิขสิทธิ์
        </p>
      </div>
    </main>
  );
}
