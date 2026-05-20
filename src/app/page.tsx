"use client";
import { useEffect, useMemo, useState } from "react";

import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Hero from "@/components/shared/hero";
import ProjectFeed from "@/features/projects/components/project-feed";
import SearchBar from "@/features/projects/components/search-bar";
import {
  mockProjects,
  SimpleProject,
} from "@/features/projects/services/simple-project-mock-data";

const skillFilterKeywords: Record<string, string[]> = {
  frontend: [
    "frontend",
    "front-end",
    "react",
    "next.js",
    "typescript",
    "tailwind",
    "เว็บ",
  ],
  uxui: ["ux", "ui", "figma", "design", "ออกแบบ"],
  content: ["content", "creator", "caster", "script", "พากย์", "คอนเทนต์"],
};

const categoryFilterKeywords: Record<string, string[]> = {
  esport: ["e-sport", "esport", "กีฬาอีสปอร์ต", "พากย์", "เกม"],
  openhouse: ["open house", "openhouse", "โอเพ่นเฮาส์", "งานเปิดบ้าน"],
};

function getProjectSearchText(project: SimpleProject) {
  return [
    project.title,
    project.org,
    project.description,
    ...project.category,
    ...project.positions.map((pos) => pos.role),
    ...project.positions.flatMap((pos) => pos.skills),
  ]
    .join(" ")
    .toLowerCase();
}

export default function Home() {
  const [projects, setProjects] = useState<SimpleProject[]>(mockProjects);
  const [keyword, setKeyword] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "open",
  );

  useEffect(() => {
    let mounted = true;

    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects", { cache: "no-store" });
        if (!response.ok) return;

        const result = (await response.json()) as { data?: SimpleProject[] };
        if (!mounted || !result.data) return;

        setProjects(result.data);
      } catch {
        // Keep mock data as fallback when API is not ready.
      }
    }

    fetchProjects();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return projects.filter((project) => {
      const text = getProjectSearchText(project);

      const passKeyword = q === "" || text.includes(q);

      const passSkills =
        selectedSkills.length === 0 ||
        selectedSkills.some((skillKey) =>
          (skillFilterKeywords[skillKey] ?? []).some((kw) => text.includes(kw)),
        );

      const passCategories =
        selectedCategories.length === 0 ||
        selectedCategories.some((categoryKey) =>
          (categoryFilterKeywords[categoryKey] ?? []).some((kw) =>
            text.includes(kw),
          ),
        );

      const passStatus =
        statusFilter === "all" || project.status === statusFilter;

      return passKeyword && passSkills && passCategories && passStatus;
    });
  }, [keyword, projects, selectedSkills, selectedCategories, statusFilter]);

  function handleSearch(nextKeyword: string) {
    setKeyword(nextKeyword);
  }

  function handleResetFilters() {
    setKeyword("");
    setSelectedSkills([]);
    setSelectedCategories([]);
    setStatusFilter("open");
    setResetSignal((prev) => prev + 1);
  }

  const canReset =
    keyword.trim() !== "" ||
    selectedSkills.length > 0 ||
    selectedCategories.length > 0 ||
    statusFilter !== "open";

  const feedAnimationKey = [
    keyword.trim().toLowerCase(),
    selectedSkills.slice().sort().join(","),
    selectedCategories.slice().sort().join(","),
    statusFilter,
  ].join("|");

  return (
    <>
      <Navbar />
      <Hero />
      <SearchBar key={`search-${resetSignal}`} onSearch={handleSearch} />

      {/* ===== Main Layout ===== */}
      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[280px_1fr]">
        <Sidebar
          selectedSkills={selectedSkills}
          onSkillsChange={setSelectedSkills}
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          onReset={handleResetFilters}
          canReset={canReset}
        />
        <ProjectFeed key={feedAnimationKey} projects={filtered} />
      </main>
    </>
  );
}
