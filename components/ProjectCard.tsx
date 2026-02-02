type Project = {
  openRoles: string;
  title: string;
  org: string;
  description: string;
  positions: string[];
  skills: string[];
  status: "open" | "closed";
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="project-card">
      {/* ===== LEFT ===== */}
      <div className="project-left" style={{ flex: 1, position: "relative" }}>
        {/* Status badge at top right of left section */}
        <div style={{ position: "absolute", top: 0, right: 0 }}>
          {project.status === "open" ? (
            <span className="status open">เปิดรับ</span>
          ) : (
            <span className="status closed">ปิดรับ</span>
          )}
        </div>
        <div className="project-avatar">ES</div>
        <div>
          <h3 className="project-title">{project.title}</h3>
          <p className="project-org">by ทีม {project.org}</p>
          <p className="project-desc">{project.description}</p>

          {/* Open roles and category below description */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              margin: "12px 0 0 0",
            }}
          >
            <span
              style={{
                color: "#fd5e4b",
                fontSize: 20,
                marginRight: 4,
                display: "flex",
                alignItems: "center",
              }}
            >
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
            <span className="text-sm text-gray-500">กำลังหา</span>
            <span
              style={{
                color: "#fd5e4b",
                fontWeight: 500,
                fontSize: 16,
                marginLeft: 2,
              }}
            >
              {/* แสดงเฉพาะจำนวนคนที่ต้องการหา (ดึงเลขจาก openRoles) */}
              {typeof project.openRoles === "string" &&
              project.openRoles.match(/\d+/)
                ? project.openRoles.match(/\d+/)![0]
                : (project.openRoles ?? "-")}
              <span
                style={{
                  color: "#a78a7f",
                  fontWeight: 400,
                  fontSize: 15,
                  marginLeft: 2,
                }}
              >
                {" "}
                คน
              </span>
            </span>
            {/* <span className="tag" style={{ background: '#fff3e8', color: '#fd5e4b', fontWeight: 500 }}>E-Sport</span> */}
          </div>
        </div>
      </div>

      {/* ===== RIGHT ===== */}
      <div
        className="project-right"
        style={{
          minWidth: 220,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: "100%" }}>
          {/* Skills */}
          <p
            className="text-sm text-gray-500 mb-2"
            style={{ textAlign: "right" }}
          >
            ทักษะที่ต้องการ
          </p>
          <div className="skill-list">
            {project.skills.map((skill) => (
              <span key={skill} className="skill">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <button className="btn-detail" style={{ marginTop: 16 }}>
          ดูรายละเอียด →
        </button>
      </div>
    </div>
  );
}
