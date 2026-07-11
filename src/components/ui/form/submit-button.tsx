"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubmitButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton({ className, ...props }: SubmitButtonProps) {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={cn("h-[46px] w-full text-[15px] font-semibold", className)}
      {...props}
    />
  );
}
