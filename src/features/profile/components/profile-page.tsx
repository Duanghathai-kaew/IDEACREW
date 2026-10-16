"use client";

import { Editor } from "@/components/blocks/editor-00/editor";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import {
  mockProfile,
  ProfileData,
  ProfileLink,
} from "@/features/projects/services/project-mock-data";
import { SerializedEditorState } from "lexical";
import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const inputBase =
  "w-full rounded-xl border border-brand-100 bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-200";

const textAreaBase =
  "w-full rounded-xl border border-brand-100 bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-200 min-h-[110px]";

const sectionTitle = "text-base font-semibold text-brand-500";

const SKILL_OPTIONS = [
  "Creative Design",
  "Video Editing",
  "Photography",
  "Content Writing",
  "Social Media",
  "Brand Story",
  "Figma",
  "UI Design",
  "Frontend",
  "React",
  "TypeScript",
  "Project Management",
];

const INTEREST_OPTIONS = [
  "Motion Design",
  "Public Speaking",
  "Podcast",
  "UX Writing",
  "UX/UI",
  "Startups",
  "AI",
  "Product Design",
  "Community Building",
  "E-Sport",
];

function cloneProfile(data: ProfileData) {
  return JSON.parse(JSON.stringify(data)) as ProfileData;
}

function emptyLink(): ProfileLink {
  return { label: "", url: "" };
}

function emptyProject() {
  return {
    title: "",
    role: "",
    year: "",
    description: "",
    tags: [] as string[],
  };
}

function buildSerializedEditorStateFromText(
  text: string,
): SerializedEditorState {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text,
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  } as unknown as SerializedEditorState;
}

function isSerializedEditorState(
  value: unknown,
): value is SerializedEditorState {
  if (!value || typeof value !== "object") return false;
  const root = (value as { root?: unknown }).root;
  return !!root && typeof root === "object";
}

function parseBioToEditorState(bio: string): SerializedEditorState {
  const value = bio.trim();
  if (!value) return buildSerializedEditorStateFromText("");

  try {
    const parsed = JSON.parse(value) as unknown;
    if (isSerializedEditorState(parsed)) {
      return parsed;
    }
  } catch {
    // Fall through to plain text mode.
  }

  const plainText = value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return buildSerializedEditorStateFromText(plainText);
}

function extractBioDisplayText(bio: string) {
  const value = bio.trim();
  if (!value) return "-";

  try {
    const parsed = JSON.parse(value) as {
      root?: { children?: Array<{ children?: Array<{ text?: string }> }> };
    };
    const paragraphs = parsed.root?.children ?? [];
    const lines = paragraphs
      .map((paragraph) =>
        (paragraph.children ?? []).map((child) => child.text ?? "").join(""),
      )
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length > 0) {
      return lines.join("\n");
    }
  } catch {
    // Fall back to non-JSON display.
  }

  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getAcademicThaiYear(now = new Date()) {
  const buddhistYear = now.getFullYear() + 543;
  const month = now.getMonth() + 1;
  return month >= 8 ? buddhistYear : buddhistYear - 1;
}

function deriveYearFromStudentId(studentId: string) {
  if (!/^\d{10}$/.test(studentId)) return "";

  const intakeYearShort = Number(studentId.slice(0, 2));
  const currentYearShort = getAcademicThaiYear() % 100;
  let year = currentYearShort - intakeYearShort + 1;

  while (year < 1) year += 8;
  while (year > 8) year -= 8;

  return `ชั้นปีที่ ${year}`;
}

function parseUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
}

function deriveAccountLabel(url: string) {
  const parsed = parseUrl(url);
  if (!parsed) return "";

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  const segments = parsed.pathname.split("/").filter(Boolean);
  const first = segments[0] ?? "";
  const second = segments[1] ?? "";

  if (host.includes("instagram.com")) {
    return first ? `@${first.replace(/^@/, "")}` : "";
  }

  if (host.includes("tiktok.com")) {
    return first.startsWith("@") ? first : first ? `@${first}` : "";
  }

  if (host.includes("facebook.com")) {
    if (!first) return "";
    if (first === "profile.php") return "Facebook Profile";
    return `@${first.replace(/^@/, "")}`;
  }

  if (host.includes("linkedin.com")) {
    if (!first || !second) return "";
    if (first === "in") return `@${second}`;
    if (first === "company") return `@${second}`;
    return "";
  }

  if (host.includes("behance.net") || host.includes("notion.so")) {
    return first ? `@${first.replace(/^@/, "")}` : "";
  }

  if (first && !first.includes(".")) {
    return `@${first.replace(/^@/, "")}`;
  }

  return "";
}

