type Project = {
  openRoles: string;
  title: string;
  org: string;
  description: string;
  positions: string[];
  skills: string[];
  status: "open" | "closed";
};

// Helper: extract number from openRoles string
function getOpenRoleCount(openRoles: string): string {
  const match = openRoles.match(/\d+/);
  return match ? match[0] : "-";
}

// Component: OpenRolesRow
function ProjectOpenRoles({ openRoles }: { openRoles: string }) {
  return (
    <div className="open-roles-row">
      <span className="open-roles-icon">
        {/* Lucide Users icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fd5e4b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </span>
      <span className="open-roles-count">
        {getOpenRoleCount(openRoles)}
        <span className="open-roles-unit"> คน</span>
      </span>
    </div>
  );
}

export default function ProjectCard({ project }: { project: Project }) {
  // Derive avatar from org (first 2 chars, uppercase)
  const avatar = project.org.slice(0, 2).toUpperCase();

  return (
    <div className="project-card">
      {/* ===== LEFT ===== */}
      <div className="project-left">
        <div className="project-avatar">{avatar}</div>
        <div>
          <h3 className="project-title">{project.title}</h3>
          <p className="project-org">by ทีม {project.org}</p>
          <p className="project-desc">{project.description}</p>
          <ProjectOpenRoles openRoles={project.openRoles} />
        </div>
      </div>

      {/* ===== RIGHT ===== */}
      <div className="project-right">
        <div className="project-status">
          <span className={`status ${project.status}`}>
            {project.status === "open" ? "เปิดรับ" : "ปิดรับ"}
          </span>
        </div>
        <div className="project-info">
          <p className="label">ทักษะที่ต้องการ</p>
          <div className="skill-list">
            {project.skills.map((skill) => (
              <span key={skill} className="skill">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <button className="btn-detail" disabled={project.status === "closed"}>
          ดูรายละเอียด →
        </button>
      </div>
    </div>
  );
}
