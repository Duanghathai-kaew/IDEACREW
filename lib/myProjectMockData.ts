export type MyProjectStatus =
  | "draft"
  | "open"
  | "pending_approval"
  | "rejected_by_admin"
  | "approved"
  | "reviewing"
  | "closed";

export type MyProject = {
  id: string;
  detailId?: string;
  title: string;
  status: MyProjectStatus;
  createdAt: string;
  summary: string;
  tags: string[];
  applicants: number;
  deadline: string;
};

export const mockMyProjects: MyProject[] = [
  {
    id: "p101",
    detailId: "p1",
    title: "Social Media Content ทีม CSTU Innovation Week",
    status: "open",
    createdAt: "20 พฤศจิกายน 2567",
    summary:
      "ต้องการทีมสร้างคอนเทนต์สั้นสำหรับประชาสัมพันธ์ผ่าน TikTok, Instagram และ Facebook",
    tags: ["สื่อสังคม", "Content Creator"],
    applicants: 4,
    deadline: "15 ธ.ค. 2568",
  },
  {
    id: "p102",
    title: "ระบบติดตามฟังก์ชันสหกิจฯ",
    status: "pending_approval",
    createdAt: "26 พฤศจิกายน 2567",
    summary: "พัฒนาเว็บแอปติดตามเอกสารสหกิจฯ และระบบแจ้งเตือนสถานะ",
    tags: ["Frontend Dev", "React"],
    applicants: 3,
    deadline: "1 ธ.ค. 2568",
  },
  {
    id: "p103",
    title: "ออกแบบ Key Visual งาน Freshy Night 2025",
    status: "rejected_by_admin",
    createdAt: "18 พฤศจิกายน 2567",
    summary: "ออกแบบสื่อภาพนิ่งและชุดคีย์วิชวลสำหรับงานใหญ่ประจำปี",
    tags: ["กราฟิก/ดีไซน์"],
    applicants: 2,
    deadline: "30 พ.ย. 2568",
  },
  {
    id: "p104",
    title: "MC and Host สำหรับงาน CSTU Talent Show",
    status: "pending_approval",
    createdAt: "27 พฤศจิกายน 2567",
    summary: "คัดเลือกพิธีกรหลักและพิธีกรร่วมดูแลบรรยากาศบนเวที",
    tags: ["MC/ดำเนินรายการ"],
    applicants: 2,
    deadline: "10 ธ.ค. 2568",
  },
  {
    id: "p105",
    detailId: "p2",
    title: "Open House University Tour",
    status: "open",
    createdAt: "22 พฤศจิกายน 2567",
    summary: "ดูแลกิจกรรมทัวร์คณะและการจัดคิวผู้เข้าร่วมงาน",
    tags: ["กิจกรรม/ประสานงาน", "Open House"],
    applicants: 5,
    deadline: "20 ธ.ค. 2568",
  },
  {
    id: "p106",
    title: "CSTU Mentorship Portal",
    status: "approved",
    createdAt: "23 พฤศจิกายน 2567",
    summary: "อนุมัติแล้ว รอตั้งเวลาเปิดรับสมัคร",
    tags: ["Mentor", "Community"],
    applicants: 0,
    deadline: "1 ม.ค. 2569",
  },
  {
    id: "p107",
    title: "CSTU Hackathon 2026",
    status: "reviewing",
    createdAt: "24 พฤศจิกายน 2567",
    summary: "อยู่ช่วงคัดเลือกผู้สมัครให้ตรงตำแหน่ง",
    tags: ["Hackathon", "Event"],
    applicants: 12,
    deadline: "5 ม.ค. 2569",
  },
  {
    id: "p108",
    title: "Prototype ระบบจองห้องประชุม",
    status: "draft",
    createdAt: "25 พฤศจิกายน 2567",
    summary: "ยังไม่ส่งตรวจ กำลังเขียนรายละเอียดโครงงาน",
    tags: ["Internal Tool"],
    applicants: 0,
    deadline: "ยังไม่กำหนด",
  },
  {
    id: "p109",
    title: "CSTU Orientation Buddy Program",
    status: "closed",
    createdAt: "10 พฤศจิกายน 2567",
    summary: "ปิดรับสมัครและสิ้นสุดโปรเจกต์เรียบร้อย",
    tags: ["Student Activity"],
    applicants: 18,
    deadline: "31 พ.ย. 2568",
  },
];
