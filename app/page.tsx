"use client";
import { useState } from "react";

import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ProjectFeed from "@/components/ProjectFeed";
import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";
import { mockProjects } from "@/lib/simpleMockData";

export default function Home() {
  const [filtered, setFiltered] = useState(mockProjects);

  function handleSearch(keyword: string) {
    const q = keyword.toLowerCase();

    const result = mockProjects.filter((p) => {
      // title
      if (p.title.toLowerCase().includes(q)) return true;
      // description
      if (p.description.toLowerCase().includes(q)) return true;
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
