import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { supabaseAdmin } from "@/lib/supabase/admin";

type AdminTag = {
  id: string;
  name: string;
  type: "skill" | "category";
  usageCount: number;
  status: "enabled" | "disabled";
};

export default async function AdminTagsPage() {
  const [categoriesRes, skillsRes] = await Promise.all([
    supabaseAdmin.from("project_categories").select("category_name"),
    supabaseAdmin.from("project_position_skills").select("skill_name"),
  ]);

  const categoryCounts = new Map<string, number>();
  for (const row of (categoriesRes.data ?? []) as Array<{
    category_name: string;
  }>) {
    const name = row.category_name.trim();
    if (!name) continue;
    categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
  }

  const skillCounts = new Map<string, number>();
  for (const row of (skillsRes.data ?? []) as Array<{ skill_name: string }>) {
    const name = row.skill_name.trim();
    if (!name) continue;
    skillCounts.set(name, (skillCounts.get(name) ?? 0) + 1);
  }

  const adminTags: AdminTag[] = [
    ...Array.from(categoryCounts.entries()).map(
      ([name, usageCount], index) => ({
        id: `category-${index}-${name}`,
        name,
        type: "category" as const,
        usageCount,
        status: usageCount > 0 ? ("enabled" as const) : ("disabled" as const),
      }),
    ),
    ...Array.from(skillCounts.entries()).map(([name, usageCount], index) => ({
      id: `skill-${index}-${name}`,
      name,
      type: "skill" as const,
      usageCount,
      status: usageCount > 0 ? ("enabled" as const) : ("disabled" as const),
    })),
  ].sort((a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Tag Management"
        description="Manage skills and categories used by project owners."
      />

      {(categoriesRes.error || skillsRes.error) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {categoriesRes.error?.message || skillsRes.error?.message}
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
