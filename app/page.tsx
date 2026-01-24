"use client";

import { useState } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";

const projects = [
  {
    title: "CSTU E-Sport Tournament",
    positions: ["Caster", "Sound Engineer"],
    skills: ["E-sport", "Voice"],
  },
  {
    title: "Open House Media Team",
    positions: ["Frontend Dev", "UX/UI"],
    skills: ["React", "Figma"],
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

      {/* 🔹 SearchBar ส่ง logic ลงไป */}
      <SearchBar onSearch={handleSearch} />

      {/* 🔹 แสดงผลลัพธ์ */}
      <div className="mt-6 space-y-4 px-6">
        {filtered.map((p) => (
          <div key={p.title} className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-sm text-muted-foreground">
              {p.positions.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
