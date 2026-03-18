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
  newItem: string;
  setNewItem: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  items,
  newItem,
  setNewItem,
  onAdd,
  onRemove,
  placeholder,
}) => (
  <>
    <div className="mb-2 flex flex-wrap gap-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#fff1ee] px-3 py-2 text-xs font-medium text-(--brand-500)"
        >
          {item}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex h-4 w-4 items-center justify-center rounded-full text-xs text-slate-500 transition hover:bg-red-100 hover:text-red-600"
          >
            ×
          </button>
        </div>
      ))}
    </div>
    <div className="flex flex-wrap items-end gap-3 max-md:flex-col max-md:items-stretch">
      <Input
        className="min-w-50 flex-1"
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onAdd();
          }
        }}
      />
      <button
        type="button"
        onClick={onAdd}
        className="h-fit whitespace-nowrap rounded-lg bg-(--form-primary) px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-px hover:bg-(--brand-400) hover:shadow-[0_4px_12px_rgb(253_94_75/0.3)]"
      >
        เพิ่ม
      </button>
    </div>
  </>
);
