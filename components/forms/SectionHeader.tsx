import React from "react";

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  isAlt?: boolean;
  children?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  isAlt = false,
  children,
}) => {
  return (
    <div
      className={`mb-4 flex items-center ${
        children ? "justify-between" : "gap-3"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center rounded-lg p-2 text-white ${
            isAlt ? "bg-(--brand-400)" : "bg-(--form-primary)"
          }`}
        >
          {icon}
        </div>
        <h2 className="m-0 text-lg font-semibold text-slate-700">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
};
