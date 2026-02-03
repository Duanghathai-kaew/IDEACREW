"use client";
import { useState } from "react";

import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ProjectFeed from "@/components/ProjectFeed";
import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";

/* ===== Mock Data (Recommended) ===== */
const projects = [
  {
    id: "p1",
    title: "CSTU E-Sport Tournament 2025: Voice Casting Team",
    org: "CSTU E-Sport",
    description:
      "สร้างทีมผู้พากย์เสียงสำหรับการแข่งขัน E-Sport เพื่อเพิ่มอรรถรสในการรับชมและคุณภาพการถ่ายทอดสด",
    status: "open" as const,
    category: ["E-Sport", "งานอีเวนต์"],
    positions: [
      {
        role: "Caster",
        needed: 2,
        skills: ["พากย์เสียง", "ควบคุมจังหวะเกม", "เขียนสคริปต์"],
      },
      {
        role: "Sound Engineer",
        needed: 1,
        skills: ["ตัดต่อเสียง", "ปรับเสียง Live", "ใช้โปรแกรม Audio"],
      },
    ],
  },
  {
    id: "p2",
    title: "Website for CSTU Open House 2026",
    org: "CSTU Web Team",
    description:
      "พัฒนาเว็บไซต์สำหรับงาน Open House เพื่อประชาสัมพันธ์และให้ข้อมูลกิจกรรม",
    status: "open" as const,
    category: ["พัฒนาเว็บไซต์", "งานอีเวนต์"],
    positions: [
      {
        role: "Frontend Developer",
        needed: 2,
        skills: ["React", "Next.js", "Tailwind CSS"],
      },
      {
        role: "UX/UI Designer",
        needed: 1,
        skills: ["Figma", "ออกแบบ UI", "วิเคราะห์ประสบการณ์ผู้ใช้"],
      },
    ],
  },
];

export default function Home() {
  const [filtered, setFiltered] = useState(projects);

  function handleSearch(keyword: string) {
    const q = keyword.toLowerCase();

    const result = projects.filter((p) => {
      // title
      if (p.title.toLowerCase().includes(q)) return true;
      // category
      if (p.category.some((cat) => cat.toLowerCase().includes(q))) return true;
      // positions: role
      if (p.positions.some((pos) => pos.role.toLowerCase().includes(q)))
        return true;
      // positions: skills
      if (
        p.positions.some((pos) =>
          pos.skills.some((skill) => skill.toLowerCase().includes(q)),
        )
      )
        return true;
      return false;
    });

    setFiltered(result);
  }

  return (
    <>
      <Navbar />
      <Hero />
      <SearchBar onSearch={handleSearch} />

      {/* ===== Main Layout ===== */}
      <main className="layout">
        <Sidebar />
        <ProjectFeed projects={filtered} />
      </main>
    </>
  );
}
