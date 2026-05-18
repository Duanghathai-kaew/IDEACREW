export type AdminStatus = "pending" | "approved" | "rejected";
export type TagType = "skill" | "category";

export type ProjectPosition = {
  role: string;
  description: string;
};

export type ProjectTag = {
  id: string;
  name: string;
  type: TagType;
  approved: boolean;
};

export type AdminProject = {
  id: string;
  name: string;
  submittedBy: string;
  submittedAt: string;
  deadline: string;
  status: AdminStatus;
  description: string;
  requester: {
    name: string;
    email: string;
    phone: string;
  };
  info: {
    teamSize: number;
    workingHours: string;
    deadline: string;
    workType: "Onsite" | "Remote" | "Hybrid";
  };
  benefits: string[];
  positions: ProjectPosition[];
  tags: ProjectTag[];
};

export type AdminTag = {
  id: string;
  name: string;
  type: TagType;
  usageCount: number;
  status: "enabled" | "disabled";
};

const projectTitles = [
  "CSTU E-Sport Tournament 2026",
  "IDEACREW Alumni Story Podcast",
  "CSTU Career Fair Matching Platform",
  "Open House Media Team",
  "Student Activity Booking App",
  "Creative Brand Studio 2026",
  "Hackathon Mentor Connect",
  "Freshman Buddy Program",
  "Campus Event Dashboard",
  "CSTU Skill Sharing Week",
  "Smart Volunteer Tracking",
  "Design System Revamp",
];

const projectStatusSeed: AdminStatus[] = [
  "pending",
  "approved",
  "rejected",
  "pending",
  "approved",
  "pending",
  "rejected",
  "approved",
  "pending",
  "approved",
  "pending",
  "rejected",
];

const submittedBySeed = [
  "Somchai Jai Dee",
  "Nattapong T.",
  "Primlada K.",
  "CSTU Web Team",
  "Media Club",
  "Thanakorn I.",
];

export const adminProjects: AdminProject[] = projectTitles.map((title, index) => {
  const month = (index % 12) + 1;
  const day = (index % 27) + 1;
  const submittedAt = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const deadline = `2026-${String(((month + 2) % 12) + 1).padStart(2, "0")}-${String(((day + 8) % 27) + 1).padStart(2, "0")}`;

  return {
    id: `project-${index + 1}`,
    name: title,
    submittedBy: submittedBySeed[index % submittedBySeed.length],
    submittedAt,
    deadline,
    status: projectStatusSeed[index],
    description:
      "This project aims to build a collaborative student initiative for campus activities. The team will coordinate planning, communication, and delivery across multiple tracks.",
    requester: {
      name: submittedBySeed[index % submittedBySeed.length],
      email: `owner${index + 1}@cstu.ac.th`,
      phone: `08${index}2-345-67${(index + 2).toString().padStart(2, "0")}`,
    },
    info: {
      teamSize: (index % 5) + 2,
      workingHours: `${(index % 4) + 4}-${(index % 4) + 7} hrs/week`,
      deadline,
      workType: ["Hybrid", "Onsite", "Remote"][index % 3] as "Hybrid" | "Onsite" | "Remote",
    },
    benefits: ["Experience", "Portfolio", "Networking"],
    positions: [
      {
        role: "Frontend Developer",
        description: "Build reusable interfaces with React and maintain component quality.",
      },
      {
        role: "Content Strategist",
        description: "Design messaging flow and coordinate campaign assets.",
      },
      {
        role: "Project Coordinator",
        description: "Track progress, align timelines, and communicate with stakeholders.",
      },
    ],
    tags: [
      { id: `tag-${index + 1}-1`, name: "React", type: "skill", approved: true },
      { id: `tag-${index + 1}-2`, name: "TypeScript", type: "skill", approved: index % 2 === 0 },
      { id: `tag-${index + 1}-3`, name: "Student Activity", type: "category", approved: true },
      { id: `tag-${index + 1}-4`, name: "Design", type: "category", approved: index % 3 === 0 },
    ],
  };
});

export const adminTags: AdminTag[] = [
  { id: "admin-tag-1", name: "React", type: "skill", usageCount: 32, status: "enabled" },
  { id: "admin-tag-2", name: "TypeScript", type: "skill", usageCount: 27, status: "enabled" },
  { id: "admin-tag-3", name: "UI Design", type: "skill", usageCount: 18, status: "enabled" },
  { id: "admin-tag-4", name: "Programming", type: "category", usageCount: 40, status: "enabled" },
  { id: "admin-tag-5", name: "E-Sport", type: "category", usageCount: 16, status: "disabled" },
  { id: "admin-tag-6", name: "Media", type: "category", usageCount: 22, status: "enabled" },
  { id: "admin-tag-7", name: "Marketing", type: "category", usageCount: 19, status: "disabled" },
  { id: "admin-tag-8", name: "Figma", type: "skill", usageCount: 21, status: "enabled" },
];

export const statusOptions = [
  { value: "all", label: "All status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export const tagTypeOptions = [
  { value: "all", label: "All types" },
  { value: "skill", label: "Skill" },
  { value: "category", label: "Category" },
] as const;

export function formatReadableDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getDashboardSummary(projects: AdminProject[]) {
  return {
    pending: projects.filter((project) => project.status === "pending").length,
    approved: projects.filter((project) => project.status === "approved").length,
    rejected: projects.filter((project) => project.status === "rejected").length,
  };
}
