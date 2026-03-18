import { Input } from "@/components/ui/input";
import React from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  children,
}) => (
  <div className="mb-4">
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    {children}
  </div>
);

interface TagInputProps {
  items: string[];
  onChangeItems: (items: string[]) => void;
  placeholder: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  items,
  onChangeItems,
  placeholder,
}) => {
  const fields = items.length > 0 ? items : [""];

  const updateField = (index: number, value: string) => {
    const next = [...fields];
    next[index] = value;
    onChangeItems(next);
  };

  const removeField = (index: number) => {
    if (fields.length === 1) {
      onChangeItems([""]);
      return;
    }
    onChangeItems(fields.filter((_, i) => i !== index));
  };

  const addField = () => {
    onChangeItems([...fields, ""]);
  };

  return (
    <>
      <div className="space-y-2 mb-2">
        {fields.map((fieldValue, fieldIndex) => (
          <div
            key={fieldIndex}
            className="flex flex-wrap items-end gap-2 max-md:flex-col max-md:items-stretch"
          >
            <Input
              className="min-w-50 flex-1"
              value={fieldValue}
              onChange={(e) => updateField(fieldIndex, e.target.value)}
              placeholder={placeholder}
            />
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => removeField(fieldIndex)}
                className="h-fit whitespace-nowrap rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                ลบฟิล
              </button>
            )}
            {fieldIndex === fields.length - 1 && (
              <button
                type="button"
                onClick={addField}
                className="ml-auto h-fit whitespace-nowrap rounded-lg bg-[var(--form-primary)] px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-px hover:bg-[var(--brand-400)] hover:shadow-[0_4px_12px_rgb(253_94_75/0.3)] max-md:ml-0"
              >
                เพิ่ม
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

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
            isAlt ? "bg-[var(--brand-400)]" : "bg-[var(--form-primary)]"
          }`}
        >
          {icon}
        </div>
        <h2 className="m-0 text-lg font-semibold text-slate-700">{title}</h2>
      </div>
      {children}
    </div>
  );
};
