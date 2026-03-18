"use client";

export default function Sidebar() {
  return (
    <aside className="overflow-hidden rounded-[20px] bg-white/90 shadow-[0_10px_30px_rgb(15_23_42/0.08)] backdrop-blur-[14px]">
      <div className="flex items-center gap-3 bg-linear-to-r from-(--brand-500) via-(--brand-400) to-(--brand-300) px-[18px] py-4 font-semibold text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/90 text-lg text-(--brand-500) shadow-[0_4px_10px_rgb(15_23_42/0.14)]">
          ✦
        </div>
        <span>ตัวกรอง</span>
      </div>

      <div className="p-5">
        <div className="mb-7 border-b border-slate-200 pb-5">
          <p className="mb-2.5 block font-medium">ทักษะที่ต้องการ</p>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input
              className="accent-(--brand-500)"
              type="checkbox"
            />{" "}
            Frontend Dev
          </label>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input className="accent-(--brand-500)" type="checkbox" /> UX/UI
            Design
          </label>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input
              className="accent-(--brand-500)"
              type="checkbox"
            />{" "}
            Content Creator
          </label>
        </div>

        <div className="mb-7 border-b border-slate-200 pb-5">
          <p className="mb-2.5 block font-medium">หมวดหมู่</p>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input className="accent-(--brand-500)" type="checkbox" /> E-Sport
          </label>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input
              className="accent-(--brand-500)"
              type="checkbox"
            />{" "}
            Open House
          </label>
        </div>

        <div>
          <p className="mb-2.5 block font-medium">สถานะ</p>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input className="accent-(--brand-500)" type="radio" name="status" />{" "}
            ทั้งหมด
          </label>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input className="accent-(--brand-500)" type="radio" name="status" />{" "}
            เปิดรับ
          </label>
          <label className="mb-2 flex gap-2.5 text-sm">
            <input className="accent-(--brand-500)" type="radio" name="status" />{" "}
            ปิดรับแล้ว
          </label>
        </div>
      </div>
    </aside>
  );
}
