import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/features/admin/components/page-header";
import { getAdminTagsService } from "@/features/admin/services/get-admin-tags.service";
import { supabaseAdminClient } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";
import { TagFilters } from "./tag-filters";

const statusBadgeClasses: Record<string, string> = {
  enabled: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
  disabled: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusActionLabels: Record<string, string> = {
  enable: "Enable",
  disable: "Disable",
};

async function updateTagStatusAction(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!name || !type || !status) return;

  await supabaseAdminClient
    .from("project_categories")
    .update({ status })
    .eq("category_name", name)
    .eq("type", type);

  revalidatePath("/admin/tags");
}

const typeOptions = [
  { value: "all", label: "All" },
  { value: "category", label: "Category" },
  { value: "skill", label: "Skill" },
] as const;

const statusOptions = [
  { value: "all", label: "All" },
  { value: "enabled", label: "Enabled" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "disabled", label: "Disabled" },
] as const;

type TagFilterValue = (typeof typeOptions)[number]["value"];
type StatusFilterValue = (typeof statusOptions)[number]["value"];

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams?: { type?: string; status?: string };
}) {
  const { tags: adminTags, error } = await getAdminTagsService();
  const typeFilter = (searchParams?.type ?? "all") as TagFilterValue;
  const statusFilter = (searchParams?.status ?? "all") as StatusFilterValue;

  const filteredTags = adminTags.filter((tag) => {
    if (typeFilter !== "all" && tag.type !== typeFilter) return false;
    if (statusFilter !== "all" && tag.status !== statusFilter) return false;
    return true;
  });

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

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <TagFilters
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          typeOptions={typeOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          statusOptions={statusOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tag
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  ประเภทแท็ก
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Usage
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
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
                          statusBadgeClasses[tag.status] ??
                          statusBadgeClasses.disabled
                        }`}
                      >
                        {tag.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {tag.status === "enabled" && (
                          <form action={updateTagStatusAction}>
                            <input type="hidden" name="name" value={tag.name} />
                            <input type="hidden" name="type" value={tag.type} />
                            <input
                              type="hidden"
                              name="status"
                              value="disabled"
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                            >
                              {statusActionLabels.disable}
                            </button>
                          </form>
                        )}
                        {(tag.status === "disabled" ||
                          tag.status === "rejected") && (
                          <form action={updateTagStatusAction}>
                            <input type="hidden" name="name" value={tag.name} />
                            <input type="hidden" name="type" value={tag.type} />
                            <input
                              type="hidden"
                              name="status"
                              value="enabled"
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                            >
                              {statusActionLabels.enable}
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm text-slate-500"
                    colSpan={5}
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
