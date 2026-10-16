import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/current-session";

export async function getAdminSession(): Promise<boolean> {
  const session = await getCurrentSession();
  return session?.isAdmin === true;
}

export async function requireAdmin() {
  if (!(await getAdminSession())) redirect("/admin/login");
}
