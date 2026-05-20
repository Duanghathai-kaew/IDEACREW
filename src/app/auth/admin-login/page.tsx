import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/features/admin/components/admin-login-form";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (adminSession) {
    redirect("/admin/dashboard");
  }

  return <AdminLoginForm />;
}