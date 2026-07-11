"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import type { Messages } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export type AuthMode = "signin" | "signup";

export type AuthFormValues = {
  email: string;
  company?: string;
  password: string;
};

type UseAuthFormArgs = {
  mode: AuthMode;
  locale: Locale;
  messages: Messages["auth"];
};

export function useAuthForm({ mode, locale, messages }: UseAuthFormArgs) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const { errors: errorMessages } = messages;

  const schema = useMemo<yup.ObjectSchema<AuthFormValues>>(() => {
    return yup.object({
      email: yup
        .string()
        .required(errorMessages.emailRequired)
        .email(errorMessages.emailInvalid),
      company: isSignup
        ? yup.string().required(errorMessages.companyRequired)
        : yup.string().optional(),
      password: yup
        .string()
        .required(errorMessages.passwordRequired)
        .min(8, errorMessages.passwordMin),
    });
  }, [isSignup, errorMessages]);

  const form = useForm<AuthFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: "", company: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async () => {
    // No auth API yet — validated submits land on the home page.
    router.push(`/${locale}`);
  });

  return { form, onSubmit };
}
