import { PageHeader } from "@/features/admin/components/page-header";
import { getAdminTagsService } from "@/features/admin/services/get-admin-tags.service";
import { Badge } from "@/components/ui/badge";

export default async function AdminTagsPage() {
  const { tags: adminTags, error } = await getAdminTagsService();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Tag Management"
        description="Manage skills and categories used by project owners."
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tag
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Usage
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminTags.length > 0 ? (
                adminTags.map((tag) => (
                  <tr key={tag.id}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {tag.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {tag.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {tag.usageCount}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge
                        variant="outline"
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          tag.status === "enabled"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {tag.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm text-slate-500"
                    colSpan={4}
                  >
                    No tags found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
