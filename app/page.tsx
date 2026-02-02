"use client";
import { useState } from "react";

import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ProjectFeed from "@/components/ProjectFeed";
import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";

/* ===== Mock Data ===== */
const projects = [
  {
    title: "CSTU E-Sport Tournament 2025: Voice Casting Team",
    org: "CSTU E-Sport",
    description:
      "สร้างทีมผู้พากย์เสียงคุณภาพสำหรับงานแข่งขัน E-Sport ของสาขา เพื่อทำให้การถ่ายทอดสดมีความสนุก น่าติดตาม และสร้างบรรยากาศระดับโปรทัวร์นาเมนต์",
    status: "open" as const,
    openRoles: "ผู้พากย์เสียง (Caster) 2 คน",
    positions: ["Caster", "Sound Engineer"],
    skills: ["พากย์เสียง", "เขียนสคริปต์", "ตัดต่อเสียง"],
  },
];

export default function Home() {
  const [filtered, setFiltered] = useState(projects);

  function handleSearch(keyword: string) {
    const q = keyword.toLowerCase();

    const result = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.positions.some((pos) => pos.toLowerCase().includes(q)) ||
        p.skills.some((skill) => skill.toLowerCase().includes(q)),
    );

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
