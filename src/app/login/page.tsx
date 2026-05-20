"use client";

import SiteFooter from "@/components/layout/site-footer";
import { LoginForm } from "@/features/auth/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-linear-to-br from-pink-50 via-pink-50 to-slate-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-md flex-1">
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
            <Image
              src="/logo.svg"
              alt="IDEACREW logo"
              width={80}
              height={80}
              className="h-full w-full object-contain drop-shadow-md"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            IDEACREW
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            แพลตฟอร์มสำหรับนักศึกษาค้นหาและเข้าร่วมโปรเจกต์
          </p>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-md sm:p-8">
          <LoginForm />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
