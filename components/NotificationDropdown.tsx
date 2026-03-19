"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCircle2, Clock, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  mockNotifications,
  NotificationCategory,
  NotificationItem,
} from "@/lib/mockData";

const tabConfig: { key: NotificationCategory; label: string }[] = [
  { key: "my-project", label: "โปรเจกต์ของฉัน" },
  { key: "applied", label: "ที่ฉันสมัคร" },
];

function getToneStyles(tone: NotificationItem["tone"]) {
  if (tone === "success") {
    return "bg-tone-success-bg text-tone-success-fg";
  }
  if (tone === "warning") {
    return "bg-tone-warning-bg text-tone-warning-fg";
  }
  return "bg-tone-info-bg text-tone-info-fg";
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
          filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className="w-full text-left px-5 py-4 border-b border-brand-100 bg-white/70 hover:bg-white active:bg-white transition focus:outline-none"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${getToneStyles(item.tone)}`}
                >
                  {item.tone === "success" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : item.tone === "warning" ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{item.title}</span>
                    <span>{item.date}</span>
                  </div>
                  <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[11px] text-brand-500">
                    {item.projectTitle}
                  </span>
                  <p className="text-xs text-text-secondary">{item.message}</p>
                  <div className="flex items-center gap-3 text-[11px] text-brand-500">
                    <span>{item.isRead ? "อ่านแล้ว" : "ยังไม่อ่าน"}</span>
                    <span>ดู</span>
                  </div>
                </div>
                {!item.isRead && (
                  <span className="mt-2 h-2 w-2 rounded-full bg-brand-400" />
                )}
              </div>
            </button>
          ))
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
