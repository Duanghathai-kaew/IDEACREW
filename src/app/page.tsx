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
import { SimpleProject } from "@/features/projects/services/simple-project-mock-data";
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
  const [projects, setProjects] = useState<SimpleProject[]>([]);
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
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isFilterOptionsLoading, setIsFilterOptionsLoading] = useState(true);

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
        setProjects([]);
      } finally {
        if (mounted) setIsProjectsLoading(false);
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
      } finally {
        if (mounted) setIsFilterOptionsLoading(false);
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

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const fetchedSkillOptions = filterOptions.skills.map(
      (option) => option.key,
    );
    const selectedSkillIds = selectedSkills.slice();
    const matchedProjectIds = filtered.map((project) => project.id);
    const projectSkillIds = projects.map((project) => ({
      id: project.id,
      skills: project.positions.flatMap((position) => position.skills),
    }));

    console.debug("[public-feed-skill-filter-debug]", {
      fetchedSkillOptions,
      selectedSkillIds,
      projectSkillIds,
      matchedProjectIds,
      finalFilteredCount: filtered.length,
    });
  }, [filterOptions.skills, filtered, projects, selectedSkills]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    console.debug("[public-feed-filters]", {
      selectedSkills,
      selectedCategories,
      statusFilter,
      matchedProjectIds: filtered.map((project) => project.id),
      finalFilteredCount: filtered.length,
    });
  }, [filtered, selectedCategories, selectedSkills, statusFilter]);

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
          <ProjectFeed
            projects={filtered}
            hasActiveFilters={canReset || keyword.trim() !== ""}
            isLoading={isProjectsLoading || isFilterOptionsLoading}
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
