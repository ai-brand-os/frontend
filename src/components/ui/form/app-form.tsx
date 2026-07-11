"use client";

import * as React from "react";
import {
  FormProvider,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

type AppFormProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
  children: React.ReactNode;
  className?: string;
};

export function AppForm<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: AppFormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={onSubmit} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}