type ProfilePageProps = {
  editable?: boolean;
  initialProfile?: ProfileData;
  userId: string;
};

export default function ProfilePage({
  editable = false,
  initialProfile = mockProfile,
  userId,
}: ProfilePageProps) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [draft, setDraft] = useState<ProfileData>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const response = await fetch(
          `/api/profile?userId=${encodeURIComponent(userId)}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;

        const result = (await response.json()) as { data?: ProfileData };
        if (!mounted || !result.data) return;

        setProfile(result.data);
        setDraft(result.data);
      } catch {
        // Keep current data when request fails.
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const data = isEditing ? draft : profile;

  const fullNameInitials = useMemo(() => {
    const parts = data.name.split(" ").filter(Boolean);
    if (parts.length === 0) return "IC";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [data.name]);

  function startEdit() {
    const next = cloneProfile(profile);
    if (next.portfolioLinks.length === 0) next.portfolioLinks.push(emptyLink());
    if (next.socialLinks.length === 0) next.socialLinks.push(emptyLink());
    if (next.projects.length === 0) next.projects.push(emptyProject());
    setDraft(next);
    setIsEditing(true);
  }

  function cancelEdit() {
    setDraft(cloneProfile(profile));
    setIsEditing(false);
  }

  async function saveEdit() {
    if (isSaving) return;
    if (!/^\d{10}$/.test(draft.studentId)) {
      window.alert("รหัสนักศึกษาต้องเป็นตัวเลข 10 หลัก");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          profile: draft,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      setProfile(cloneProfile(draft));
      setIsEditing(false);
    } catch {
      // Keep draft values so user can retry save.
    } finally {
      setIsSaving(false);
    }
  }

  function updateLink(
    listKey: "portfolioLinks" | "socialLinks",
    index: number,
    field: keyof ProfileLink,
    value: string,
  ) {
    setDraft((prev) => {
      const next = cloneProfile(prev);
      next[listKey][index][field] = value;
      return next;
    });
  }

  function addLink(listKey: "portfolioLinks" | "socialLinks") {
    setDraft((prev) => {
      const next = cloneProfile(prev);
      next[listKey].push(emptyLink());
      return next;
    });
  }

  function addProject() {
    setDraft((prev) => {
      const next = cloneProfile(prev);
      next.projects.push(emptyProject());
      return next;
    });
  }

  return (
    <main className="bg-surface-warm min-h-screen">
      <section className="max-w-4xl mx-auto px-6 pt-10 pb-16 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-500">
            โปรไฟล์ของฉัน
          </h1>
          <p className="text-sm md:text-base text-brand-400">
            แสดงตัวตนและผลงานเพื่อให้ทีมอื่นๆ รู้จักคุณมากขึ้น
          </p>
        </header>

        {editable && (
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded-full text-sm font-medium border border-brand-200 text-brand-500 bg-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-brand-300 shadow disabled:opacity-60"
                >
                  {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEdit}
                className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-brand-300 shadow"
              >
                แก้ไขโปรไฟล์
              </button>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-6 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-brand-500 to-brand-300 flex items-center justify-center text-white text-xl font-semibold">
            {fullNameInitials}
          </div>
          <div className="flex-1 space-y-2">
            {isEditing ? (
              <input
                type="text"
                value={draft.name}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, name: e.target.value }))
                }
                autoComplete="name"
                placeholder="ชื่อที่ต้องการแสดงบนโปรไฟล์"
                className={inputBase}
              />
            ) : (
              <h2 className="text-xl font-semibold text-text-primary">
                {data.name}
              </h2>
            )}
            {isEditing ? (
              <input
                type="text"
                value={draft.headline}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, headline: e.target.value }))
                }
                autoComplete="organization-title"
                placeholder="คำอธิบายสั้น ๆ เช่น Frontend Developer / Graphic Designer"
                className={inputBase}
              />
            ) : (
              <p className="text-sm text-text-secondary">{data.headline}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tone-success-bg text-tone-success-fg">
                {data.status}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {data.location}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {data.year}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-6 space-y-3">
            <h3 className={sectionTitle}>ข้อมูลส่วนตัว</h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-text-secondary">
              <div>
                <p className="text-xs text-text-muted">คณะ</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={draft.faculty}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, faculty: e.target.value }))
                    }
                    autoComplete="organization"
                    placeholder="เช่น วิทยาศาสตร์และเทคโนโลยี"
                    className={inputBase}
                  />
                ) : (
                  <p>{data.faculty}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-text-muted">สาขา</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={draft.major}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, major: e.target.value }))
                    }
                    autoComplete="organization-title"
                    placeholder="เช่น วิทยาการคอมพิวเตอร์"
                    className={inputBase}
                  />
                ) : (
                  <p>{data.major}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-text-muted">รหัสนักศึกษา</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={draft.studentId}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        studentId: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                        year: deriveYearFromStudentId(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        ),
                      }))
                    }
                    inputMode="numeric"
                    maxLength={10}
                    pattern="\d{10}"
                    placeholder="รหัสนักศึกษา 10 หลัก"
                    className={inputBase}
                  />
                ) : (
                  <p>{data.studentId}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-6 space-y-3">
            <h3 className={sectionTitle}>ข้อมูลติดต่อ</h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, email: e.target.value }))
                    }
                    autoComplete="email"
                    placeholder="อีเมลที่ติดต่อได้"
                    className={inputBase}
                  />
                ) : (
                  <span>{data.email}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={draft.phone}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="เบอร์โทรศัพท์"
                    className={inputBase}
                  />
                ) : (
                  <span>{data.phone}</span>
                )}
              </div>
              <div>
                <p className="text-xs text-text-muted">ที่อยู่/พื้นที่</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={draft.location}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    autoComplete="address-level2"
                    placeholder="เช่น กรุงเทพฯ / ปทุมธานี"
                    className={inputBase}
                  />
                ) : (
                  <p>{data.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-6 space-y-4">
          <h3 className={sectionTitle}>เกี่ยวกับฉัน</h3>
          {isEditing ? (
            <div className="space-y-2">
              <p className="text-xs text-text-muted">
                แนะนำตัวสั้น ๆ: ความถนัด ประสบการณ์ หรือประเภทงานที่อยากทำ
              </p>
              <Editor
                editorSerializedState={parseBioToEditorState(draft.bio)}
                onSerializedChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    bio: JSON.stringify(value),
                  }))
                }
              />
            </div>
          ) : (
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
              {extractBioDisplayText(data.bio)}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-6 space-y-4">
          <h3 className={sectionTitle}>ทักษะและความสนใจ</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-muted mb-2">ทักษะ</p>
                <MultiSelectCombobox
                  value={draft.skills}
                  onChange={(next) =>
                    setDraft((prev) => ({
                      ...prev,
                      skills: next,
                    }))
                  }
                  options={SKILL_OPTIONS}
                  placeholder="เลือกหรือพิมพ์ทักษะ"
                  searchPlaceholder="ค้นหาทักษะ..."
                />
              </div>
              <div>
                <p className="text-xs text-text-muted mb-2">ความสนใจ</p>
                <MultiSelectCombobox
                  value={draft.interests}
                  onChange={(next) =>
                    setDraft((prev) => ({
                      ...prev,
                      interests: next,
                    }))
                  }
                  options={INTEREST_OPTIONS}
                  placeholder="เลือกหรือพิมพ์ความสนใจ"
                  searchPlaceholder="ค้นหาความสนใจ..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-text-muted">ทักษะ</p>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-500"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-text-muted">ความสนใจ</p>
                <div className="flex flex-wrap gap-2">
                  {data.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 text-xs rounded-full bg-brand-50 text-brand-500"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-6 space-y-4">
            <h3 className={sectionTitle}>Portfolio URLs</h3>
            <div className="space-y-3">
              {data.portfolioLinks.map((link, index) => (
                <div key={index} className="space-y-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        value={draft.portfolioLinks[index]?.label ?? ""}
                        onChange={(e) =>
                          updateLink(
                            "portfolioLinks",
                            index,
                            "label",
                            e.target.value,
                          )
                        }
                        placeholder="ชื่อผลงาน / ชื่อเว็บ"
                        className={inputBase}
                      />
                      <input
                        value={draft.portfolioLinks[index]?.url ?? ""}
                        onChange={(e) =>
                          updateLink(
                            "portfolioLinks",
                            index,
                            "url",
                            e.target.value,
                          )
                        }
                        placeholder="ลิงก์ผลงาน เช่น https://..."
                        className={inputBase}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-brand-500 hover:underline"
                      >
                        {link.label}
                      </a>
                      {deriveAccountLabel(link.url) ? (
                        <span className="text-xs text-text-muted">
                          {deriveAccountLabel(link.url)}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => addLink("portfolioLinks")}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-brand-200 text-brand-500 bg-white"
                >
                  เพิ่ม Portfolio URL
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-6 space-y-4">
            <h3 className={sectionTitle}>Social Links</h3>
            <div className="space-y-3">
              {data.socialLinks.map((link, index) => (
                <div key={index} className="space-y-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        value={draft.socialLinks[index]?.label ?? ""}
                        onChange={(e) =>
                          updateLink(
                            "socialLinks",
                            index,
                            "label",
                            e.target.value,
                          )
                        }
                        placeholder="ชื่อแพลตฟอร์ม เช่น Instagram, LinkedIn"
                        className={inputBase}
                      />
                      <input
                        value={draft.socialLinks[index]?.url ?? ""}
                        onChange={(e) =>
                          updateLink(
                            "socialLinks",
                            index,
                            "url",
                            e.target.value,
                          )
                        }
                        placeholder="ลิงก์โปรไฟล์ เช่น https://..."
                        className={inputBase}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-brand-500 hover:underline"
                      >
                        {link.label}
                      </a>
                      {deriveAccountLabel(link.url) ? (
                        <span className="text-xs text-text-muted">
                          {deriveAccountLabel(link.url)}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => addLink("socialLinks")}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-brand-200 text-brand-500 bg-white"
                >
                  เพิ่ม Social Link
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className={sectionTitle}>ผลงานและโปรเจกต์</h3>
          {isEditing && (
            <button
              type="button"
              onClick={addProject}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-brand-200 text-brand-500 bg-white"
            >
              เพิ่มผลงาน/โปรเจกต์
            </button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.projects.map((project, index) => (
              <article
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden"
              >
                <div className="h-36 bg-gradient-to-r from-brand-200 to-brand-100" />
                <div className="p-4 space-y-2">
                  {isEditing ? (
                    <input
                      value={draft.projects[index]?.title ?? ""}
                      onChange={(e) =>
                        setDraft((prev) => {
                          const next = cloneProfile(prev);
                          next.projects[index].title = e.target.value;
                          return next;
                        })
                      }
                      placeholder="ชื่อผลงานหรือโปรเจกต์"
                      className={inputBase}
                    />
                  ) : (
                    <h4 className="text-sm font-semibold text-text-primary">
                      {project.title}
                    </h4>
                  )}
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    {isEditing ? (
                      <input
                        value={draft.projects[index]?.role ?? ""}
                        onChange={(e) =>
                          setDraft((prev) => {
                            const next = cloneProfile(prev);
                            next.projects[index].role = e.target.value;
                            return next;
                          })
                        }
                        placeholder="บทบาทของคุณ"
                        className={inputBase}
                      />
                    ) : (
                      <span>{project.role}</span>
                    )}
                    <span>•</span>
                    {isEditing ? (
                      <input
                        value={draft.projects[index]?.year ?? ""}
                        onChange={(e) =>
                          setDraft((prev) => {
                            const next = cloneProfile(prev);
                            next.projects[index].year = e.target.value;
                            return next;
                          })
                        }
                        placeholder="ปีที่ทำ เช่น 2025"
                        className={inputBase}
                      />
                    ) : (
                      <span>{project.year}</span>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      value={draft.projects[index]?.description ?? ""}
                      onChange={(e) =>
                        setDraft((prev) => {
                          const next = cloneProfile(prev);
                          next.projects[index].description = e.target.value;
                          return next;
                        })
                      }
                      placeholder="สรุปสิ่งที่ทำและผลลัพธ์ของโปรเจกต์นี้"
                      className={textAreaBase}
                    />
                  ) : (
                    <p className="text-xs text-text-secondary">
                      {project.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      <input
                        defaultValue={draft.projects[index]?.tags.join(", ") ?? ""}
                        onChange={(e) =>
                          setDraft((prev) => {
                            const next = cloneProfile(prev);
                            next.projects[index].tags = e.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean);
                            return next;
                          })
                        }
                        placeholder="แท็กคั่นด้วย comma เช่น React, Node.js, UX"
                        className={inputBase}
                      />
                    ) : (
                      project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs rounded-full bg-brand-50 text-brand-500"
                        >
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
