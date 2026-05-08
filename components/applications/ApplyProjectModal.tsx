"use client";

import { Plus, Send, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import {
  getApplyProfilePrefill,
  submitProjectApplication,
} from "@/app/actions/project-applications";
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
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

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

    return message;
  }

  useEffect(() => {
    if (!open || !userId) return;

    let mounted = true;
    getApplyProfilePrefill(userId).then((result) => {
      if (!mounted || !result.ok) return;
      setSkills(result.data.skills);
      setPortfolioUrls(result.data.portfolioUrls);
      setAdditionalNote(result.data.bio);
    });

    return () => {
      mounted = false;
    };
  }, [open, userId]);

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
    setError("");
    startTransition(async () => {
      const result = await submitProjectApplication({
        projectId,
        userId,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>สมัครเข้าร่วมโปรเจกต์</DialogTitle>
          <DialogDescription>
            ระบบดึงข้อมูลจากโปรไฟล์ของคุณมาให้แล้ว
            คุณสามารถแก้ไขก่อนส่งใบสมัครได้
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Motivation message
            </span>
            <Textarea
              value={motivationMessage}
              onChange={(event) => setMotivationMessage(event.target.value)}
              placeholder="เล่าว่าทำไมคุณอยากเข้าร่วมโปรเจกต์นี้"
              className="min-h-32"
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Skills</span>
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
                placeholder="เพิ่มทักษะ"
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() =>
                      setSkills((current) =>
                        current.filter((item) => item !== skill),
                      )
                    }
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Portfolio URL
            </span>
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
                placeholder="https://..."
              />
              <Button type="button" variant="outline" onClick={addPortfolioUrl}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {portfolioUrls.map((url) => (
                <div
                  key={url}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <span className="truncate">{url}</span>
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
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Additional note
            </span>
            <Textarea
              value={additionalNote}
              onChange={(event) => setAdditionalNote(event.target.value)}
              placeholder="ข้อมูลเพิ่มเติม"
            />
          </label>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !motivationMessage.trim()}
            className="bg-gradient-to-r from-brand-500 via-brand-400 to-brand-300 text-white"
          >
            <Send className="h-4 w-4" />
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
