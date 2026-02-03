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

export default function ProjectCard({ project }: { project: Project }) {
  const avatar = project.org.slice(0, 2).toUpperCase();

  return (
    <div className="project-card" style={{ display: "flex" }}>
      {/* ===== LEFT ===== */}
      <div
        className="project-left"
        style={{ flexBasis: "60%", maxWidth: "60%" }}
      >
        <div className="project-avatar">{avatar}</div>
        <div>
          <h3 className="project-title">{project.title}</h3>
          <p className="project-org">by ทีม {project.org}</p>
          <p className="project-desc">{project.description}</p>
        </div>
      </div>

      {/* ===== RIGHT ===== */}
      <div
        className="project-right"
        style={{ flexBasis: "40%", maxWidth: "40%" }}
      >
        <div className="project-status">
          <span className={`status ${project.status}`}>
            {project.status === "open" ? "เปิดรับ" : "ปิดรับ"}
          </span>
        </div>
        <div
          className="project-info"
          style={{ alignItems: "flex-start", textAlign: "left" }}
        >
          <p className="label" style={{ textAlign: "left" }}>
            ตำแหน่งที่ต้องการ
          </p>
          <div
            className="skill-list"
            style={{ justifyContent: "flex-start", flexWrap: "wrap" }}
          >
            {project.positions.map((pos) => (
              <span
                key={pos.role}
                className="skill"
                style={{ marginBottom: "4px" }}
              >
                {pos.role} ({pos.needed} คน)
              </span>
            ))}
          </div>
          {/* หมวดหมู่ */}
          {project.category.length > 0 && (
            <div style={{ marginTop: "12px" }}>
              <p
                className="label"
                style={{ textAlign: "left", marginBottom: "6px" }}
              >
                หมวดหมู่
              </p>
              <div
                className="skill-list"
                style={{ justifyContent: "flex-start" }}
              >
                {project.category.map((cat) => (
                  <span key={cat} className="skill">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <button className="btn-detail" disabled={project.status === "closed"}>
          ดูรายละเอียด →
        </button>
      </div>
    </div>
  );
}
