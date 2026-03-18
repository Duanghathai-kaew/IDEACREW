import {
  getDetailedProjectById,
  getBenefitLabel,
  getWorkModeLabel,
  formatThaiDate,
} from "@/lib/detailedMockData";
import Navbar from "@/components/Navbar";
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
export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const project = getDetailedProjectById(id);

  if (!project) {
    notFound();
  }

  const avatar = project.createdBy.slice(0, 2).toUpperCase();
  const isOpen = project.status === "approved";

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen"
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #e8f4ff 100%)",
        }}
      >
        {/* Header */}
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
                      isOpen
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {isOpen ? "เปิดรับสมัคร" : "ปิดรับสมัครแล้ว"}
                  </span>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-7 space-y-6">
                {/* Project Description */}
                <div className="rounded-[20px] border border-[rgb(253_94_75/0.16)] bg-white p-8 shadow-[0_10px_30px_rgb(253_94_75/0.1)]">
                  <h2 className="mb-4 text-lg font-semibold text-slate-700">
                    รายละเอียดโปรเจกต์
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Positions */}
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

                        {/* Skills */}
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

                        {/* Basic Qualifications */}
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

                        {/* Preferred Qualifications */}
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

                {/* Work Information */}
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

                {/* Benefits */}
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

              {/* Sidebar */}
              <div className="lg:col-span-3 space-y-6">
                {/* พร้อมข้าร่วมหรือยัง widget */}
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
                      src="/logo.png?v=2"
                      alt="IDEACREW mark"
                      width={61}
                      height={67}
                      className="h-16 w-auto"
                      unoptimized
                    />
                  </div>
                  <h3 className="text-center text-lg font-bold mb-2">
                    พร้อมจะเข้าร่วมแล้ว?
                  </h3>
                  <p className="text-center text-sm mb-6 opacity-90">
                    ส่งผลงานของคุณออกสู่สายในขณะนี้!
                  </p>
                  <button
                    className="w-full bg-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-lg"
                    style={{ color: "var(--form-primary)" }}
                    disabled={!isOpen}
                  >
                    {isOpen ? "สมัครเลย" : "ปิดรับสมัครแล้ว"}
                  </button>
                  {!isOpen && (
                    <p className="text-center text-xs mt-3 opacity-75">
                      หมดเวลา {formatThaiDate(project.applicationEndDate)}
                    </p>
                  )}
                </div>

                {/* ส่วน 2 คอลัมน์ */}
                <div className="space-y-6">
                  {/* ตำแหน่งที่ใดอีก widget */}
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

                  {/* ทักษะที่ต้องการ */}
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
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs text-(--brand-500)">
                        พากย์ไทย
                      </span>
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs text-(--brand-500)">
                        เสียงพากย์
                      </span>
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs text-(--brand-500)">
                        กล้อง
                      </span>
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
