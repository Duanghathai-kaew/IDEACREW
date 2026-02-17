import { Project } from "@/types/project";

export const mockProjects: Project[] = [
  {
    id: "p1",
    title: "CSTU E-Sport Tournament 2025: Voice Casting Team",
    categories: ["E-Sport", "งานอีเวนต์"],
    summary: "สร้างทีมผู้พากย์เสียงสำหรับการแข่งขัน E-Sport",
    description:
      "สร้างทีมผู้พากย์เสียงสำหรับการแข่งขัน E-Sport เพื่อเพิ่มอรรถรสในการรับชมและคุณภาพการถ่ายทอดสด โดยทีมงานจะต้องร่วมมือกันในการพัฒนาเนื้อหา สร้างเสียงประกอบ และควบคุมจังหวะเกมให้น่าติดตาม",

    workMode: "hybrid",
    workingHours: "เสาร์-อาทิตย์ 4-6 ชั่วโมง ระหว่างการแข่งขัน",

    applicationStartDate: "2025-01-15",
    applicationEndDate: "2025-02-15",

    benefits: ["experience", "portfolio", "network"],
    compensationDetail: "",

    status: "approved",

    positions: [
      {
        id: "pos1",
        projectId: "p1",
        title: "Caster หลัก (Semi-Final)",
        neededCount: 2,
        skills: ["พากย์เสียง", "ควบคุมจังหวะเกม", "เขียนสคริปต์"],
        basicQualifications: [
          "มีประสบการณ์การพากย์เสียงมาแล้ว",
          "เข้าใจกติกาเกม E-Sport",
          "มีความคล่องแคล่วในการพูด",
        ],
        preferredQualifications:
          "มีประสบการณ์การแสดง หรือเป็น MC มาก่อน จะได้รับการพิจารณาเป็นพิเศษ",
      },
      {
        id: "pos2",
        projectId: "p1",
        title: "ผู้สื่ข่าว (Final)",
        neededCount: 1,
        skills: ["การสื่อสาร", "การสัมภาษณ์", "เขียนบทสัมภาษณ์"],
        basicQualifications: [
          "มีทักษะการสื่อสาร",
          "กล้าแสดงออก",
          "รู้จักเกม E-Sport เป็นอย่างดี",
        ],
        preferredQualifications:
          "มีประสบการณ์ด้านการสื่อสารมวลชน หรือเคยทำงานด้านสื่อมาก่อน",
      },
      {
        id: "pos3",
        projectId: "p1",
        title: "Sound Engineer",
        neededCount: 1,
        skills: ["ตัดต่อเสียง", "ปรับเสียง Live", "ใช้โปรแกรม Audio"],
        basicQualifications: [
          "รู้จักโปรแกรมตัดต่อเสียง",
          "เข้าใจระบบเสียงเบื้องต้น",
          "สามารถทำงานภายใต้ความกดดันได้",
        ],
        preferredQualifications:
          "มีประสบการณ์จัดเสียง งานอีเวนต์ หรือใช้งาน Pro Tools, Logic Pro มาก่อน",
      },
    ],

    createdBy: "ทีม CSTU E-Sport",
    createdAt: "2025-01-10",
  },
  {
    id: "p2",
    title: "Website for CSTU Open House 2026",
    categories: ["พัฒนาเว็บไซต์", "งานอีเวนต์"],
    summary: "พัฒนาเว็บไซต์สำหรับงาน Open House",
    description:
      "พัฒนาเว็บไซต์สำหรับงาน Open House เพื่อประชาสัมพันธ์และให้ข้อมูลกิจกรรม โดยเว็บไซต์จะต้องมีระบบลงทะเบียน แผนที่กิจกรรม และระบบแจ้งเตือน",

    workMode: "online",
    workingHours: "จันทร์-ศุกร์ หลังเลิกเรียน 2-3 ชั่วโมง",

    applicationStartDate: "2025-02-01",
    applicationEndDate: "2025-03-01",

    benefits: ["certificate", "experience", "portfolio", "compensation"],
    compensationDetail: "3,000 บาท/เดือน สำหรับ 3 เดือน",

    status: "approved",

    positions: [
      {
        id: "pos4",
        projectId: "p2",
        title: "Frontend Developer",
        neededCount: 2,
        skills: ["React", "Next.js", "Tailwind CSS", "TypeScript"],
        basicQualifications: [
          "รู้จัก HTML, CSS, JavaScript",
          "มีประสบการณ์ React อย่างน้อย 6 เดือน",
          "สามารถใช้ Git ได้",
        ],
        preferredQualifications:
          "มีประสบการณ์ทำเว็บไซต์จริง หรือมี Portfolio ที่ดูได้",
      },
      {
        id: "pos5",
        projectId: "p2",
        title: "UX/UI Designer",
        neededCount: 1,
        skills: ["Figma", "ออกแบบ UI", "วิเคราะห์ประสบการณ์ผู้ใช้"],
        basicQualifications: [
          "รู้จักหลักการออกแบบ UI/UX",
          "ใช้ Figma หรือ Adobe XD ได้",
          "เข้าใจ User Journey",
        ],
        preferredQualifications:
          "มีประสบการณ์ออกแบบเว็บไซต์ หรือแอปพลิเคชัน มาก่อน",
      },
    ],

    createdBy: "ทีม CSTU Web Team",
    createdAt: "2025-01-20",
  },
];

