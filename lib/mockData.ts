import { Project } from "@/types/project";
import {
  ApplicantApplicationStatus,
  CreatorProjectStatus,
} from "@/types/status";

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

    status: "open",

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

    status: "open",

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
  {
    id: "p3",
    title: "Prototype ระบบจองห้องประชุมภายในคณะ",
    categories: ["พัฒนาเว็บไซต์", "ระบบภายใน"],
    summary: "ต้นฉบับระบบจองห้องประชุม ยังอยู่ช่วงร่างโครงงาน",
    description:
      "โปรเจกต์นี้ยังอยู่ในระยะร่างแนวคิด (Draft) และกำลังจัดโครงสร้างฐานข้อมูลกับหน้าจอเบื้องต้น",
    workMode: "online",
    workingHours: "ยืดหยุ่นตามทีม",
    applicationStartDate: "2025-04-01",
    applicationEndDate: "2025-04-30",
    benefits: ["experience", "portfolio"],
    compensationDetail: "",
    status: "draft",
    positions: [
      {
        id: "pos6",
        projectId: "p3",
        title: "Frontend Developer",
        neededCount: 1,
        skills: ["React", "TypeScript"],
        basicQualifications: ["เข้าใจ React พื้นฐาน", "ทำงานร่วมกับทีมได้"],
      },
    ],
    createdBy: "ทีม Internal Systems",
    createdAt: "2025-02-05",
  },
  {
    id: "p4",
    title: "CSTU Career Fair Matching Platform",
    categories: ["แพลตฟอร์ม", "กิจกรรมมหาวิทยาลัย"],
    summary: "แพลตฟอร์มจับคู่บริษัทและนักศึกษา ส่งตรวจแอดมินแล้ว",
    description:
      "รายละเอียดโปรเจกต์ครบถ้วนและถูกส่งให้แอดมินตรวจสอบสถานะเพื่ออนุมัติการเผยแพร่",
    workMode: "hybrid",
    workingHours: "อังคาร-พฤหัส 18:00-21:00",
    applicationStartDate: "2025-04-10",
    applicationEndDate: "2025-05-10",
    benefits: ["experience", "network", "certificate"],
    compensationDetail: "",
    status: "pending_approval",
    positions: [
      {
        id: "pos7",
        projectId: "p4",
        title: "Backend Developer",
        neededCount: 1,
        skills: ["Node.js", "PostgreSQL"],
        basicQualifications: ["ออกแบบ API ได้", "มีพื้นฐานฐานข้อมูล"],
      },
    ],
    createdBy: "ทีม Career Hub",
    createdAt: "2025-02-12",
  },
  {
    id: "p5",
    title: "CSTU Alumni Story Podcast",
    categories: ["สื่อ", "พอดแคสต์"],
    summary: "โปรเจกต์พอดแคสต์ศิษย์เก่า ถูกตีกลับให้แก้รายละเอียด",
    description:
      "โปรเจกต์นี้ได้รับข้อเสนอแนะจากแอดมินให้ปรับรายละเอียดงบประมาณและแผนการผลิตก่อนส่งใหม่",
    workMode: "onsite",
    workingHours: "เสาร์ 10:00-16:00",
    applicationStartDate: "2025-04-15",
    applicationEndDate: "2025-05-15",
    benefits: ["experience", "portfolio"],
    compensationDetail: "",
    status: "rejected_by_admin",
    positions: [
      {
        id: "pos8",
        projectId: "p5",
        title: "Sound Editor",
        neededCount: 1,
        skills: ["Audio Editing", "Podcast Production"],
        basicQualifications: ["ใช้โปรแกรมตัดต่อเสียงได้", "สื่อสารกับทีมได้ดี"],
      },
    ],
    createdBy: "ทีม Media Lab",
    createdAt: "2025-02-18",
  },
  {
    id: "p6",
    title: "CSTU Mentorship Portal",
    categories: ["ระบบชุมชน", "เว็บไซต์"],
    summary: "โปรเจกต์ผ่านอนุมัติแล้ว แต่ยังไม่เปิดรับสมัคร",
    description:
      "โครงสร้างและรายละเอียดผ่านแอดมินเรียบร้อย อยู่ในสถานะ Approved รอเปิดรับตามกำหนด",
    workMode: "online",
    workingHours: "จันทร์-ศุกร์ 20:00-22:00",
    applicationStartDate: "2025-05-01",
    applicationEndDate: "2025-06-01",
    benefits: ["certificate", "experience", "network"],
    compensationDetail: "",
    status: "approved",
    positions: [
      {
        id: "pos9",
        projectId: "p6",
        title: "Product Designer",
        neededCount: 1,
        skills: ["Figma", "UX Research"],
        basicQualifications: ["ออกแบบ user flow ได้", "เข้าใจหลัก UX"],
      },
    ],
    createdBy: "ทีม CSTU Mentors",
    createdAt: "2025-02-22",
  },
  {
    id: "p7",
    title: "CSTU Hackathon 2026",
    categories: ["งานอีเวนต์", "เทคโนโลยี"],
    summary: "โปรเจกต์อยู่ระหว่างคัดเลือกทีมงาน",
    description:
      "เปิดรับสมัครแล้วและกำลังเข้าสู่ช่วง Reviewing เพื่อคัดเลือกผู้สมัครให้ตรงตำแหน่ง",
    workMode: "hybrid",
    workingHours: "เสาร์-อาทิตย์",
    applicationStartDate: "2025-03-20",
    applicationEndDate: "2025-04-20",
    benefits: ["experience", "network", "portfolio", "compensation"],
    compensationDetail: "เบี้ยเลี้ยงตามบทบาท",
    status: "reviewing",
    positions: [
      {
        id: "pos10",
        projectId: "p7",
        title: "Event Coordinator",
        neededCount: 2,
        skills: ["Coordination", "Communication"],
        basicQualifications: ["จัดการตารางงานได้", "ทำงานหน้างานได้"],
      },
    ],
    createdBy: "ทีม Hackathon",
    createdAt: "2025-02-28",
  },
  {
    id: "p8",
    title: "CSTU Orientation Buddy Program",
    categories: ["กิจกรรมนักศึกษา"],
    summary: "โปรเจกต์ปิดรับสมัครและปิดงานแล้ว",
    description:
      "ปิดรับสมัครเรียบร้อยและส่งมอบงานครบถ้วน อยู่ในสถานะ Closed เพื่ออ้างอิงย้อนหลัง",
    workMode: "onsite",
    workingHours: "ตามตารางกิจกรรม",
    applicationStartDate: "2025-01-01",
    applicationEndDate: "2025-01-31",
    benefits: ["certificate", "experience"],
    compensationDetail: "",
    status: "closed",
    positions: [
      {
        id: "pos11",
        projectId: "p8",
        title: "Student Buddy",
        neededCount: 5,
        skills: ["Mentoring", "Communication"],
        basicQualifications: ["มีทักษะการสื่อสาร", "ทำงานเป็นทีมได้"],
      },
    ],
    createdBy: "ทีม Student Affairs",
    createdAt: "2024-12-20",
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
export type NotificationStatus = CreatorProjectStatus | ApplicantApplicationStatus;

type NotificationBase = {
  id: string;
  title: string;
  message: string;
  projectTitle: string;
  projectId: string;
  date: string;
  isRead: boolean;
};

export type NotificationItem =
  | (NotificationBase & {
      category: "my-project";
      status: CreatorProjectStatus;
    })
  | (NotificationBase & {
      category: "applied";
      status: ApplicantApplicationStatus;
    });

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
    title: "โปรเจกต์ยังเป็นแบบร่าง",
    message: "คุณยังไม่ได้ส่งโปรเจกต์ให้แอดมินตรวจสอบ",
    projectTitle: "Prototype ระบบจองห้องประชุมภายในคณะ",
    projectId: "p3",
    date: "28 พ.ย.",
    isRead: true,
    status: "draft",
  },
  {
    id: "n2",
    category: "my-project",
    title: "โปรเจกต์อยู่ระหว่างรออนุมัติ",
    message: "แอดมินได้รับคำขอแล้ว กำลังตรวจสอบรายละเอียด",
    projectTitle: "CSTU Career Fair Matching Platform",
    projectId: "p4",
    date: "28 พ.ย.",
    isRead: false,
    status: "pending_approval",
  },
  {
    id: "n3",
    category: "my-project",
    title: "โปรเจกต์ถูกตีกลับโดยแอดมิน",
    message: "กรุณาแก้ไขข้อมูลงบประมาณและส่งใหม่อีกครั้ง",
    projectTitle: "CSTU Alumni Story Podcast",
    projectId: "p5",
    date: "27 พ.ย.",
    isRead: false,
    status: "rejected_by_admin",
  },
  {
    id: "n4",
    category: "my-project",
    title: "โปรเจกต์ได้รับการอนุมัติแล้ว",
    message: "คุณสามารถตั้งเวลาเปิดรับสมัครได้ทันที",
    projectTitle: "CSTU Mentorship Portal",
    projectId: "p6",
    date: "27 พ.ย.",
    isRead: false,
    status: "approved",
  },
  {
    id: "n5",
    category: "my-project",
    title: "โปรเจกต์เปิดรับสมัครแล้ว",
    message: "ตอนนี้นักศึกษาสามารถเห็นและสมัครโปรเจกต์นี้ได้",
    projectTitle: "ทีมสร้าง Social Media Content สำหรับ...",
    projectId: "p1",
    date: "27 พ.ย.",
    isRead: false,
    status: "open",
  },
  {
    id: "n6",
    category: "my-project",
    title: "กำลังคัดเลือกผู้สมัคร",
    message: "มีผู้สมัครใหม่และระบบจัดลำดับเบื้องต้นให้แล้ว",
    projectTitle: "CSTU Hackathon 2026",
    projectId: "p7",
    date: "26 พ.ย.",
    isRead: false,
    status: "reviewing",
  },
  {
    id: "n7",
    category: "my-project",
    title: "โปรเจกต์ปิดรับสมัครแล้ว",
    message: "ระบบปิดรับอัตโนมัติตามวันสิ้นสุดการรับสมัคร",
    projectTitle: "CSTU Orientation Buddy Program",
    projectId: "p8",
    date: "26 พ.ย.",
    isRead: true,
    status: "closed",
  },
  {
    id: "n8",
    category: "applied",
    title: "ส่งใบสมัครเรียบร้อย",
    message: "ระบบบันทึกใบสมัครของคุณแล้ว",
    projectTitle: "CSTU E-Sport Tournament 2025: Voice Cas...",
    projectId: "p1",
    date: "25 พ.ย.",
    isRead: true,
    status: "applied",
  },
  {
    id: "n9",
    category: "applied",
    title: "ใบสมัครอยู่ระหว่าง review",
    message: "ทีมงานกำลังพิจารณาใบสมัครของคุณ",
    projectTitle: "Website for CSTU Open House 2026",
    projectId: "p2",
    date: "25 พ.ย.",
    isRead: false,
    status: "in_review",
  },
  {
    id: "n10",
    category: "applied",
    title: "ใบสมัครกำลังอยู่ระหว่างพิจารณา",
    message: "ทีมงานกำลังประเมินความเหมาะสมของผู้สมัคร",
    projectTitle: "CSTU Hackathon 2026",
    projectId: "p7",
    date: "24 พ.ย.",
    isRead: true,
    status: "in_review",
  },
  {
    id: "n11",
    category: "applied",
    title: "คุณได้รับเลือกเข้าทีม",
    message: "ยินดีด้วย! คุณผ่านรอบและได้รับเลือกเข้าร่วมทีมแล้ว",
    projectTitle: "CSTU E-Sport Tournament 2025: Voice Cas...",
    projectId: "p1",
    date: "24 พ.ย.",
    isRead: false,
    status: "accepted",
  },
  {
    id: "n12",
    category: "applied",
    title: "ผลการสมัครไม่ผ่าน",
    message: "โปรเจกต์คัดเลือกครบแล้วและใบสมัครของคุณไม่ได้รับเลือก",
    projectTitle: "CSTU Alumni Story Podcast",
    projectId: "p2",
    date: "23 พ.ย.",
    isRead: false,
    status: "rejected",
  },
  {
    id: "n13",
    category: "applied",
    title: "คุณได้รับการตอบรับเข้าทีมแล้ว",
    message: "ยินดีด้วย! กรุณายืนยันการเข้าร่วมภายใน 24 ชั่วโมง",
    projectTitle: "Website for CSTU Open House 2026",
    projectId: "p2",
    date: "23 พ.ย.",
    isRead: false,
    status: "accepted",
  },
];

