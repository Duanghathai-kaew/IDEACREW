"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/auth/admin-session";

const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().trim().min(1, "Password is required"),
});

export type AdminLoginState = {
  error: string | null;
};

export const initialAdminLoginState: AdminLoginState = {
  error: null,
};

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

  const expectedUsername = process.env.ADMIN_USERNAME?.trim();
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!expectedUsername || !expectedPassword) {
    return { error: "Admin authentication is not configured" };
  }

  const { username, password } = parsed.data;
  const isValidCredential =
    username === expectedUsername && password === expectedPassword;

  if (!isValidCredential) {
    return { error: "Invalid username or password" };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  redirect("/admin/dashboard");
}
