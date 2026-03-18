// Detailed mock data matching ProjectFormData structure
import { Project, WorkMode, Benefit, ProjectStatus } from "@/types/project";

export const detailedMockProjects: Project[] = [
  {
    id: "p1",
    title: "CSTU E-Sport Tournament 2025: Voice Casting Team",
    categories: ["E-Sport", "งานอีเวนต์", "สื่อและการสื่อสาร"],
    summary:
      "สร้างทีมผู้พากย์เสียงมืออาชีพสำหรับการแข่งขัน E-Sport ระดับมหาวิทยาลัย",
    description:
      "เราต้องการทีมผู้พากย์เสียงที่มีประสบการณ์และความหลงใหลในโลก E-Sport เพื่อมาร่วมสร้างประสบการณ์การรับชมที่น่าตื่นเต้นและมีคุณภาพสำหรับการแข่งขัน CSTU E-Sport Tournament 2025 ซึ่งจะเป็นการแข่งขันที่ใหญ่ที่สุดในภูมิภาคเอเชียตะวันออกเฉียงใต้",
    workMode: "hybrid" as WorkMode,
    workingHours: "วันเสาร์-อาทิตย์ เวลา 10:00-18:00 น.",
    applicationStartDate: "2025-03-01",
    applicationEndDate: "2025-03-31",
    benefits: [
      "experience",
      "portfolio",
      "compensation",
      "network",
    ] as Benefit[],
    compensationDetail: "ค่าตอบแทน 15,000-25,000 บาท/วัน ขึ้นอยู่กับประสบการณ์",
    status: "approved" as ProjectStatus,
    positions: [
      {
        id: "pos1",
        projectId: "p1",
        title: "Lead Caster",
        neededCount: 1,
        skills: [
          "พากย์เสียงมืออาชีพ",
          "วิเคราะห์เกม",
          "ควบคุมจังหวะการแข่งขัน",
          "ภาษาอังกฤษ",
        ],
        basicQualifications: [
          "ประสบการณ์พากย์เสียงอย่างน้อย 2 ปี",
          "เข้าใจกติกาเกม MOBA และ FPS เป็นอย่างดี",
          "มีทักษะการพูดในที่สาธารณะ",
          "สามารถทำงานภายใต้ความกดดันได้",
        ],
        preferredQualifications:
          "เคยพากย์การแข่งขัน E-Sport ระดับนานาชาติ หรือมีช่อง Twitch/YouTube ที่มีผู้ติดตามเยอะ",
      },
      {
        id: "pos2",
        projectId: "p1",
        title: "Color Commentator",
        neededCount: 1,
        skills: [
          "วิเคราะห์ยุทธวิธี",
          "พากย์เสียง",
          "เสริมบรรยากาศ",
          "การสื่อสารที่ชัดเจน",
        ],
        basicQualifications: [
          "เข้าใจเกมในระดับ Pro Player",
          "สามารถอธิบายยุทธวิธีได้เข้าใจง่าย",
          "มีบุคลิกที่น่าติดตาม",
          "ประสบการณ์การแข่ง E-Sport อย่างน้อย 1 ปี",
        ],
        preferredQualifications:
          "เคยเป็นนักกีฬา E-Sport มืออาชีพ หรือมี Rank สูงในเกมที่จะพากย์",
      },
      {
        id: "pos3",
        projectId: "p1",
        title: "Technical Director",
        neededCount: 1,
        skills: [
          "ระบบเสียง",
          "OBS Studio",
          "การถ่ายทอดสด",
          "แก้ไขปัญหาเฉพาะหน้า",
        ],
        basicQualifications: [
          "ประสบการณ์การจัดการเทคนิคการถ่ายทอดสด",
          "เข้าใจระบบ Audio/Video Mixing",
          "สามารถแก้ไขปัญหาเทคนิคได้อย่างรวดเร็ว",
          "ประสบการณ์ใช้ OBS หรือโปรแกรมถ่ายทอดสดอื่นๆ",
        ],
        preferredQualifications:
          "มีเครื่องมือเทคนิคส่วนตัว หรือเคยควบคุมเทคนิคงานใหญ่ๆ",
      },
    ],
    createdBy: "cstu_esport_team",
    createdAt: "2025-02-15T10:30:00Z",
  },
  {
    id: "p2",
    title: "Website for CSTU Open House 2026",
    categories: ["พัฒนาเว็บไซต์", "งานอีเวนต์", "เทคโนโลยี"],
    summary: "พัฒนาเว็บไซต์ระดับมืออาชีพสำหรับงาน Open House ปี 2026",
    description:
      "โปรเจกต์พัฒนาเว็บไซต์สำหรับงาน CSTU Open House 2026 ที่จะต้องรองรับผู้เข้าใช้งานจำนวนมาก และมีฟีเจอร์ครบครัน ตั้งแต่การลงทะเบียน การแสดงข้อมูลกิจกรรม ไปจนถึงระบบ Live Streaming และ Interactive Activities ออนไลน์ เพื่อให้ผู้ที่เข้าร่วมงานได้รับประสบการณ์ที่ดีที่สุด",
    workMode: "online" as WorkMode,
    workingHours:
      "ยืดหยุ่น แต่ควรออนไลน์ช่วง 19:00-22:00 น. สำหรับ Daily Standup",
    applicationStartDate: "2025-02-20",
    applicationEndDate: "2025-04-15",
    benefits: [
      "experience",
      "portfolio",
      "certificate",
      "network",
    ] as Benefit[],
    compensationDetail: "",
    status: "approved" as ProjectStatus,
    positions: [
      {
        id: "pos4",
        projectId: "p2",
        title: "Frontend Lead Developer",
        neededCount: 1,
        skills: [
          "React",
          "Next.js 14+",
          "TypeScript",
          "Tailwind CSS",
          "State Management",
        ],
        basicQualifications: [
          "ประสบการณ์ React/Next.js อย่างน้อย 3 ปี",
          "เข้าใจ TypeScript และ Modern JavaScript ES6+",
          "เคยทำเว็บไซต์ที่รองรับผู้ใช้จำนวนมาก",
          "มีความเข้าใจเรื่อง Performance Optimization",
        ],
        preferredQualifications:
          "มี GitHub Portfolio ที่แสดงผลงาน, เคยใช้ Microservices Architecture, รู้จัก Docker",
      },
      {
        id: "pos5",
        projectId: "p2",
        title: "Backend Developer",
        neededCount: 1,
        skills: [
          "Node.js",
          "Database Design",
          "API Development",
          "Cloud Services",
          "Security",
        ],
        basicQualifications: [
          "ประสบการณ์ Backend Development อย่างน้อย 2 ปี",
          "เข้าใจ RESTful API และ Database Design",
          "เคยใช้ Cloud Services (AWS/GCP/Azure)",
          "มีความรู้เรื่อง Security Best Practices",
        ],
        preferredQualifications:
          "รู้จัก GraphQL, เคยทำ Real-time features, มีประสบการณ์ DevOps",
      },
      {
        id: "pos6",
        projectId: "p2",
        title: "UX/UI Designer",
        neededCount: 1,
        skills: [
          "Figma",
          "User Research",
          "Responsive Design",
          "Design System",
          "Prototyping",
        ],
        basicQualifications: [
          "ประสบการณ์ UX/UI Design อย่างน้อย 2 ปี",
          "เข้าใจหิลักการ User-Centered Design",
          "สามารถทำ User Research และ Testing ได้",
          "มี Portfolio ที่แสดงกระบวนการออกแบบ",
        ],
        preferredQualifications:
          "เคยออกแบบเว็บไซต์สำหรับงานใหญ่, รู้จัก Accessibility Standards, มีประสบการณ์ Design System",
      },
    ],
    createdBy: "cstu_web_team",
    createdAt: "2025-02-10T14:20:00Z",
  },
];

// Helper function for getting project by ID
export const getDetailedProjectById = (id: string): Project | undefined => {
  return detailedMockProjects.find((project) => project.id === id);
};

// Helper function to format benefits in Thai
export const getBenefitLabel = (benefit: Benefit): string => {
  const labels = {
    certificate: "ใบประกาศนียบัตร",
    experience: "ประสบการณ์การทำงาน",
    portfolio: "ผลงานสำหรับ Portfolio",
    compensation: "ค่าตอบแทน",
    network: "เครือข่ายและการเชื่อมต่อ",
  };
  return labels[benefit];
};

// Helper function to format work mode in Thai
export const getWorkModeLabel = (workMode: WorkMode): string => {
  const labels = {
    onsite: "ทำงานที่ออฟฟิศ",
    hybrid: "ทำงานแบบผสม (Hybrid)",
    online: "ทำงานออนไลน์",
  };
  return labels[workMode];
};

// Helper function to format date
export const formatThaiDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
