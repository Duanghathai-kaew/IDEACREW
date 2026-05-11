"use client";

import { getProjectRecruitmentProgress } from "@/app/actions/project-applications";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

type RecruitmentPosition = {
  id: string;
  title: string;
  neededCount: number;
  acceptedCount: number;
  requiredSkills: string[];
  isFull: boolean;
};

interface Props {
  projectId: string;
}

export function RecruitmentProgressSection({ projectId }: Props) {
  const [positions, setPositions] = useState<RecruitmentPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getProjectRecruitmentProgress(projectId);
      if (result.ok) {
        setPositions(result.data);
      }
      setIsLoading(false);
    }
    load();
  }, [projectId]);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-32 rounded bg-slate-200" />
                <div className="h-2 w-full rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (positions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-slate-800">
        ความคืบหน้าการรับสมาชิก
      </h2>

      <div className="space-y-6">
        {positions.map((position) => {
          const fillPercentage =
            position.neededCount > 0
              ? (position.acceptedCount / position.neededCount) * 100
              : 0;
          const isNearlyFull = fillPercentage >= 70 && !position.isFull;

          return (
            <div key={position.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">
                  {position.title}
                </h3>
                <Badge
                  className={
                    position.isFull
                      ? "border-red-200 bg-red-50 text-red-700"
                      : isNearlyFull
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }
                >
                  {position.isFull
                    ? "เต็มแล้ว"
                    : isNearlyFull
                      ? "ใกล้เต็ม"
                      : "เปิด"}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  ยอมรับแล้ว {position.acceptedCount} / {position.neededCount}{" "}
                  คน
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${
                    position.isFull
                      ? "bg-red-500"
                      : isNearlyFull
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                />
              </div>

              {/* Required skills */}
              {position.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {position.requiredSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="border border-slate-200 bg-slate-50 text-[11px] text-slate-600"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
