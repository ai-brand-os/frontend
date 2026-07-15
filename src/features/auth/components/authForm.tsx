"use client";

import type { Messages } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { useAuthForm } from "../hooks/useAuthForm";
import type { AuthMode } from "../schemas/authForm.schema";
import { AuthFormView } from "./authFormView";

type AuthFormProps = {
  mode: AuthMode;
  locale: Locale;
  messages: Messages["auth"];
};

export function AuthForm({ mode, locale, messages }: AuthFormProps) {
  const { form, onSubmit, step, stepCount, goNext, goBack } = useAuthForm({
    mode,
    locale,
    messages,
  });

  return (
    <AuthFormView
      mode={mode}
      locale={locale}
      messages={messages}
      form={form}
      onSubmit={onSubmit}
      step={step}
      stepCount={stepCount}
      goNext={goNext}
      goBack={goBack}
    />
  );
}
