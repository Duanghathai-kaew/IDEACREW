import Link from "next/link";
import { SimpleProject } from "@/lib/simpleMockData";

export default function ProjectCard({
  project,
  index,
}: {
  project: SimpleProject;
  index: number;
}) {
  const avatar = project.org.slice(0, 2).toUpperCase();
  const isOpen = project.status === "open";

  return (
    <div
      className="group project-card-enter flex justify-between gap-6 rounded-2xl bg-white p-5 shadow-[0_6px_20px_rgb(15_23_42/0.08)] transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_34px_rgb(15_23_42/0.14)]"
      style={{
        animationDelay: `${Math.min(index * 70, 420)}ms`,
      }}
    >
      {/* ===== LEFT ===== */}
      <div className="flex basis-3/5 gap-4">
        <div className="flex h-11 w-11 shrink-0 grow-0 items-center justify-center overflow-hidden rounded-full bg-(--brand-500) text-lg font-semibold text-white transition-transform duration-300 ease-out group-hover:scale-105">
          {avatar}
        </div>
        <div>
          <h3 className="mb-1 font-semibold">{project.title}</h3>
          <p className="mb-2 text-[13px] text-slate-500">by ทีม {project.org}</p>
          <p className="mb-3 text-sm text-slate-600">{project.description}</p>
        </div>
      </div>

      {/* ===== RIGHT ===== */}
      <div className="flex min-w-[220px] w-full basis-2/5 flex-col items-end">
        <div className="mb-2 self-end">
          <span
            className={`mb-3 inline-block rounded-full px-2.5 py-1 text-xs ${
              isOpen
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {isOpen ? "เปิดรับ" : "ปิดรับ"}
          </span>
        </div>
        <div
          className="mb-2 w-full"
          style={{ alignItems: "flex-start", textAlign: "left" }}
        >
          <p className="mb-1 w-full text-left text-sm text-slate-500">
            ตำแหน่งที่ต้องการ
          </p>
          <div
            className="mb-3 flex flex-wrap justify-start gap-1.5"
            style={{ justifyContent: "flex-start", flexWrap: "wrap" }}
          >
            {project.positions.map((pos) => (
              <span
                key={pos.role}
                className="rounded-full bg-amber-100 px-2.5 py-1 text-xs transition-colors duration-200 hover:bg-amber-200"
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
                className="mb-1.5 w-full text-left text-sm text-slate-500"
                style={{ textAlign: "left", marginBottom: "6px" }}
              >
                หมวดหมู่
              </p>
              <div
                className="mb-3 flex flex-wrap justify-start gap-1.5"
                style={{ justifyContent: "flex-start" }}
              >
                {project.category.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-amber-100 px-2.5 py-1 text-xs transition-colors duration-200 hover:bg-amber-200"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <Link href={`/project/${project.id}`}>
          <button
            className="mt-4 w-full box-border rounded-xl bg-linear-to-r from-(--brand-500) via-(--brand-400) to-(--brand-300) px-4 py-2.5 text-sm text-white transition-transform duration-200 hover:scale-[1.02]"
          >
            ดูรายละเอียด →
          </button>
        </Link>
      </div>
    </div>
  );
}
