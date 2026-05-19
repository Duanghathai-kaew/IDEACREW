import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value === "true";
}

export async function requireAdmin() {
  const hasAdminSession = await getAdminSession();
  if (!hasAdminSession) {
    redirect("/admin/login");
  }
}
