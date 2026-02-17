"use client";

import {
  getDetailedProjectById,
  getBenefitLabel,
  getWorkModeLabel,
  formatThaiDate,
} from "@/lib/detailedMockData";
import { ArrowLeft, Calendar, Clock, Users, Award } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปหน้าหลัก
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  isOpen
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isOpen ? "เปิดรับสมัคร" : "ปิดรับสมัครแล้ว"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📋 วิกิปีเดียของโปรเจกต์นี้
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Work Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                💼 ข้อมูลการทำงาน
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
                      <h3 className="font-semibold text-gray-900">เวลาทำงาน</h3>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                🎁 ผลตอบแทนและสิ่งที่จะได้รับ
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-green-800 font-medium">
                      {getBenefitLabel(benefit)}
                    </span>
                  </div>
                ))}
              </div>

              {project.compensationDetail && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <h4 className="font-semibold text-yellow-800 mb-1">
                    💰 รายละเอียดค่าตอบแทน
                  </h4>
                  <p className="text-yellow-700">
                    {project.compensationDetail}
                  </p>
                </div>
              )}
            </div>

            {/* Positions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                💼 ตำแหน่งงานที่เปิดรับ
              </h2>

              <div className="space-y-8">
                {project.positions.map((position, index) => (
                  <div
                    key={position.id}
                    className="border-l-4 border-orange-400 pl-6"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        🎯 {position.title}
                      </h3>
                      <p className="text-gray-600">
                        จำนวน:{" "}
                        <span className="font-medium text-orange-600">
                          {position.neededCount} คน
                        </span>
                      </p>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        ⚡ ทักษะที่ต้องการ:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {position.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Basic Qualifications */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        ✅ คุณสมบัติพื้นฐาน:
                      </h4>
                      <ul className="space-y-2">
                        {position.basicQualifications.map(
                          (qualification, qualIndex) => (
                            <li
                              key={qualIndex}
                              className="flex items-start gap-2"
                            >
                              <span className="text-green-500 mt-1">•</span>
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
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          ⭐ คุณสมบัติที่พึงประสงค์:
                        </h4>
                        <p className="text-gray-700 text-sm bg-purple-50 p-3 rounded-lg">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Button */}
            <div className="bg-gradient-to-r from-orange-400 to-pink-400 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">พร้อมจะเข้าร่วมแล้ว?</h3>
              <p className="text-sm mb-4 opacity-90">
                สมัครเข้าร่วมโปรเจกต์นี้วันนี้
              </p>
              <button
                className="w-full bg-white text-orange-500 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={!isOpen}
              >
                {isOpen ? "📧 สมัครเลย" : "ปิดรับสมัครแล้ว"}
              </button>
              {!isOpen && (
                <p className="text-xs mt-2 opacity-75">
                  หมดเวลารับสมัครแล้วเมื่อ{" "}
                  {formatThaiDate(project.applicationEndDate)}
                </p>
              )}
            </div>

            {/* Project Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 สรุปข้อมูลโปรเจกต์
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    จำนวนตำแหน่งทั้งหมด
                  </p>
                  <p className="text-sm text-gray-600">
                    {project.positions.reduce(
                      (total, pos) => total + pos.neededCount,
                      0,
                    )}{" "}
                    คน ({project.positions.length} ตำแหน่ง)
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">หมวดหมู่</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    รูปแบบการทำงาน
                  </p>
                  <p className="text-sm text-gray-600">
                    {getWorkModeLabel(project.workMode)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ช่วงเวลารับสมัคร
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatThaiDate(project.applicationStartDate)} -{" "}
                    {formatThaiDate(project.applicationEndDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">สถานะ</p>
                  <p className="text-sm text-gray-600">
                    {isOpen ? "✅ เปิดรับสมัคร" : "❌ ปิดรับสมัครแล้ว"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">ผลตอบแทน</p>
                  <div className="space-y-1 mt-1">
                    {project.benefits.map((benefit) => (
                      <p key={benefit} className="text-xs text-gray-600">
                        •{" "}
                        {getBenefitLabel(benefit).replace(
                          /^[📁💼🎓💰🤝]\s/,
                          "",
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact or Additional Info */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📞 ติดต่อสอบถาม
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                หากมีข้อสงสัยเพิ่มเติมเกี่ยวกับโปรเจกต์นี้
              </p>
              <button className="w-full bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                📧 ส่งข้อความถาม
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
