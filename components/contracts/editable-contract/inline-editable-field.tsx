"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InlineEditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  type?: "text" | "number";
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

export function InlineEditableField({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  type = "text",
  min,
  max,
  step,
}: InlineEditableFieldProps) {
  return (
    <Input
      className={cn(
        "inline-block h-auto border-b bg-transparent p-0 text-center focus-visible:ring-0 transition-colors",
        value
          ? "border-solid border-foreground"
          : "border-dashed border-muted text-muted-foreground",
        className
      )}
      type={type}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
    />
  );
}

