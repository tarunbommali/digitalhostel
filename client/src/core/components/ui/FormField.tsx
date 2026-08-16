import * as React from "react";
import { Label } from "@/core/components/ui/label";
import { cn } from "@/core/lib/utils";

export interface FormFieldProps {
  id: string;
  label: string;
  error?: string | null;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  id,
  label,
  error,
  helperText,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="font-label text-xs text-[var(--text-primary)]">
          {label} {required && <span className="text-[var(--color-danger)]">*</span>}
        </Label>
      </div>
      {children}
      {error ? (
        <p className="text-[11px] font-medium text-[var(--color-danger)]">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-[var(--text-muted)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default FormField;
