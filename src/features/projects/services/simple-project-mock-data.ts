// Simple mock data structure (compatible with original design)
export interface SimpleProject {
  id: string;
  title: string;
  org: string;
  description: string;
  status: "open" | "closed";
  category: string[];
  positions: {
    role: string;
    needed: number;
    skills: string[];
  }[];
}

export const mockProjects: SimpleProject[] = [
  {
    id: "p1",
    title: "CSTU E-Sport Tournament 2025: Voice Casting Team",
    org: "CSTU E-Sport",
    description:
      "สร้างทีมผู้พากย์เสียงสำหรับการแข่งขัน E-Sport เพื่อเพิ่มอรรถรสในการรับชมและคุณภาพการถ่ายทอดสด",
    status: "open",
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
    status: "open",
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

// Helper function for getting project by ID
export const getProjectById = (id: string): SimpleProject | undefined => {
  return mockProjects.find((project) => project.id === id);
};
