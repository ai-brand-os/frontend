"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import type { Messages } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { useLogin, useSignup } from "../api";
import {
  accountFields,
  buildAuthSchema,
  signupStepCount,
  type AuthFormValues,
  type AuthMode,
} from "../schemas/authForm.schema";
import { resolveAuthErrorMessage } from "../utils/authErrorDictionary";

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
  const loginMutation = useLogin();
  const signupMutation = useSignup();

  const schema = useMemo(
    () => buildAuthSchema(isSignup, errorMessages),
    [isSignup, errorMessages],
  );

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
        await signupMutation.mutateAsync({
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
        await loginMutation.mutateAsync({
          email: values.email,
          password: values.password,
        });
      }
      router.push(`/${locale}`);
    } catch (error) {
      form.setError("root", {
        message: resolveAuthErrorMessage(error, errorMessages),
      });
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
