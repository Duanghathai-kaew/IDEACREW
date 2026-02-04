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
  const headerClass = children
    ? "section-header-with-button"
    : "section-header";

  return (
    <div className={headerClass}>
      <div className="section-header">
        <div className={isAlt ? "section-icon-alt" : "section-icon"}>
          {icon}
        </div>
        <h2 className="form-section-title" style={{ margin: 0 }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
};
