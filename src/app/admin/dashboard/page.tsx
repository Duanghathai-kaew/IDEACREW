import { getAdminProjects } from "@/features/applications/actions/project-applications.action";
import { PageHeader } from "@/features/admin/components/page-header";
import { Badge } from "@/components/ui/badge";

function formatReadableDate(date: string) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminDashboardPage() {
  const result = await getAdminProjects();
  const projects = result.ok ? result.data : [];

  const summary = {
    total: projects.length,
    pending: projects.filter((project) => project.approvalStatus === "pending")
      .length,
    approved: projects.filter(
      (project) => project.approvalStatus === "approved",
    ).length,
    rejected: projects.filter(
      (project) => project.approvalStatus === "rejected",
    ).length,
  };

  const latestProjects = [...projects]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

  const cards = [
    {
      label: "All Projects",
      value: summary.total,
      className: "text-slate-900",
    },
    {
      label: "Pending Review",
      value: summary.pending,
      className: "text-amber-600",
    },
    {
      label: "Approved",
      value: summary.approved,
      className: "text-emerald-600",
    },
    { label: "Rejected", value: summary.rejected, className: "text-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Dashboard"
        description="Overview of project review status across the platform."
      />

      {!result.ok && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {result.error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${card.className}`}>
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Projects
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing latest 10 submissions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Project
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Deadline
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Approval
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {latestProjects.map((project) => (
                <tr key={project.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">
                      {project.title}
                    </p>
                    <p className="text-xs text-slate-400">{project.id}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {project.ownerName}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatReadableDate(project.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatReadableDate(project.applicationEndDate)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      variant="outline"
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        project.approvalStatus === "pending"
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : project.approvalStatus === "rejected"
                            ? "bg-rose-100 text-rose-700 border-rose-200"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {project.approvalStatus}
                    </Badge>
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
