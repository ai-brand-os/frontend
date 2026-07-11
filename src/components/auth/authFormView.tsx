import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";

import {
  AppForm,
  FormInput,
  FormSelect,
  PasswordInput,
  SubmitButton,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { Messages } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { AuthFormValues, AuthMode } from "@/components/auth/useAuthForm";
import {
  companySizeValues,
  industryValues,
} from "@/components/auth/organizationOptions";
import { cn } from "@/lib/utils";

export type AuthFormViewProps = {
  mode: AuthMode;
  locale: Locale;
  messages: Messages["auth"];
  form: UseFormReturn<AuthFormValues>;
  onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
};

export function AuthFormView({
  mode,
  locale,
  messages,
  form,
  onSubmit,
}: AuthFormViewProps) {
  const isSignup = mode === "signup";
  const copy = isSignup ? messages.signup : messages.signin;
  const { fields } = messages;
  const rootError = form.formState.errors.root?.message;

  const industryOptions = industryValues.map((value) => ({
    value,
    label: messages.industries[value],
  }));
  const companySizeOptions = companySizeValues.map((value) => ({
    value,
    label: messages.companySizes[value],
  }));

  return (
    <div className="relative w-full max-w-[420px] rounded-[16px] border border-border bg-card px-[34px] py-9 shadow-(--shadow-card)">
      <p className="mb-3.5 font-mono text-[11px] font-medium tracking-[0.14em] uppercase text-pulse-ink">
        {copy.kicker}
      </p>
      <h1 className="mb-1.5 font-heading text-3xl leading-[1.05] font-semibold tracking-tight text-foreground">
        {copy.title}
      </h1>
      <p className="mb-6 text-sm leading-normal text-muted-foreground">
        {copy.subtitle}
      </p>

      <AppForm form={form} onSubmit={onSubmit}>
        <FormInput<AuthFormValues>
          name="email"
          label={fields.email}
          type="email"
          autoComplete="email"
          placeholder={fields.emailPlaceholder}
        />

        {isSignup && (
          <>
            <FormInput<AuthFormValues>
              name="fullName"
              label={fields.fullName}
              autoComplete="name"
              placeholder={fields.fullNamePlaceholder}
            />
            <FormInput<AuthFormValues>
              name="company"
              label={fields.company}
              autoComplete="organization"
              placeholder={fields.companyPlaceholder}
            />
            <FormSelect<AuthFormValues>
              name="industry"
              label={fields.industry}
              placeholder={fields.industryPlaceholder}
              options={industryOptions}
            />
            <FormSelect<AuthFormValues>
              name="companySize"
              label={fields.companySize}
              placeholder={fields.companySizePlaceholder}
              options={companySizeOptions}
            />
            <FormInput<AuthFormValues>
              name="region"
              label={fields.region}
              autoComplete="country-name"
              placeholder={fields.regionPlaceholder}
            />
            <FormInput<AuthFormValues>
              name="language"
              label={fields.language}
              autoComplete="language"
              placeholder={fields.languagePlaceholder}
            />
          </>
        )}

        <PasswordInput<AuthFormValues>
          name="password"
          label={fields.password}
          autoComplete={isSignup ? "new-password" : "current-password"}
          placeholder={fields.passwordPlaceholder}
          wrapperClassName="mb-6 space-y-1.5"
          labelAddon={
            !isSignup && (
              <Link
                href={`/${locale}/signin`}
                className="text-xs font-medium text-pulse-ink hover:underline"
              >
                {messages.signin.forgot}
              </Link>
            )
          }
        />

        {rootError && (
          <p
            role="alert"
            className="mb-4 rounded-sm border border-ember/40 bg-ember/10 px-3 py-2 text-xs text-ember"
          >
            {rootError}
          </p>
        )}

        <SubmitButton>{copy.cta}</SubmitButton>
      </AppForm>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-xs text-muted-foreground">
          {messages.or}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        variant="outline"
        className={cn(
          "h-[46px] w-full gap-2.5 text-sm font-semibold",
          "border-input bg-transparent dark:bg-transparent",
        )}
      >
        <span
          aria-hidden
          className="inline-block size-4 rounded-sm bg-foreground opacity-85"
        />
        {messages.sso}
      </Button>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        {copy.switchText}{" "}
        <Link
          href={`/${locale}/${isSignup ? "signin" : "signup"}`}
          className="font-semibold text-pulse-ink hover:underline"
        >
          {copy.switchCta}
        </Link>
      </p>
    </div>
  );
}
