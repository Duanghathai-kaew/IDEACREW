"use client";

import { Check, Plus, Send, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  getApplyProfilePrefill,
  getProjectPositions,
  ProjectPositionOption,
  submitProjectApplication,
} from "@/features/applications/actions/project-applications.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  projectId: string;
  userId: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ApplyProjectModal({
  open,
  projectId,
  userId,
  onOpenChange,
  onSuccess,
}: Props) {
  const [motivationMessage, setMotivationMessage] = useState("");
  const [additionalNote, setAdditionalNote] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [portfolioDraft, setPortfolioDraft] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(
    null,
  );
  const [positions, setPositions] = useState<ProjectPositionOption[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const availablePositions = useMemo(
    () => positions.filter((p) => !p.isFull),
    [positions],
  );

  function formatSubmitError(message: string) {
    if (message.includes("already applied")) {
      return "คุณได้ส่งใบสมัครโปรเจกต์นี้แล้ว";
    }

    if (message.includes("not open for applications")) {
      return "โปรเจกต์นี้ปิดรับสมัครแล้ว";
    }

    if (message.includes("cannot apply to their own project")) {
      return "คุณเป็นเจ้าของโปรเจกต์นี้";
    }

    if (message.includes("already filled")) {
      return "ตำแหน่งนี้เต็มแล้ว";
    }

    if (message.includes("Position not found")) {
      return "ตำแหน่งที่เลือกไม่พบ";
    }

    return message;
  }

  useEffect(() => {
    if (!open || !userId) return;

    let mounted = true;
    async function bootstrap() {
      setError("");
      setSelectedPositionId(null);
      setLoadingPositions(true);
      setPositions([]);

      const [prefillResult, positionsResult] = await Promise.all([
        getApplyProfilePrefill(userId),
        getProjectPositions(projectId),
      ]);
      if (!mounted) return;

      if (prefillResult.ok) {
        setSkills(prefillResult.data.skills);
        setPortfolioUrls(prefillResult.data.portfolioUrls);
        setAdditionalNote(prefillResult.data.bio);
      }

      setLoadingPositions(false);
      if (positionsResult.ok) {
        setPositions(positionsResult.data);
        const firstAvailable = positionsResult.data.find((p) => !p.isFull);
        if (firstAvailable) {
          setSelectedPositionId(firstAvailable.id);
        }
      } else {
        setPositions([]);
        setError("ไม่สามารถโหลดตำแหน่งได้ กรุณาลองใหม่อีกครั้ง");
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [open, userId, projectId]);

  function addSkill() {
    const value = skillDraft.trim();
    if (!value || skills.includes(value)) return;
    setSkills((current) => [...current, value]);
    setSkillDraft("");
  }

  function addPortfolioUrl() {
    const value = portfolioDraft.trim();
    if (!value || portfolioUrls.includes(value)) return;
    setPortfolioUrls((current) => [...current, value]);
    setPortfolioDraft("");
  }

  function handleSubmit() {
    if (!selectedPositionId) {
      setError("Please select a position");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await submitProjectApplication({
        projectId,
        userId,
        positionId: selectedPositionId,
        motivationMessage,
        skills,
        portfolioUrls,
        additionalNote,
      });

      if (!result.ok) {
        setError(formatSubmitError(result.error));
        return;
      }

      onOpenChange(false);
      onSuccess();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-[96vw] max-w-4xl overflow-y-auto rounded-3xl p-8">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl">สมัครเข้าร่วมโปรเจกต์</DialogTitle>
          <DialogDescription className="text-base">
            เลือกตำแหน่งที่ต้องการและระบุข้อมูลของคุณ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* POSITION SELECTION */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                เลือกตำแหน่งที่สมัคร
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                เลือกตำแหน่งที่คุณต้องการสมัคร (จำเป็น)
              </p>
            </div>

            {loadingPositions ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-slate-200" />
                      <div className="h-3 w-16 rounded bg-slate-200" />
                      <div className="mt-3 flex gap-1">
                        <div className="h-6 w-16 rounded-full bg-slate-200" />
                        <div className="h-6 w-16 rounded-full bg-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : availablePositions.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-center">
                <p className="text-sm font-semibold text-amber-700">
                  โปรเจกต์นี้ปิดรับสมัครแล้ว
                </p>
                <p className="mt-1 text-xs text-amber-600">
                  ทำเนียบตำแหน่งทั้งหมดเต็มแล้ว กรุณารอโปรเจกต์ถัดไป
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                {availablePositions.map((position) => {
                  console.log(
                    "rendering position:",
                    position.id,
                    position.title,
                    "isFull:",
                    position.isFull,
                  );
                  return (
                    <button
                      key={position.id}
                      onClick={() =>
                        !position.isFull && setSelectedPositionId(position.id)
                      }
                      disabled={position.isFull}
                      className={`rounded-2xl border-2 p-4 text-left transition-all ${
                        selectedPositionId === position.id
                          ? "border-orange-400 bg-orange-50"
                          : position.isFull
                            ? "border-slate-200 bg-slate-50 opacity-60"
                            : "border-slate-200 bg-white hover:border-orange-200"
                      } ${position.isFull ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">
                            {position.title}
                          </h4>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm text-slate-600">
                              {position.acceptedCount} / {position.neededCount}
                            </span>
                          </div>
                          {position.requiredSkills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {position.requiredSkills.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="secondary"
                                  className="rounded-full border-orange-100 bg-orange-50 px-2 py-0.5 text-[10px] text-orange-700"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {position.isFull && (
                          <Badge className="border-rose-200 bg-rose-50 text-rose-700">
                            เต็มแล้ว
                          </Badge>
                        )}
                        {selectedPositionId === position.id && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* MOTIVATION MESSAGE */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                ทำไมคุณอยากเข้าร่วม?
              </span>
              <p className="mt-1 text-xs text-slate-500">
                เล่าเหตุผล ความสนใจ และสิ่งที่คุณอยากมีส่วนร่วม
              </p>
            </label>
            <Textarea
              value={motivationMessage}
              onChange={(event) => setMotivationMessage(event.target.value)}
              placeholder="เช่น: ฉันรักการออกแบบ UI และต้องการสร้างประสบการณ์ที่ดี..."
              className="min-h-32 rounded-xl"
            />
          </div>

          {/* SKILLS */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                ทักษะของคุณ
              </span>
              <p className="mt-1 text-xs text-slate-500">
                เพิ่มทักษะที่เกี่ยวข้อง
              </p>
            </label>
            <div className="flex gap-2">
              <Input
                value={skillDraft}
                onChange={(event) => setSkillDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="เช่น: React, TypeScript, Figma..."
                className="rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSkill}
                className="rounded-xl"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="rounded-full border-orange-200 bg-orange-100 px-3 py-1 text-sm text-orange-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() =>
                        setSkills((current) =>
                          current.filter((item) => item !== skill),
                        )
                      }
                      className="ml-1"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* PORTFOLIO URLS */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Portfolio / Links
              </span>
              <p className="mt-1 text-xs text-slate-500">
                เพิ่มลิงค์ไปยังผลงาน GitHub profile หรือ portfolio ของคุณ
              </p>
            </label>
            <div className="flex gap-2">
              <Input
                value={portfolioDraft}
                onChange={(event) => setPortfolioDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addPortfolioUrl();
                  }
                }}
                placeholder="https://github.com/... หรือ https://portfolio.com/..."
                className="rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addPortfolioUrl}
                className="rounded-xl"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {portfolioUrls.length > 0 && (
              <div className="space-y-2">
                {portfolioUrls.map((url) => (
                  <div
                    key={url}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    <span className="truncate text-sm">{url}</span>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-rose-500"
                      onClick={() =>
                        setPortfolioUrls((current) =>
                          current.filter((item) => item !== url),
                        )
                      }
                      aria-label={`Remove ${url}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ADDITIONAL NOTE */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                ข้อมูลเพิ่มเติม (Bio)
              </span>
              <p className="mt-1 text-xs text-slate-500">
                บอกเล่าเกี่ยวกับตัวคุณให้เพิ่มเติม
              </p>
            </label>
            <Textarea
              value={additionalNote}
              onChange={(event) => setAdditionalNote(event.target.value)}
              placeholder="ตัวอย่าง: ฉันศึกษา Software Engineering ที่ Chulalongkorn University..."
              className="min-h-24 rounded-xl"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isPending ||
              loadingPositions ||
              availablePositions.length === 0 ||
              !motivationMessage.trim() ||
              !selectedPositionId
            }
            className="rounded-xl bg-linear-to-r from-brand-500 via-brand-400 to-brand-300 text-white"
          >
            <Send className="h-4 w-4" />
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
