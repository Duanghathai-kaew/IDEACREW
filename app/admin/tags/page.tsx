"use client";

import * as React from "react";
import { Edit3, Power } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { AdminTag, adminTags } from "@/lib/admin/mock-data";

export default function AdminTagsPage() {
  const [tags, setTags] = React.useState<AdminTag[]>(adminTags);
  const [pendingTag, setPendingTag] = React.useState<AdminTag | null>(null);
  const [editingTag, setEditingTag] = React.useState<AdminTag | null>(null);
  const [draft, setDraft] = React.useState<AdminTag | null>(null);

  const nextStatus = pendingTag?.status === "enabled" ? "disabled" : "enabled";
  const actionLabel = nextStatus === "enabled" ? "เปิดใช้งาน" : "ปิดใช้งาน";

  function openConfirm(tag: AdminTag) {
    setPendingTag(tag);
  }

  function closeConfirm() {
    setPendingTag(null);
  }

  function openEdit(tag: AdminTag) {
    setEditingTag(tag);
    setDraft({ ...tag });
  }

  function closeEdit() {
    setEditingTag(null);
    setDraft(null);
  }

  function saveEdit() {
    if (!draft) return;
    setTags((prev) => prev.map((tag) => (tag.id === draft.id ? draft : tag)));
    closeEdit();
  }

  function confirmToggle() {
    if (!pendingTag) return;

    setTags((prev) =>
      prev.map((tag) =>
        tag.id === pendingTag.id
          ? { ...tag, status: tag.status === "enabled" ? "disabled" : "enabled" }
          : tag,
      ),
    );
    setPendingTag(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Tag Management"
        description="Manage skills and categories used by project owners."
      />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tag
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Usage
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{tag.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{tag.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{tag.usageCount}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        tag.status === "enabled"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tag.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Button type="button" size="icon-sm" variant="ghost" onClick={() => openEdit(tag)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => openConfirm(tag)}
                      >
                        <Power className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {pendingTag ? (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/45 p-4"
          onClick={closeConfirm}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-800">ยืนยันการเปลี่ยนสถานะ</h3>
            <p className="mt-2 text-sm text-slate-600">
              ต้องการ{actionLabel}แท็ก <span className="font-medium text-slate-800">{pendingTag.name}</span> ใช่หรือไม่
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeConfirm}>
                ยกเลิก
              </Button>
              <Button type="button" onClick={confirmToggle}>
                ยืนยัน
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {editingTag && draft ? (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/45 p-4"
          onClick={closeEdit}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-800">แก้ไขแท็ก</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">ชื่อแท็ก</label>
                <input
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">ประเภท</label>
                <select
                  value={draft.type}
                  onChange={(event) =>
                    setDraft({ ...draft, type: event.target.value as AdminTag["type"] })
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                >
                  <option value="skill">skill</option>
                  <option value="category">category</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">จำนวนการใช้งาน</label>
                <input
                  type="number"
                  min={0}
                  value={draft.usageCount}
                  onChange={(event) =>
                    setDraft({ ...draft, usageCount: Math.max(0, Number(event.target.value) || 0) })
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">สถานะ</label>
                <select
                  value={draft.status}
                  onChange={(event) =>
                    setDraft({ ...draft, status: event.target.value as AdminTag["status"] })
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                >
                  <option value="enabled">enabled</option>
                  <option value="disabled">disabled</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeEdit}>
                ยกเลิก
              </Button>
              <Button type="button" onClick={saveEdit}>
                บันทึก
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
