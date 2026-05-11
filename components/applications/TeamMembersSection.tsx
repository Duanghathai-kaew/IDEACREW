"use client";

import { getProjectTeamMembers } from "@/app/actions/project-applications";
import { Badge } from "@/components/ui/badge";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TeamMember = {
  userId: string;
  displayName: string;
  avatarUrl: string;
  positionTitle: string;
  acceptedAt: string;
};

interface Props {
  projectId: string;
}

function formatDate(dateString: string): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

export function TeamMembersSection({ projectId }: Props) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getProjectTeamMembers(projectId);
      if (result.ok) {
        setMembers(result.data);
      }
      setIsLoading(false);
    }
    load();
  }, [projectId]);

  // Group members by position
  const groupedByPosition = useMemo(() => {
    const groups = new Map<string, TeamMember[]>();
    members.forEach((member) => {
      if (!groups.has(member.positionTitle)) {
        groups.set(member.positionTitle, []);
      }
      groups.get(member.positionTitle)!.push(member);
    });
    return groups;
  }, [members]);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded bg-slate-200" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (members.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-slate-800">
        ทีมโปรเจกต์
      </h2>

      <div className="space-y-6">
        {Array.from(groupedByPosition.entries()).map(
          ([positionTitle, positionMembers]) => (
            <div key={positionTitle}>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                {positionTitle}
              </h3>
              <div className="space-y-2">
                {positionMembers.map((member) => (
                  <Link
                    key={member.userId}
                    href={`/user/${member.userId}`}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100 hover:border-slate-300"
                  >
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.displayName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100">
                        <UserRound className="h-5 w-5 text-orange-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        {member.displayName}
                      </p>
                      <p className="text-xs text-slate-500">
                        ยอมรับเมื่อ {formatDate(member.acceptedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
