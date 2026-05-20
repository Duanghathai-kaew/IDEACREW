"use client";
import { useEffect, useMemo, useState } from "react";

import MobileFilterDrawer, {
  MobileFilterToggle,
} from "@/components/layout/mobile-filter-drawer";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Hero from "@/components/shared/hero";
import ProjectFeed from "@/features/projects/components/project-feed";
import SearchBar from "@/features/projects/components/search-bar";
import {
  mockProjects,
  SimpleProject,
} from "@/features/projects/services/simple-project-mock-data";
import { type ProjectFilterOptions } from "@/features/projects/types/filter-options.type";

function normalizeFilterValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildFilterKey(type: "skill" | "category", value: string) {
  return `${type}::${normalizeFilterValue(value)}`;
}

function getProjectFilterKeySet(values: string[], type: "skill" | "category") {
  return new Set(values.map((value) => buildFilterKey(type, value)));
}

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
  const [filterOptions, setFilterOptions] = useState<ProjectFilterOptions>({
    skills: [],
    categories: [],
  });
  const [keyword, setKeyword] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "all",
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

    async function fetchFilterOptions() {
      try {
        const response = await fetch("/api/project-filters", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const result = (await response.json()) as {
          data?: ProjectFilterOptions;
        };
        if (!mounted || !result.data) return;

        setFilterOptions(result.data);
      } catch {
        // Keep the filter list empty if the source of truth is unavailable.
      }
    }

    fetchFilterOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const selectedSkillKeys = new Set(selectedSkills);
    const selectedCategoryKeys = new Set(selectedCategories);

    return projects.filter((project) => {
      const text = getProjectSearchText(project);
      const projectSkillKeys = getProjectFilterKeySet(
        project.positions.flatMap((pos) => pos.skills),
        "skill",
      );
      const projectCategoryKeys = getProjectFilterKeySet(
        project.category,
        "category",
      );

      const passKeyword = q === "" || text.includes(q);

      const passSkills =
        selectedSkillKeys.size === 0 ||
        Array.from(selectedSkillKeys).some((skillKey) =>
          projectSkillKeys.has(skillKey),
        );

      const passCategories =
        selectedCategoryKeys.size === 0 ||
        Array.from(selectedCategoryKeys).some((categoryKey) =>
          projectCategoryKeys.has(categoryKey),
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
    setStatusFilter("all");
    setResetSignal((prev) => prev + 1);
    setMobileFiltersOpen(false);
  }

  const canReset =
    keyword.trim() !== "" ||
    selectedSkills.length > 0 ||
    selectedCategories.length > 0 ||
    statusFilter !== "all";

  const activeFilterCount =
    selectedSkills.length +
    selectedCategories.length +
    (statusFilter !== "all" ? 1 : 0);

  const statusLabel =
    statusFilter === "open"
      ? "เปิดรับ"
      : statusFilter === "closed"
        ? "ปิดรับแล้ว"
        : "ทั้งหมด";

  const optionLabelByKey = useMemo(() => {
    return new Map(
      [...filterOptions.skills, ...filterOptions.categories].map((option) => [
        option.key,
        option.label,
      ]),
    );
  }, [filterOptions]);

  const activeFilterSummary = useMemo(() => {
    const labels = [
      ...selectedSkills.map((skill) => optionLabelByKey.get(skill) ?? skill),
      ...selectedCategories.map(
        (category) => optionLabelByKey.get(category) ?? category,
      ),
    ];

    if (statusFilter !== "all") {
      labels.push(statusLabel);
    }

    return labels.length > 0 ? labels.join(" • ") : "แสดงผลลัพธ์ทั้งหมด";
  }, [
    optionLabelByKey,
    selectedCategories,
    selectedSkills,
    statusFilter,
    statusLabel,
  ]);

  const sidebarProps = {
    selectedSkills,
    onSkillsChange: setSelectedSkills,
    selectedCategories,
    onCategoriesChange: setSelectedCategories,
    status: statusFilter,
    onStatusChange: setStatusFilter,
    onReset: handleResetFilters,
    canReset,
    skillOptions: filterOptions.skills,
    categoryOptions: filterOptions.categories,
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <Navbar />
      <Hero />
      <div className="w-full px-4 sm:px-6">
        <SearchBar key={`search-${resetSignal}`} onSearch={handleSearch} />
      </div>

      <main className="mx-auto grid w-full min-w-0 max-w-7xl flex-1 grid-cols-1 items-start gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden min-w-0 lg:block lg:self-start">
          <Sidebar {...sidebarProps} />
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <MobileFilterToggle
            activeFilterCount={activeFilterCount}
            onOpen={() => setMobileFiltersOpen(true)}
          />
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-[8px]">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                ผลลัพธ์ {filtered.length} รายการ
              </p>
              <p className="truncate text-xs text-slate-500">
                {activeFilterSummary}
              </p>
            </div>
            {canReset && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="min-h-10 shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
          <ProjectFeed
            projects={filtered}
            hasActiveFilters={canReset || keyword.trim() !== ""}
          />
        </div>
      </main>

      <MobileFilterDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        activeFilterCount={activeFilterCount}
        {...sidebarProps}
      />
    </div>
  );
}
