import { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description ? (
          <p className="text-base text-slate-600">{description}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex w-full gap-3 md:w-auto">{actions}</div>
      ) : null}
    </div>
  );
}
