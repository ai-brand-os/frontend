"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  companySizeValues,
  industryValues,
  languageValues,
} from "@/components/auth/organizationOptions";
import { ApiError, login, signup } from "@/lib/api";
import type { Messages } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export type AuthMode = "signin" | "signup";

/** Fields collected on the first signup wizard step (user account). */
export const accountFields = ["email", "fullName", "password"] as const;
/** Fields collected on the second signup wizard step (organization). */
export const organizationFields = [
  "company",
  "industry",
  "companySize",
  "region",
  "language",
] as const;

export const signupStepCount = 2;

export type AuthFormValues = {
  email: string;
  password: string;
  fullName?: string;
  company?: string;
  industry?: string;
  companySize?: string;
  region?: string;
  language?: string;
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
  const [step, setStep] = useState(0);

  const schema = useMemo<yup.ObjectSchema<AuthFormValues>>(() => {
    const optionalString = yup.string().optional();
    return yup.object({
      email: yup
        .string()
        .required(errorMessages.emailRequired)
        .email(errorMessages.emailInvalid),
      password: yup
        .string()
        .required(errorMessages.passwordRequired)
        .min(8, errorMessages.passwordMin),
      fullName: isSignup
        ? yup.string().required(errorMessages.fullNameRequired)
        : optionalString,
      company: isSignup
        ? yup.string().required(errorMessages.companyRequired)
        : optionalString,
      industry: isSignup
        ? yup
            .string()
            .required(errorMessages.industryRequired)
            .oneOf(industryValues, errorMessages.industryRequired)
        : optionalString,
      companySize: isSignup
        ? yup
            .string()
            .required(errorMessages.companySizeRequired)
            .oneOf(companySizeValues, errorMessages.companySizeRequired)
        : optionalString,
      region: isSignup
        ? yup.string().required(errorMessages.regionRequired)
        : optionalString,
      language: isSignup
        ? yup
            .string()
            .required(errorMessages.languageRequired)
            .oneOf(languageValues, errorMessages.languageRequired)
        : optionalString,
    });
  }, [isSignup, errorMessages]);

  const form = useForm<AuthFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      company: "",
      industry: "",
      companySize: "",
      region: "",
      language: "",
    },
  });

  const goNext = useCallback(async () => {
    const valid = await form.trigger([...accountFields]);
    if (valid) setStep(1);
  }, [form]);

  const goBack = useCallback(() => setStep(0), []);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isSignup) {
        await signup({
          email: values.email,
          password: values.password,
          fullName: values.fullName!,
          organization: {
            name: values.company!,
            industry: values.industry!,
            companySize: values.companySize!,
            primaryRegion: values.region!,
            primaryLanguage: values.language!,
          },
        });
      } else {
        await login({ email: values.email, password: values.password });
      }
      router.push(`/${locale}`);
    } catch (error) {
      form.setError("root", { message: resolveErrorMessage(error, errorMessages) });
    }
  });

  return {
    form,
    onSubmit,
    step,
    stepCount: signupStepCount,
    goNext,
    goBack,
  };
}

/** Maps a backend error `code` to localized copy, falling back to generic. */
function resolveErrorMessage(
  error: unknown,
  errorMessages: Messages["auth"]["errors"],
): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "INVALID_CREDENTIALS":
        return errorMessages.invalidCredentials;
      case "EMAIL_ALREADY_REGISTERED":
        return errorMessages.emailTaken;
      case "RATE_LIMITED":
        return errorMessages.rateLimited;
    }
  }
  return errorMessages.unexpected;
}
