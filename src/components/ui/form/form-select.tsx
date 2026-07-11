"use client";

import * as React from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type FormSelectOption = {
  value: string;
  label: string;
};

export type FormSelectProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  label: string;
  options: FormSelectOption[];
  /** Disabled first option shown when no value is selected yet. */
  placeholder?: string;
  required?: boolean;
  className?: string;
  wrapperClassName?: string;
};

/**
 * Native `<select>` wired to react-hook-form, styled to match `FormInput`.
 * Native keeps it accessible and dependency-free; the values are the backend
 * enum members and the labels are localized copy.
 */
export function FormSelect<TFieldValues extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  required,
  className,
  wrapperClassName,
}: FormSelectProps<TFieldValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const error = errors[name];
  const message =
    typeof error?.message === "string" ? error.message : undefined;

  return (
    <div className={cn("mb-4 space-y-1.5", wrapperClassName)}>
      <Label htmlFor={name} className="text-[13px]">
        {label}
        {required && <span className="text-ember"> *</span>}
      </Label>
      <select
        id={name}
        aria-invalid={!!error}
        defaultValue=""
        className={cn(
          "h-11 w-full rounded-sm border border-input bg-field px-3.5 text-sm outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          "dark:bg-field",
          className,
        )}
        {...register(name)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {message && <p className="mt-1.5 text-xs text-ember">{message}</p>}
    </div>
  );
}
