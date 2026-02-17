import ProjectCard from "./ProjectCard";
import { SimpleProject } from "@/lib/simpleMockData";

export default function ProjectFeed({
  projects,
}: {
  projects: SimpleProject[];
}) {
  return (
    <section className="feed space-y-6">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </section>
  );
}
