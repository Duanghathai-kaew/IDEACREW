import { getAdminSession } from "@/lib/auth/admin-session";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/features/admin/components/admin-login-form";

export default async function AdminLoginPage() {
  const adminSession = await getAdminSession();

  if (adminSession) {
    redirect("/admin/dashboard");
  }

  return <AdminLoginForm />;
}