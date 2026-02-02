import ProjectCard from "./ProjectCard";

type Project = {
  title: string;
  org: string;
  description: string;
  positions: string[];
  skills: string[];
  status: "open" | "closed";
  openRoles: string;
};

export default function ProjectFeed({ projects }: { projects: Project[] }) {
  return (
    <section className="feed space-y-6">
      {projects.map((p) => (
        <ProjectCard key={p.title} project={p} />
      ))}
    </section>
  );
}
