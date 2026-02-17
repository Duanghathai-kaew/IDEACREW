"use client";

import { getProjectById } from "@/lib/mockData";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const WORK_MODE_LABELS = {
  onsite: "ทำงานที่สถานที่",
  hybrid: "ผสมผสาน",
  online: "ทำงานออนไลน์",
};

const BENEFIT_LABELS = {
  certificate: "ใบประกาศนียบัตร",
  experience: "ประสบการณ์",
  portfolio: "ผลงานใส่ Portfolio",
  compensation: "ค่าตอบแทน",
  network: "เครือข่าย/Networking",
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  const avatar = project.createdBy.slice(0, 2).toUpperCase();

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
              <p className="text-gray-600 mb-3">by {project.createdBy}</p>
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
            <div className="flex gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                สิ้นสุด: {project.applicationEndDate}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {WORK_MODE_LABELS[project.workMode]}
              </div>
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

            {/* Positions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                💼 งานที่เปิดรับ
              </h2>

              <div className="space-y-6">
                {project.positions.map((position, index) => (
                  <div
                    key={position.id}
                    className="border-l-4 border-orange-400 pl-4"
                  >
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        🎯 {position.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        จำนวน: {position.neededCount} คน
                      </p>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        ⚡ ทักษะที่ต้องการ:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {position.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Basic Qualifications */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        ✅ คุณสมบัติพื้นฐาน:
                      </h4>
                      <ul className="space-y-1">
                        {position.basicQualifications.map(
                          (qualification, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {qualification}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>

                    {/* Preferred Qualifications */}
                    {position.preferredQualifications && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          ⭐ คุณสมบัติที่ต้องการเพิ่มเติม:
                        </h4>
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          {position.preferredQualifications}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Computing Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 ข้อมูลสำคัญ
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      รูปแบบการทำงาน
                    </p>
                    <p className="text-sm text-gray-600">
                      {WORK_MODE_LABELS[project.workMode]}
                    </p>
                  </div>
                </div>

                {project.workingHours && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        เวลาทำงาน
                      </p>
                      <p className="text-sm text-gray-600">
                        {project.workingHours}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      ระยะเวลาสมัคร
                    </p>
                    <p className="text-sm text-gray-600">
                      {project.applicationStartDate} -{" "}
                      {project.applicationEndDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎁 ผลตอบแทน
              </h3>

              <div className="space-y-3">
                {project.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      {BENEFIT_LABELS[benefit]}
                    </span>
                  </div>
                ))}

                {project.compensationDetail && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      💰 {project.compensationDetail}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Apply Button */}
            <div className="bg-gradient-to-r from-orange-400 to-pink-400 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">พร้อมจะเข้าร่วมแล้ว?</h3>
              <p className="text-sm mb-4 opacity-90">
                สมัครเข้าร่วมโปรเจกต์นี้วันนี้
              </p>
              <button className="w-full bg-white text-orange-500 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                📧 สมัครเลย
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
