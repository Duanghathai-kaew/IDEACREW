import ProjectCard from "./ProjectCard";

type Position = {
  role: string;
  needed: number;
  skills: string[];
};

type Project = {
  id: string;
  title: string;
  org: string;
  description: string;
  status: "open" | "closed";
  category: string[];
  positions: Position[];
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
