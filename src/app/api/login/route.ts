import { NextResponse } from "next/server";
import { loginDemoUser } from "@/lib/auth/demo-login";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/features/auth/services/session.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body?.username !== "string" || typeof body?.password !== "string" || !body.username.trim() || !body.password.trim()) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }
  const result = await loginDemoUser(body.username, body.password);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  const response = NextResponse.json({ ok: true, user: result.user });
  response.cookies.set(SESSION_COOKIE_NAME, result.token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: SESSION_MAX_AGE_SECONDS,
  });
  response.cookies.delete("admin_session");
  return response;
}
