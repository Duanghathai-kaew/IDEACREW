"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Filter, Gift, Trash2, Users } from "lucide-react";
import Navbar from "@/components/Navbar";

const statusMeta = {
  active: {
    label: "ดำเนินอยู่",
    pill: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-400",
  },
  pending: {
    label: "รอการอนุมัติ",
    pill: "bg-amber-100 text-amber-700",
    border: "border-amber-400",
  },
  rejected: {
    label: "ปฏิเสธ",
    pill: "bg-rose-100 text-rose-700",
    border: "border-rose-400",
  },
} as const;

type ProjectStatus = keyof typeof statusMeta;

type MyProject = {
  id: string;
  detailId?: string;
  title: string;
  status: ProjectStatus;
  createdAt: string;
  summary: string;
  tags: string[];
  applicants: number;
  deadline: string;
};

const myProjects: MyProject[] = [
  {
    id: "p101",
    detailId: "p1",
    title: "Social Media Content ทีม CSTU Innovation Week",
    status: "active",
    createdAt: "20 พฤศจิกายน 2567",
    summary:
      "ต้องการทีมสร้างคอนเทนต์สั้นสำหรับประชาสัมพันธ์ผ่าน TikTok, Instagram และ Facebook",
    tags: ["สื่อสังคม", "Content Creator"],
    applicants: 4,
    deadline: "15 ธ.ค. 2568",
  },
  {
    id: "p102",
    title: "ระบบติดตามฟังก์ชันสหกิจฯ",
    status: "pending",
    createdAt: "26 พฤศจิกายน 2567",
    summary: "พัฒนาเว็บแอปติดตามเอกสารสหกิจฯ และระบบแจ้งเตือนสถานะ",
    tags: ["Frontend Dev", "React"],
    applicants: 3,
    deadline: "1 ธ.ค. 2568",
  },
  {
    id: "p103",
    title: "ออกแบบ Key Visual งาน Freshy Night 2025",
    status: "rejected",
    createdAt: "18 พฤศจิกายน 2567",
    summary: "ออกแบบสื่อภาพนิ่งและชุดคีย์วิชวลสำหรับงานใหญ่ประจำปี",
    tags: ["กราฟิก/ดีไซน์"],
    applicants: 2,
    deadline: "30 พ.ย. 2568",
  },
  {
    id: "p104",
    title: "MC and Host สำหรับงาน CSTU Talent Show",
    status: "pending",
    createdAt: "27 พฤศจิกายน 2567",
    summary: "คัดเลือกพิธีกรหลักและพิธีกรร่วมดูแลบรรยากาศบนเวที",
    tags: ["MC/ดำเนินรายการ"],
    applicants: 2,
    deadline: "10 ธ.ค. 2568",
  },
  {
    id: "p105",
    detailId: "p2",
    title: "Open House University Tour",
    status: "active",
    createdAt: "22 พฤศจิกายน 2567",
    summary: "ดูแลกิจกรรมทัวร์คณะและการจัดคิวผู้เข้าร่วมงาน",
    tags: ["กิจกรรม/ประสานงาน", "Open House"],
    applicants: 5,
    deadline: "20 ธ.ค. 2568",
  },
];

const filters = [
  { key: "all", label: "ทั้งหมด" },
  { key: "active", label: "กำลังทำ" },
  { key: "pending", label: "รอการอนุมัติ" },
  { key: "rejected", label: "ปฏิเสธ" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

export default function MyProjectPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") return myProjects;
    return myProjects.filter((project) => project.status === activeFilter);
  }, [activeFilter]);

  const counts = useMemo(() => {
    return {
      all: myProjects.length,
      active: myProjects.filter((p) => p.status === "active").length,
      pending: myProjects.filter((p) => p.status === "pending").length,
      rejected: myProjects.filter((p) => p.status === "rejected").length,
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-[#fff7f2]">
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">
              โปรเจกต์ของฉัน
            </h1>
            <p className="text-sm md:text-base text-orange-400">
              จัดการและติดตามสถานะโปรเจกต์ของคุณ
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => {
                const isActive = activeFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-orange-400 to-amber-400 text-white border-transparent shadow"
                        : "bg-white text-orange-500 border-orange-200 hover:border-orange-400"
                    }`}
                  >
                    {filter.label}
                    <span
                      className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-orange-100"
                      }`}
                    >
                      {counts[filter.key]}
                    </span>
                  </button>
                );
              })}
            </div>
            <button className="flex items-center gap-2 text-sm text-orange-500">
              <Filter className="w-4 h-4" />
              กรองตามสถานะ
            </button>
          </div>

          <div className="space-y-6">
            {filteredProjects.length === 0 ? (
              <div className="bg-[#ffe9e1] border border-orange-200 rounded-2xl px-6 py-10 text-center">
                <div className="mx-auto w-12 h-12 rounded-full border-2 border-pink-400 flex items-center justify-center text-pink-400">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-orange-500">
                  ยังไม่มีโปรเจกต์
                </h3>
                <p className="mt-2 text-sm text-orange-400">
                  เริ่มต้นโพสต์โปรเจกต์ของคุณตอนนี้!
                </p>
              </div>
            ) : (
              filteredProjects.map((project) => {
                const meta = statusMeta[project.status];
                return (
                  <article
                    key={project.id}
                    className={`bg-white rounded-2xl shadow-sm border-t-4 ${meta.border} p-6`}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${meta.pill}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            โพสต์เมื่อ {project.createdAt}
                          </span>
                        </div>
                        <button className="text-rose-400 hover:text-rose-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {project.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 text-xs rounded-full bg-orange-50 text-orange-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {project.summary}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          ผู้สมัคร {project.applicants} คน
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          ปิดรับ {project.deadline}
                        </span>
                      </div>

                      {project.status === "active" ? (
                        <Link
                          href={`/project/${project.detailId ?? project.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-amber-400 shadow"
                        >
                          ดูรายละเอียดโปรเจกต์
                        </Link>
                      ) : project.status === "pending" ? (
                        <button className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-orange-400 bg-orange-50">
                          กำลังตรวจสอบ
                        </button>
                      ) : (
                        <div className="bg-rose-50 text-rose-500 text-xs rounded-lg p-3">
                          เหตุผลที่ปฏิเสธ:
                          ข้อมูลไม่ครบถ้วนและรายละเอียดไม่ชัดเจน
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
    </>
  );
}
