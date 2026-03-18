"use client";

import Image from "next/image";

export default function Sidebar() {
  return (
    <aside className="overflow-hidden rounded-[20px] bg-white/90 shadow-lg backdrop-blur-[14px]">
      <div className="flex items-center gap-3 bg-linear-to-r from-[var(--brand-500)] via-[var(--brand-400)] to-[var(--brand-300)] px-[18px] py-4 font-semibold text-white">
        <Image
          src="/logo.png?v=2"
          alt="IDEACREW mark"
          width={61}
          height={67}
          className="h-14 w-auto"
          unoptimized
        />
        <span>ตัวกรอง</span>
      </div>

      <div className="p-5">
        <div className="mb-7 border-b border-slate-200 pb-5">
          <p className="mb-2.5 block font-medium">ทักษะที่ต้องการ</p>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input
              className="accent-[var(--brand-500)]"
              type="checkbox"
            />{" "}
            Frontend Dev
          </label>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input className="accent-[var(--brand-500)]" type="checkbox" /> UX/UI
            Design
          </label>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input
              className="accent-[var(--brand-500)]"
              type="checkbox"
            />{" "}
            Content Creator
          </label>
        </div>

        <div className="mb-7 border-b border-slate-200 pb-5">
          <p className="mb-2.5 block font-medium">หมวดหมู่</p>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input className="accent-[var(--brand-500)]" type="checkbox" /> E-Sport
          </label>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input
              className="accent-[var(--brand-500)]"
              type="checkbox"
            />{" "}
            Open House
          </label>
        </div>

        <div>
          <p className="mb-2.5 block font-medium">สถานะ</p>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input className="accent-[var(--brand-500)]" type="radio" name="status" />{" "}
            ทั้งหมด
          </label>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input className="accent-[var(--brand-500)]" type="radio" name="status" />{" "}
            เปิดรับ
          </label>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input className="accent-[var(--brand-500)]" type="radio" name="status" />{" "}
            ปิดรับแล้ว
          </label>
        </div>
      </div>
    </aside>
  );
}
