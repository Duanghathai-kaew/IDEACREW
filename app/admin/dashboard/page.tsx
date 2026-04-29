import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  adminProjects,
  formatReadableDate,
  getDashboardSummary,
} from "@/lib/admin/mock-data";

export default function AdminDashboardPage() {
  const summary = getDashboardSummary(adminProjects);
  const totalProjects = adminProjects.length;
  const latestProjects = [...adminProjects]
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )
    .slice(0, 10);

  const cards = [
    { label: "All Projects", value: totalProjects, className: "text-slate-900" },
    { label: "Pending Review", value: summary.pending, className: "text-amber-600" },
    { label: "Approved", value: summary.approved, className: "text-emerald-600" },
    { label: "Rejected", value: summary.rejected, className: "text-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Dashboard"
        description="Overview of project review status across the platform."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${card.className}`}>{card.value}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Recent Projects</h2>
          <p className="mt-1 text-sm text-slate-500">Showing latest 10 submissions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Project
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Submitted By
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Deadline
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {latestProjects.map((project) => (
                <tr key={project.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{project.name}</p>
                    <p className="text-xs text-slate-400">{project.id}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{project.submittedBy}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatReadableDate(project.submittedAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatReadableDate(project.deadline)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={project.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
