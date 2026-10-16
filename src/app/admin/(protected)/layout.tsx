import { requireAdmin } from "@/lib/auth/admin-session";

import { AdminNavbar } from "@/features/admin/components/admin-navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
