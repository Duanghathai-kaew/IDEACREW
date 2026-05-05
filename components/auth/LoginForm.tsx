"use client";

import { Button } from "@/components/ui/button";

export function LoginForm() {
  const TU_LOGIN_URL =
    process.env.NEXT_PUBLIC_TU_LOGIN_URL ?? "/api/login?redirect=true";

  function handleTULogin() {
    // Redirect the user to the TU login URL. This should initiate
    // the university's auth flow which eventually POSTs to /api/login.
    window.location.href = TU_LOGIN_URL;
  }

  return (
    <div className="w-full">
      <p className="mb-4 text-sm text-slate-600 text-center">
        เข้าสู่ระบบด้วยบัญชี TU
      </p>
      <Button
        onClick={handleTULogin}
        className="w-full rounded-xl bg-linear-to-r from-red-400 to-red-300 py-2.5 text-white font-medium"
        aria-label="Login with TU"
      >
        Login with TU
      </Button>
    </div>
  );
}
