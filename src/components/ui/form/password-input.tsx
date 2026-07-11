"use client";

import type { FieldValues } from "react-hook-form";

import { FormInput, type FormInputProps } from "@/components/ui/form/form-input";

export function PasswordInput<TFieldValues extends FieldValues>(
  props: Omit<FormInputProps<TFieldValues>, "type">
) {
  return <FormInput {...props} type="password" />;
}