export type ApplicantApplicationItem = {
  id: string;
  projectId: string;
  projectTitle: string;
  appliedAt: string;
  status: ApplicantApplicationStatus;
};

export const mockApplicantApplications: ApplicantApplicationItem[] = [
  {
    id: "a1",
    projectId: "p1",
    projectTitle: "CSTU E-Sport Tournament 2025: Voice Casting Team",
    appliedAt: "2025-03-10",
    status: "applied",
  },
  {
    id: "a2",
    projectId: "p2",
    projectTitle: "Website for CSTU Open House 2026",
    appliedAt: "2025-03-12",
    status: "in_review",
  },
  {
    id: "a3",
    projectId: "p7",
    projectTitle: "CSTU Hackathon 2026",
    appliedAt: "2025-03-15",
    status: "in_review",
  },
  {
    id: "a4",
    projectId: "p1",
    projectTitle: "CSTU E-Sport Tournament 2025: Voice Casting Team",
    appliedAt: "2025-03-18",
    status: "accepted",
  },
  {
    id: "a5",
    projectId: "p5",
    projectTitle: "CSTU Alumni Story Podcast",
    appliedAt: "2025-03-20",
    status: "rejected",
  },
  {
    id: "a6",
    projectId: "p2",
    projectTitle: "Website for CSTU Open House 2026",
    appliedAt: "2025-03-22",
    status: "accepted",
  },
];
