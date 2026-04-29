import * as React from "react";

import { cn } from "@/lib/utils";

type SelectProps = React.ComponentProps<"select">;

function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
