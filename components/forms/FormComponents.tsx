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
  <div className="form-field">
    <label className="form-label">
      {label} {required && <span className="form-required">*</span>}
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
    <div className="tag-container">
      {items.map((item, index) => (
        <div key={index} className="tag-item">
          {item}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="tag-remove"
          >
            ×
          </button>
        </div>
      ))}
    </div>
    <div className="tag-input-row">
      <Input
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        placeholder={placeholder}
      />
      <button type="button" onClick={onAdd} className="btn-primary">
        เพิ่ม
      </button>
    </div>
  </>
);
