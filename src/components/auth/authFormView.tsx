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
  languageValues,
} from "@/components/auth/organizationOptions";
import { cn } from "@/lib/utils";

export type AuthFormViewProps = {
  mode: AuthMode;
  locale: Locale;
  messages: Messages["auth"];
  form: UseFormReturn<AuthFormValues>;
  onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
  step: number;
  stepCount: number;
  goNext: () => void;
  goBack: () => void;
};

export function AuthFormView({
  mode,
  locale,
  messages,
  form,
  onSubmit,
  step,
  stepCount,
  goNext,
  goBack,
}: AuthFormViewProps) {
  const isSignup = mode === "signup";
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
  const languageOptions = languageValues.map((value) => ({
    value,
    label: messages.languages[value],
  }));

  // Signup is a two-step wizard: account details, then organization.
  const signupStep = step === 0 ? messages.signup.steps.account : messages.signup.steps.organization;
  const copy = isSignup
    ? { ...messages.signup, ...signupStep }
    : messages.signin;
  const isFirstStep = step === 0;

  const passwordField = (
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
  );

  return (
    <div className="relative w-full max-w-[420px] rounded-[16px] border border-border bg-card px-[34px] py-9 shadow-(--shadow-card)">
      <p className="mb-3.5 font-mono text-[11px] font-medium tracking-[0.14em] uppercase text-pulse-ink">
        {isSignup
          ? messages.signup.stepIndicator
              .replace("{current}", String(step + 1))
              .replace("{total}", String(stepCount))
          : copy.kicker}
      </p>
      <h1 className="mb-1.5 font-heading text-3xl leading-[1.05] font-semibold tracking-tight text-foreground">
        {copy.title}
      </h1>
      <p className="mb-6 text-sm leading-normal text-muted-foreground">
        {copy.subtitle}
      </p>

      <AppForm form={form} onSubmit={onSubmit}>
        {!isSignup && (
          <>
            <FormInput<AuthFormValues>
              name="email"
              label={fields.email}
              type="email"
              autoComplete="email"
              placeholder={fields.emailPlaceholder}
            />
            {passwordField}
          </>
        )}

        {isSignup && isFirstStep && (
          <>
            <FormInput<AuthFormValues>
              name="email"
              label={fields.email}
              type="email"
              autoComplete="email"
              placeholder={fields.emailPlaceholder}
            />
            <FormInput<AuthFormValues>
              name="fullName"
              label={fields.fullName}
              autoComplete="name"
              placeholder={fields.fullNamePlaceholder}
            />
            {passwordField}
          </>
        )}

        {isSignup && !isFirstStep && (
          <>
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
            <FormSelect<AuthFormValues>
              name="language"
              label={fields.language}
              placeholder={fields.languagePlaceholder}
              options={languageOptions}
              wrapperClassName="mb-6 space-y-1.5"
            />
          </>
        )}

        {rootError && (
          <p
            role="alert"
            className="mb-4 rounded-sm border border-ember/40 bg-ember/10 px-3 py-2 text-xs text-ember"
          >
            {rootError}
          </p>
        )}

        {isSignup && isFirstStep ? (
          <Button
            type="button"
            onClick={goNext}
            className="h-[46px] w-full text-[15px] font-semibold"
          >
            {messages.signup.next}
          </Button>
        ) : isSignup ? (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              className="h-[46px] flex-1 text-[15px] font-semibold border-input bg-transparent dark:bg-transparent"
            >
              {messages.signup.back}
            </Button>
            <SubmitButton className="flex-1">{copy.cta}</SubmitButton>
          </div>
        ) : (
          <SubmitButton>{copy.cta}</SubmitButton>
        )}
      </AppForm>

      {(!isSignup || isFirstStep) && (
        <>
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
        </>
      )}

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        {isSignup ? messages.signup.switchText : messages.signin.switchText}{" "}
        <Link
          href={`/${locale}/${isSignup ? "signin" : "signup"}`}
          className="font-semibold text-pulse-ink hover:underline"
        >
          {isSignup ? messages.signup.switchCta : messages.signin.switchCta}
        </Link>
      </p>
    </div>
  );
}