// Helper function for getting project by ID
export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find((project) => project.id === id);
};

export type ProfileLink = {
  label: string;
  url: string;
};

export type ProfileProject = {
  title: string;
  role: string;
  year: string;
  description: string;
  tags: string[];
};

export type ProfileData = {
  id: string;
  name: string;
  headline: string;
  status: string;
  faculty: string;
  major: string;
  year: string;
  studentId: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  interests: string[];
  portfolioLinks: ProfileLink[];
  socialLinks: ProfileLink[];
  projects: ProfileProject[];
};

export type NotificationCategory = "my-project" | "applied";
export type NotificationTone = "success" | "warning" | "info";

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  projectTitle: string;
  projectId: string;
  date: string;
  isRead: boolean;
  tone: NotificationTone;
};

export const mockProfile: ProfileData = {
  id: "u01",
  name: "ธนากร อินทร์สุข",
  headline: "Content Creator | Creative Strategy",
  status: "พร้อมร่วมงาน",
  faculty: "คณะเทคโนโลยีสารสนเทศ",
  major: "สาขาเทคโนโลยีมัลติมีเดีย",
  year: "ชั้นปีที่ 2",
  studentId: "64123456",
  email: "thanakorn@cstu.ac.th",
  phone: "091-234-5678",
  location: "กรุงเทพฯ",
  bio: "สนใจการสร้างคอนเทนต์เชิงสร้างสรรค์และการสื่อสารแบรนด์ผ่านสื่อดิจิทัล ชอบทำงานเป็นทีมและเรียนรู้สิ่งใหม่ๆ",
  skills: [
    "Creative Design",
    "Video Editing",
    "Photography",
    "Content Writing",
    "Social Media",
    "Brand Story",
  ],
  interests: ["Motion Design", "Public Speaking", "Podcast", "UX Writing"],
  portfolioLinks: [
    { label: "Behance", url: "https://behance.net/thanakorn" },
    { label: "Google Drive", url: "https://drive.google.com/thanakorn" },
    { label: "Notion", url: "https://notion.so/thanakorn" },
  ],
  socialLinks: [
    { label: "Facebook", url: "https://facebook.com/thanakorn" },
    { label: "Instagram", url: "https://instagram.com/thanakorn" },
    { label: "LinkedIn", url: "https://linkedin.com/in/thanakorn" },
    { label: "TikTok", url: "https://tiktok.com/@thanakorn" },
  ],
  projects: [
    {
      title: "ถ่ายภาพงาน Freshy Night 2024",
      role: "ช่างภาพ",
      year: "2024",
      description: "ถ่ายภาพบรรยากาศงานและจัดทำอัลบั้มภาพสำหรับประชาสัมพันธ์",
      tags: ["Photography", "Event"],
    },
    {
      title: "คอนเทนต์รีลส์ Open House 2024",
      role: "Content Creator",
      year: "2024",
      description: "วางสคริปต์และตัดต่อวิดีโอสั้นสำหรับ TikTok/Instagram",
      tags: ["Video", "Social"],
    },
  ],
};

export const mockNotifications: NotificationItem[] = [
  {
    id: "n1",
    category: "my-project",
    title: "โปรเจกต์ได้รับการอนุมัติแล้ว!",
    message: "ยินดีด้วย! โปรเจกต์ของคุณผ่านการตรวจสอบและได้รับการอนุมัติ",
    projectTitle: "ทีมสร้าง Social Media Content สำหรับ...",
    projectId: "p1",
    date: "27 พ.ย.",
    isRead: false,
    tone: "success",
  },
  {
    id: "n2",
    category: "my-project",
    title: "มีผู้สมัครเข้าร่วมโปรเจกต์ใหม่",
    message: "มีนักศึกษาส่งใบสมัครเข้าร่วมโปรเจกต์ของคุณ 2 คน",
    projectTitle: "ทีมถ่ายทำและตัดต่อวิดีโอสำหรับ Univ...",
    projectId: "p2",
    date: "27 พ.ย.",
    isRead: false,
    tone: "info",
  },
  {
    id: "n3",
    category: "applied",
    title: "โปรเจกต์ใกล้ปิดรับสมัคร",
    message: "โปรเจกต์ที่คุณสมัครไว้ใกล้ปิดรับสมัครแล้ว",
    projectTitle: "MC และ Host สำหรับงาน CSTU Talent S...",
    projectId: "p1",
    date: "26 พ.ย.",
    isRead: true,
    tone: "warning",
  },
];
