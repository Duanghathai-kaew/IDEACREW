"use client";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-icon">✦</div>
        <span>ตัวกรอง</span>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-label">ทักษะที่ต้องการ</p>
        <label>
          <input type="checkbox" /> Frontend Dev
        </label>
        <label>
          <input type="checkbox" /> UX/UI Design
        </label>
        <label>
          <input type="checkbox" /> Content Creator
        </label>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-label">หมวดหมู่</p>
        <label>
          <input type="checkbox" /> E-Sport
        </label>
        <label>
          <input type="checkbox" /> Open House
        </label>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-label">สถานะ</p>
        <label>
          <input type="radio" name="status" /> ทั้งหมด
        </label>
        <label>
          <input type="radio" name="status" /> เปิดรับ
        </label>
        <label>
          <input type="radio" name="status" /> ปิดรับแล้ว
        </label>
      </div>
    </aside>
  );
}
