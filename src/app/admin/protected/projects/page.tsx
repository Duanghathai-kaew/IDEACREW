import { PageHeader } from "@/features/admin/components/page-header";
import { ProjectsTable } from "@/features/admin/components/projects-table";

export default function AdminProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Project Registry"
        description="Review and manage submitted projects before publication."
      />
      <ProjectsTable />
    </div>
  );
}
