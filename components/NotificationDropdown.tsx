"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  mockNotifications,
  NotificationCategory,
  NotificationItem,
} from "@/lib/mockData";
import { ApplicantApplicationStatus, CreatorProjectStatus } from "@/types/status";

const tabConfig: { key: NotificationCategory; label: string }[] = [
  { key: "my-project", label: "โปรเจกต์ของฉัน" },
  { key: "applied", label: "ที่ฉันสมัคร" },
];

const creatorStatusLabelMap: Record<CreatorProjectStatus, string> = {
  draft: "แบบร่าง",
  pending_approval: "รอดำเนินการ",
  rejected_by_admin: "จบแล้ว",
  approved: "รอดำเนินการ",
  open: "กำลังดำเนินการ",
  reviewing: "กำลังดำเนินการ",
  closed: "จบแล้ว",
};

const applicantStatusLabelMap: Record<ApplicantApplicationStatus, string> = {
  applied: "สมัครแล้ว",
  viewed: "เจ้าของเห็นแล้ว",
  in_review: "กำลังพิจารณา",
  shortlisted: "ผ่านรอบ",
  rejected: "ไม่ผ่าน",
  accepted: "ได้เข้าทีม",
};

type StatusTone = "gray" | "yellow" | "blue" | "green" | "red" | "purple" | "dark_gray";

function getStatusTone(status: NotificationItem["status"]): StatusTone {
  if (status === "draft") return "gray";
  if (status === "pending_approval" || status === "in_review") return "yellow";
  if (status === "approved" || status === "applied") return "blue";
  if (status === "open" || status === "shortlisted" || status === "accepted") return "green";
  if (status === "rejected_by_admin" || status === "rejected") return "red";
  if (status === "reviewing" || status === "viewed") return "purple";
  return "dark_gray";
}

function getStatusStyles(status: NotificationItem["status"]) {
  const tone = getStatusTone(status);
  if (tone === "green") return "bg-emerald-100 text-emerald-700";
  if (tone === "yellow") return "bg-amber-100 text-amber-700";
  if (tone === "blue") return "bg-sky-100 text-sky-700";
  if (tone === "red") return "bg-rose-100 text-rose-700";
  if (tone === "purple") return "bg-purple-100 text-purple-700";
  if (tone === "gray") return "bg-slate-100 text-slate-700";
  return "bg-slate-200 text-slate-800";
}

function getStatusTextStyles(status: NotificationItem["status"]) {
  const tone = getStatusTone(status);
  if (tone === "green") return "text-emerald-700";
  if (tone === "yellow") return "text-amber-700";
  if (tone === "blue") return "text-sky-700";
  if (tone === "red") return "text-rose-700";
  if (tone === "purple") return "text-purple-700";
  if (tone === "gray") return "text-slate-700";
  return "text-slate-800";
}

function getStatusDotStyles(status: NotificationItem["status"]) {
  const tone = getStatusTone(status);
  if (tone === "green") return "bg-emerald-500";
  if (tone === "yellow") return "bg-amber-500";
  if (tone === "blue") return "bg-sky-500";
  if (tone === "red") return "bg-rose-500";
  if (tone === "purple") return "bg-purple-500";
  if (tone === "gray") return "bg-slate-500";
  return "bg-slate-700";
}

function getStatusLabel(item: NotificationItem) {
  if (item.category === "my-project") {
    return creatorStatusLabelMap[item.status as CreatorProjectStatus];
  }
  return applicantStatusLabelMap[item.status as ApplicantApplicationStatus];
}

function getStatusIcon(status: NotificationItem["status"]) {
  const tone = getStatusTone(status);
  if (tone === "green") return CheckCircle2;
  if (tone === "yellow") return Clock;
  if (tone === "blue") return Bell;
  if (tone === "red") return XCircle;
  if (tone === "purple") return Eye;
  if (tone === "gray") return FileText;
  return Users;
}

export default function NotificationDropdown({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] =
    useState<NotificationCategory>("my-project");
  const [items, setItems] = useState<NotificationItem[]>(mockNotifications);

  const counts = useMemo(() => {
    return {
      "my-project": items.filter((item) => item.category === "my-project")
        .length,
      applied: items.filter((item) => item.category === "applied").length,
    };
  }, [items]);

  const filtered = useMemo(
    () => items.filter((item) => item.category === activeTab),
    [items, activeTab],
  );

  function markAllRead() {
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
  }

  function deleteAll() {
    setItems((prev) => prev.filter((item) => item.category !== activeTab));
  }

  function handleClick(item: NotificationItem) {
    setItems((prev) =>
      prev.map((entry) =>
        entry.id === item.id ? { ...entry, isRead: true } : entry,
      ),
    );
    router.push(`/project/${item.projectId}`);
    onClose();
  }

  return (
    <div className="absolute right-0 top-12 z-50 w-[360px] rounded-2xl shadow-2xl overflow-hidden border border-brand-100 bg-white">
      <div className="bg-gradient-to-r from-brand-500 via-brand-400 to-brand-300 px-5 pt-4 pb-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <span className="font-semibold">การแจ้งเตือน</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {items.filter((item) => !item.isRead).length} ใหม่
            </span>
          </div>
          <button className="text-xs underline" onClick={markAllRead}>
            อ่านทั้งหมด
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          {tabConfig.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-brand-500 shadow"
                    : "bg-white/20 text-white"
                }`}
              >
                {tab.key === "my-project" ? (
                  <Users className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                {tab.label}
                <span className="rounded-full bg-white/30 px-2 py-0.5 text-[10px]">
                  {counts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-h-[360px] overflow-y-auto bg-surface-warm">
        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-brand-400">
            ยังไม่มีการแจ้งเตือนในแท็บนี้
          </div>
        ) : (
          filtered.map((item) => {
            const StatusIcon = getStatusIcon(item.status);
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className="w-full text-left px-5 py-4 border-b border-brand-100 bg-white/70 hover:bg-white active:bg-white transition focus:outline-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusStyles(item.status)}`}
                  >
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>{item.title}</span>
                      <span>{item.date}</span>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${getStatusStyles(item.status)}`}
                    >
                      {getStatusLabel(item)}
                    </span>
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                      {item.projectTitle}
                    </span>
                    <p className="text-xs text-text-secondary">{item.message}</p>
                    <div
                      className={`flex items-center gap-3 text-[11px] ${getStatusTextStyles(item.status)}`}
                    >
                      <span>{item.isRead ? "อ่านแล้ว" : "ยังไม่อ่าน"}</span>
                      <span>ดู</span>
                    </div>
                  </div>
                  {!item.isRead && (
                    <span
                      className={`mt-2 h-2 w-2 rounded-full ${getStatusDotStyles(item.status)}`}
                    />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="bg-white px-5 py-3">
        <button
          onClick={deleteAll}
          className="flex items-center justify-center w-full gap-2 rounded-lg border border-brand-100 py-2 text-xs text-brand-500"
        >
          <Trash2 className="w-4 h-4" />
          ลบการแจ้งเตือนทั้งหมด
        </button>
      </div>
    </div>
  );
}
