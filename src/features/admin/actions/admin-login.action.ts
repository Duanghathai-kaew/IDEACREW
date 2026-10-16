"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminLoginSchema } from "@/features/admin/schemas/admin-login.schema";
import type { AdminLoginState } from "@/features/admin/types/admin-login.type";
import { loginDemoUser } from "@/lib/auth/demo-login";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/features/auth/services/session.service";

export async function adminLoginAction(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const parsed = adminLoginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message;
    return { error: firstError ?? "Username and password are required" };
  }

  const result = await loginDemoUser(parsed.data.username, parsed.data.password, { adminOnly: true });
  if (!result.ok) return { error: result.error };
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, result.token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE_SECONDS,
  });
  cookieStore.delete("admin_session");

  redirect("/admin/dashboard");
}
