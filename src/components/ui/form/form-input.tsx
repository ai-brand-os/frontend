"use client";

import * as React from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type FormInputProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  className?: string;
  wrapperClassName?: string;
  labelAddon?: React.ReactNode;
};

export function FormInput<TFieldValues extends FieldValues>({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  required,
  className,
  wrapperClassName,
  labelAddon,
}: FormInputProps<TFieldValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const error = errors[name];
  const message =
    typeof error?.message === "string" ? error.message : undefined;

  return (
    <div className={cn("mb-4 space-y-1.5", wrapperClassName)}>
      <div className="flex items-baseline justify-between">
        <Label htmlFor={name} className="text-[13px]">
          {label}
          {required && <span className="text-ember"> *</span>}
        </Label>
        {labelAddon}
      </div>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className={cn(
          "h-11 px-3.5 bg-field dark:bg-field text-sm placeholder:text-muted-foreground/70",
          className
        )}
        {...register(name)}
      />
      {message && <p className="mt-1.5 text-xs text-ember">{message}</p>}
    </div>
  );
}
