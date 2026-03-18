"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import { mockProfile, ProfileData, ProfileLink } from "@/lib/mockData";

const inputBase =
  "w-full rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200";

const textAreaBase =
  "w-full rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 min-h-[110px]";

const sectionTitle = "text-base font-semibold text-orange-600";

function cloneProfile(data: ProfileData) {
  return JSON.parse(JSON.stringify(data)) as ProfileData;
}

type ProfilePageProps = {
  editable?: boolean;
  initialProfile?: ProfileData;
};

export default function ProfilePage({
  editable = false,
  initialProfile = mockProfile,
}: ProfilePageProps) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [draft, setDraft] = useState<ProfileData>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  const data = isEditing ? draft : profile;

  const fullNameInitials = useMemo(() => {
    const parts = data.name.split(" ").filter(Boolean);
    if (parts.length === 0) return "IC";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [data.name]);

  function startEdit() {
    setDraft(cloneProfile(profile));
    setIsEditing(true);
  }

  function cancelEdit() {
    setDraft(cloneProfile(profile));
    setIsEditing(false);
  }

  function saveEdit() {
    setProfile(cloneProfile(draft));
    setIsEditing(false);
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

  return (
    <main className="bg-[#fff7f2] min-h-screen">
      <section className="max-w-4xl mx-auto px-6 pt-10 pb-16 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-orange-500">
            โปรไฟล์ของฉัน
          </h1>
          <p className="text-sm md:text-base text-orange-400">
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
                  className="px-4 py-2 rounded-full text-sm font-medium border border-orange-200 text-orange-500 bg-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-amber-400 shadow"
                >
                  บันทึก
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEdit}
                className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-amber-400 shadow"
              >
                แก้ไขโปรไฟล์
              </button>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center text-white text-xl font-semibold">
            {fullNameInitials}
          </div>
          <div className="flex-1 space-y-2">
            {isEditing ? (
              <input
                value={draft.name}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, name: e.target.value }))
                }
                className={inputBase}
              />
            ) : (
              <h2 className="text-xl font-semibold text-gray-800">
                {data.name}
              </h2>
            )}
            {isEditing ? (
              <input
                value={draft.headline}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, headline: e.target.value }))
                }
                className={inputBase}
              />
            ) : (
              <p className="text-sm text-gray-500">{data.headline}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">
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
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-3">
            <h3 className={sectionTitle}>ข้อมูลส่วนตัว</h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
              <div>
                <p className="text-xs text-gray-400">คณะ</p>
                {isEditing ? (
                  <input
                    value={draft.faculty}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, faculty: e.target.value }))
                    }
                    className={inputBase}
                  />
                ) : (
                  <p>{data.faculty}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400">สาขา</p>
                {isEditing ? (
                  <input
                    value={draft.major}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, major: e.target.value }))
                    }
                    className={inputBase}
                  />
                ) : (
                  <p>{data.major}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400">รหัสนักศึกษา</p>
                {isEditing ? (
                  <input
                    value={draft.studentId}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        studentId: e.target.value,
                      }))
                    }
                    className={inputBase}
                  />
                ) : (
                  <p>{data.studentId}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-3">
            <h3 className={sectionTitle}>ข้อมูลติดต่อ</h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400" />
                {isEditing ? (
                  <input
                    value={draft.email}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className={inputBase}
                  />
                ) : (
                  <span>{data.email}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400" />
                {isEditing ? (
                  <input
                    value={draft.phone}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className={inputBase}
                  />
                ) : (
                  <span>{data.phone}</span>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400">ที่อยู่/พื้นที่</p>
                {isEditing ? (
                  <input
                    value={draft.location}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className={inputBase}
                  />
                ) : (
                  <p>{data.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-4">
          <h3 className={sectionTitle}>เกี่ยวกับฉัน</h3>
          {isEditing ? (
            <textarea
              value={draft.bio}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, bio: e.target.value }))
              }
              className={textAreaBase}
            />
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed">{data.bio}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-4">
          <h3 className={sectionTitle}>ทักษะและความสนใจ</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-2">ทักษะ</p>
                <textarea
                  value={draft.skills.join(", ")}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      skills: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    }))
                  }
                  className={textAreaBase}
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">ความสนใจ</p>
                <textarea
                  value={draft.interests.join(", ")}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      interests: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    }))
                  }
                  className={textAreaBase}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-500"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {data.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 text-xs rounded-full bg-orange-50 text-orange-500"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-4">
            <h3 className={sectionTitle}>Portfolio URLs</h3>
            <div className="space-y-3">
              {data.portfolioLinks.map((link, index) => (
                <div key={link.label + index} className="space-y-1">
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
                        className={inputBase}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-400">{link.label}</p>
                      <p className="text-sm text-orange-500 truncate">
                        {link.url}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-4">
            <h3 className={sectionTitle}>Social Links</h3>
            <div className="space-y-3">
              {data.socialLinks.map((link, index) => (
                <div key={link.label + index} className="space-y-1">
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
                        className={inputBase}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-400">{link.label}</p>
                      <p className="text-sm text-orange-500 truncate">
                        {link.url}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className={sectionTitle}>ผลงานและโปรเจกต์</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.projects.map((project, index) => (
              <article
                key={project.title + index}
                className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden"
              >
                <div className="h-36 bg-gradient-to-r from-orange-200 to-amber-200" />
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
                      className={inputBase}
                    />
                  ) : (
                    <h4 className="text-sm font-semibold text-gray-800">
                      {project.title}
                    </h4>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
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
                      className={textAreaBase}
                    />
                  ) : (
                    <p className="text-xs text-gray-500">
                      {project.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      <input
                        value={draft.projects[index]?.tags.join(", ") ?? ""}
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
                        className={inputBase}
                      />
                    ) : (
                      project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs rounded-full bg-orange-50 text-orange-500"
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
