"use client";

import { AuthFormView } from "@/components/auth/authFormView";
import { useAuthForm, type AuthMode } from "@/components/auth/useAuthForm";
import type { Messages } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type AuthFormProps = {
  mode: AuthMode;
  locale: Locale;
  messages: Messages["auth"];
};

export function AuthForm({ mode, locale, messages }: AuthFormProps) {
  const { form, onSubmit } = useAuthForm({ mode, locale, messages });

  return (
    <AuthFormView
      mode={mode}
      locale={locale}
      messages={messages}
      form={form}
      onSubmit={onSubmit}
    />
  );
}
