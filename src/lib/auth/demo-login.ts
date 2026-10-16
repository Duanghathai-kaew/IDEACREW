import "server-only";
import { timingSafeEqual } from "node:crypto";
import { supabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSessionToken } from "@/features/auth/services/session.service";

const DEFAULT_DEMO_USER_ID = "e68cc396-34e4-4a9f-aa8b-8819c07812ca";
const PROFILE_COLUMNS = "id,name,displayname,email,student_id,username";

function matches(actual: string, expected: string) {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function loginDemoUser(
  username: string,
  password: string,
  options: { adminOnly?: boolean } = {},
) {
  const identifier = username.trim();
  const expectedUsername = process.env.ADMIN_USERNAME?.trim();
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!process.env.SESSION_SECRET?.trim()) {
    return { ok: false as const, status: 500, error: "Login is not configured" };
  }

  const invalidLogin = {
    ok: false as const, status: 401, error: "Invalid username or password",
  };
  const isAdmin = Boolean(expectedUsername && matches(identifier, expectedUsername));
  const demoPassword = process.env.DEMO_USER_PASSWORD?.trim();
  if (isAdmin) {
    if (!expectedPassword || !matches(password.trim(), expectedPassword)) return invalidLogin;
  } else if (
    options.adminOnly || !demoPassword ||
    !/^\d{8,10}$/.test(identifier) || !matches(password.trim(), demoPassword)
  ) {
    return invalidLogin;
  }

  // Prefer the original TU username. Profile student_id can have been edited later.
  let result = isAdmin
    ? await supabaseAdminClient.from("profiles").select(PROFILE_COLUMNS)
        .eq("id", process.env.ADMIN_USER_ID?.trim() || DEFAULT_DEMO_USER_ID).maybeSingle()
    : await supabaseAdminClient.from("profiles").select(PROFILE_COLUMNS)
        .eq("username", identifier).maybeSingle();

  if (!isAdmin && !result.error && !result.data) {
    // Older profiles may only contain student_id; never guess between duplicates.
    result = await supabaseAdminClient.from("profiles").select(PROFILE_COLUMNS)
      .eq("student_id", identifier).or("username.is.null,username.eq.").maybeSingle();
  }
  const { data: profile, error } = result;
  if (error) {
    return { ok: false as const, status: 503, error: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองอีกครั้ง" };
  }
  if (!profile) {
    if (!isAdmin) return invalidLogin;
    return { ok: false as const, status: 500, error: "ไม่พบโปรไฟล์เดิม กรุณาตรวจสอบ ADMIN_USER_ID" };
  }
  const user = {
    id: profile.id as string,
    name: profile.displayname || profile.name || identifier,
    email: profile.email || "",
    tuId: isAdmin ? (profile.username || profile.student_id || identifier) : identifier,
    role: isAdmin ? "staff" as const : "student" as const,
  };
  const token = await createSessionToken({
    userId: user.id, name: user.name, email: user.email, tuId: user.tuId,
    role: user.role, isAdmin,
  });
  return { ok: true as const, user, token };
}
