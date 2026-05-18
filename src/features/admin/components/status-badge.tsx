import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AdminStatus = "pending" | "approved" | "rejected";

const STATUS_LABEL: Record<AdminStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_CLASS: Record<AdminStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

type StatusBadgeProps = {
  status: AdminStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-semibold",
        STATUS_CLASS[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}
