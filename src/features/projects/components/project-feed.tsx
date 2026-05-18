import ProjectCard from "./project-card";
import { SimpleProject } from "@/features/projects/services/simple-project-mock-data";

export default function ProjectFeed({
  projects,
}: {
  projects: SimpleProject[];
}) {
  return (
    <section className="flex flex-col gap-6 space-y-6">
      {projects.map((p, index) => (
        <ProjectCard key={p.id} project={p} index={index} />
      ))}
    </section>
  );
}
