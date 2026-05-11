import Navbar from "@/components/Navbar";
import { ProjectApplicationControls } from "@/components/applications/ProjectApplicationControls";
import { RecruitmentProgressSection } from "@/components/applications/RecruitmentProgressSection";
import { TeamMembersSection } from "@/components/applications/TeamMembersSection";
import {
  formatThaiDate,
  getBenefitLabel,
  getWorkModeLabel,
} from "@/lib/detailedMockData";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Benefit, Project } from "@/types/project";
import {
  ArrowLeft,
  Award,
  Calendar,
  Clock,
  FileText,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

type DbProject = {
  id: string;
  owner_id: string;
  title: string;
  summary: string | null;
  description: string | null;
  work_mode: string | null;
  working_hours: string | null;
  application_start_date: string | null;
  application_end_date: string | null;
  benefits: string[] | null;
  compensation_detail: string | null;
  status: string | null;
  created_at: string | null;
};

type DbProfile = {
  name: string | null;
};

type DbPosition = {
  id: string;
  project_id: string;
  title: string;
  needed_count: number;
  preferred_qualifications: string | null;
};

type DbCategory = {
  category_name: string;
};

type DbPositionSkill = {
  position_id: string;
  skill_name: string;
};

type DbBasicQualification = {
  position_id: string;
  qualification_text: string;
};

const allowedBenefits: Benefit[] = [
  "certificate",
  "experience",
  "portfolio",
  "compensation",
  "network",
];

function mapBenefitArray(raw: string[] | null): Benefit[] {
  if (!raw) return [];
  return raw.filter((item): item is Benefit =>
    allowedBenefits.includes(item as Benefit),
  );
}

function mapProjectStatus(status: string | null): Project["status"] {
  switch (status) {
    case "draft":
    case "pending_approval":
    case "rejected_by_admin":
    case "approved":
    case "open":
    case "reviewing":
    case "closed":
      return status;
    default:
      return "closed";
  }
}

function mapWorkMode(mode: string | null): Project["workMode"] {
  if (mode === "onsite" || mode === "hybrid" || mode === "online") return mode;
  return "online";
}

async function getProjectFromDb(id: string): Promise<Project | null> {
  const { data: project, error } = await supabaseAdmin
    .from("projects")
    .select(
      "id,owner_id,title,summary,description,work_mode,working_hours,application_start_date,application_end_date,benefits,compensation_detail,status,created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !project) return null;

  const projectRow = project as DbProject;
  const { data: approvalRow } = await supabaseAdmin
    .from("projects")
    .select("approval_status")
    .eq("id", id)
    .maybeSingle();
  const approvalStatus =
    approvalRow &&
    typeof approvalRow === "object" &&
    "approval_status" in approvalRow &&
    (approvalRow.approval_status === "pending" ||
      approvalRow.approval_status === "approved" ||
      approvalRow.approval_status === "rejected")
      ? approvalRow.approval_status
      : "approved";

  const [{ data: profile }, { data: categories }, { data: positions }] =
    await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("name")
        .eq("id", projectRow.owner_id)
        .maybeSingle(),
      supabaseAdmin
        .from("project_categories")
        .select("category_name")
        .eq("project_id", id),
      supabaseAdmin
        .from("project_positions")
        .select("id,project_id,title,needed_count,preferred_qualifications")
        .eq("project_id", id),
    ]);

  const positionRows = (positions as DbPosition[] | null) ?? [];
  const positionIds = positionRows.map((p) => p.id);

  const [positionSkillsResult, basicQualificationsResult] =
    positionIds.length === 0
      ? [{ data: [] }, { data: [] }]
      : await Promise.all([
          supabaseAdmin
            .from("project_position_skills")
            .select("position_id,skill_name")
            .in("position_id", positionIds),
          supabaseAdmin
            .from("project_position_basic_qualifications")
            .select("position_id,qualification_text")
            .in("position_id", positionIds),
        ]);

  const profileRow = (profile as DbProfile | null) ?? null;
  const skillRows =
    (positionSkillsResult.data as DbPositionSkill[] | null) ?? [];
  const qualificationRows =
    (basicQualificationsResult.data as DbBasicQualification[] | null) ?? [];

  const skillsByPosition = new Map<string, string[]>();
  for (const row of skillRows) {
    const curr = skillsByPosition.get(row.position_id) ?? [];
    curr.push(row.skill_name);
    skillsByPosition.set(row.position_id, curr);
  }

  const qualificationsByPosition = new Map<string, string[]>();
  for (const row of qualificationRows) {
    const curr = qualificationsByPosition.get(row.position_id) ?? [];
    curr.push(row.qualification_text);
    qualificationsByPosition.set(row.position_id, curr);
  }

  return {
    id: projectRow.id,
    ownerId: projectRow.owner_id,
    title: projectRow.title,
    categories: ((categories as DbCategory[] | null) ?? []).map(
      (row) => row.category_name,
    ),
    summary: projectRow.summary ?? "",
    description: projectRow.description ?? "",
    workMode: mapWorkMode(projectRow.work_mode),
    workingHours: projectRow.working_hours ?? undefined,
    applicationStartDate: projectRow.application_start_date ?? "2025-01-01",
    applicationEndDate: projectRow.application_end_date ?? "2025-01-01",
    benefits: mapBenefitArray(projectRow.benefits),
    compensationDetail: projectRow.compensation_detail ?? "",
    status: mapProjectStatus(projectRow.status),
    approvalStatus,
    positions: positionRows.map((pos) => ({
      id: pos.id,
      projectId: pos.project_id,
      title: pos.title,
      neededCount: pos.needed_count,
      skills: skillsByPosition.get(pos.id) ?? [],
      basicQualifications: qualificationsByPosition.get(pos.id) ?? [],
      preferredQualifications: pos.preferred_qualifications ?? undefined,
    })),
    createdBy: profileRow?.name ?? "Unknown Team",
    createdAt: projectRow.created_at ?? new Date().toISOString(),
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const dbProject = await getProjectFromDb(id);

  if (!dbProject) {
    notFound();
  }

  const project = dbProject;

  const avatar = project.createdBy.slice(0, 2).toUpperCase();
  const isOpen = project.status === "open";
  const projectSkills = Array.from(
    new Set(project.positions.flatMap((position) => position.skills)),
  );

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen"
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #e8f4ff 100%)",
        }}
      >
        <div
          className="bg-white border-b"
          style={{ borderColor: "rgba(0, 0, 0, 0.06)" }}
        >
          <div className="max-w-6xl mx-auto px-6 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับไปหน้าหลัก
            </Link>

            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{
                  background:
                    "linear-gradient(90deg, var(--brand-500) 0%, var(--brand-400) 50%, var(--brand-300) 100%)",
                }}
              >
                {avatar}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h1>
                <p className="text-gray-600 mb-2">{project.summary}</p>
                <p className="text-gray-500 text-sm mb-3">
                  โดย {project.createdBy.replace(/_/g, " ")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-orange-50 px-2.5 py-1 text-xs text-(--brand-500)"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-xs ${
                    project.approvalStatus === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : project.approvalStatus === "rejected"
                        ? "bg-rose-100 text-rose-700"
                        : project.status === "closed"
                          ? "bg-slate-100 text-slate-600"
                          : isOpen
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {project.approvalStatus === "pending"
                    ? "รออนุมัติจากแอดมิน"
                    : project.approvalStatus === "rejected"
                      ? "ถูกปฏิเสธ"
                      : project.status === "closed"
                        ? "ปิดรับสมัครแล้ว"
                        : isOpen
                          ? "เปิดรับสมัคร"
                          : "ปิดรับสมัครแล้ว"}
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
                  <h2 className="mb-4 text-lg font-semibold text-slate-700">
                    รายละเอียดโปรเจกต์
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
                  <h2 className="mb-4 text-lg font-semibold text-slate-700">
                    ตำแหน่งงานที่เปิดรับ
                  </h2>

                  <div className="space-y-8">
                    {project.positions.map((position, index) => (
                      <div
                        key={position.id}
                        className="relative rounded-xl border border-(--form-border) bg-white p-4"
                      >
                        <div className="mb-4">
                          <h3
                            className="text-xl font-semibold mb-2"
                            style={{ color: "var(--form-text-primary)" }}
                          >
                            {position.title}
                          </h3>
                          <p className="text-gray-600">
                            จำนวน:{" "}
                            <span
                              className="font-medium"
                              style={{ color: "var(--form-primary)" }}
                            >
                              {position.neededCount} คน
                            </span>
                          </p>
                        </div>

                        <div className="mb-4">
                          <h4 className="mb-2 block text-sm font-medium text-slate-700">
                            ทักษะที่ต้องการ:
                          </h4>
                          <div className="mb-2 flex flex-wrap gap-2">
                            {position.skills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-2 rounded-2xl bg-[#fff1ee] px-3 py-2 text-xs font-medium text-(--brand-500)"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="mb-2 block text-sm font-medium text-slate-700">
                            คุณสมบัติพื้นฐาน:
                          </h4>
                          <ul className="space-y-2">
                            {position.basicQualifications.map(
                              (qualification, qualIndex) => (
                                <li
                                  key={qualIndex}
                                  className="flex items-start gap-2"
                                >
                                  <span
                                    style={{ color: "var(--form-success)" }}
                                    className="mt-1"
                                  >
                                    •
                                  </span>
                                  <span className="text-gray-700 text-sm">
                                    {qualification}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>

                        {position.preferredQualifications && (
                          <div className="mb-4">
                            <h4 className="mb-2 block text-sm font-medium text-slate-700">
                              คุณสมบัติที่พึงประสงค์:
                            </h4>
                            <p
                              className="text-gray-700 text-sm p-3 rounded-lg"
                              style={{ background: "var(--form-secondary)" }}
                            >
                              {position.preferredQualifications}
                            </p>
                          </div>
                        )}

                        {index < project.positions.length - 1 && (
                          <hr className="my-6 border-gray-200" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <RecruitmentProgressSection projectId={project.id} />

                <TeamMembersSection projectId={project.id} />

                <div className="rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
                  <h2 className="mb-4 text-lg font-semibold text-slate-700">
                    ข้อมูลการทำงาน
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">
                          รูปแบบการทำงาน
                        </h3>
                      </div>
                      <p className="text-gray-700">
                        {getWorkModeLabel(project.workMode)}
                      </p>
                    </div>

                    {project.workingHours && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-gray-600" />
                          <h3 className="font-semibold text-gray-900">
                            เวลาทำงาน
                          </h3>
                        </div>
                        <p className="text-gray-700">{project.workingHours}</p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">
                          วันที่เปิดรับสมัคร
                        </h3>
                      </div>
                      <p className="text-gray-700">
                        {formatThaiDate(project.applicationStartDate)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">
                          วันที่ปิดรับสมัคร
                        </h3>
                      </div>
                      <p className="text-gray-700">
                        {formatThaiDate(project.applicationEndDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
                  <h2 className="mb-4 text-lg font-semibold text-slate-700">
                    ผลตอบแทนและสิ่งที่จะได้รับ
                  </h2>

                  <div className="flex flex-wrap gap-4">
                    {project.benefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ background: "var(--form-primary-light)" }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{
                            background: "var(--form-primary)",
                            color: "white",
                          }}
                        >
                          <Award className="w-4 h-4" />
                        </div>
                        <span
                          className="font-medium"
                          style={{ color: "var(--form-primary)" }}
                        >
                          {getBenefitLabel(benefit)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {project.compensationDetail && (
                    <div
                      className="mt-4 p-4 rounded-lg border-l-4"
                      style={{
                        background: "var(--form-secondary)",
                        borderColor: "var(--form-accent)",
                      }}
                    >
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: "var(--form-accent)" }}
                      >
                        รายละเอียดค่าตอบแทน
                      </h4>
                      <p style={{ color: "var(--form-text-primary)" }}>
                        {project.compensationDetail}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <div
                  className="rounded-2xl p-6 text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(253, 94, 75, 0.9), rgba(253, 133, 145, 0.9), rgba(252, 207, 0, 0.9))",
                    boxShadow: "0 10px 30px rgba(253, 94, 75, 0.2)",
                  }}
                >
                  <div className="flex items-center justify-center mb-4">
                    <Image
                      src="/logo.png"
                      alt="IdeaCrew logo"
                      width={61}
                      height={67}
                      className="h-12 w-auto"
                    />
                  </div>
                  <h3 className="text-center text-lg font-bold mb-2">
                    พร้อมจะเข้าร่วมแล้ว?
                  </h3>
                  <p className="text-center text-sm mb-6 opacity-90">
                    ส่งผลงานของคุณออกสู่สายในขณะนี้!
                  </p>
                  <ProjectApplicationControls
                    projectId={project.id}
                    ownerId={project.ownerId}
                    isOpen={isOpen}
                    applicationEndDateLabel={formatThaiDate(
                      project.applicationEndDate,
                    )}
                    projectStatus={project.status}
                    approvalStatus={project.approvalStatus}
                  />
                </div>

                <div className="space-y-6">
                  <div className="rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-4 w-4 text-(--form-primary)" />
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: "var(--form-text-primary)" }}
                      >
                        ตำแหน่งงานที่เปิดรับ
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {project.positions.map((position) => (
                        <div
                          key={position.id}
                          className="rounded-lg px-3 py-2"
                          style={{
                            background: "var(--form-primary-light)",
                          }}
                        >
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--form-primary)" }}
                          >
                            {position.title} ({position.neededCount} คน)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-4 w-4 text-(--form-primary)" />
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: "var(--form-text-primary)" }}
                      >
                        ทักษะที่ต้องการ
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {projectSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-orange-50 px-2.5 py-1 text-xs text-(--brand-500)"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
