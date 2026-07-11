"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Messages } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

type AuthMessages = Messages["auth"];
type AuthMode = "signin" | "signup";

type AuthFormValues = {
  email: string;
  company?: string;
  password: string;
};

type AuthFormProps = {
  mode: AuthMode;
  locale: Locale;
  messages: AuthMessages;
};

const fieldClassName =
  "h-11 px-3.5 bg-field dark:bg-field text-sm placeholder:text-muted-foreground/70";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-ember">{message}</p>;
}

export function AuthForm({ mode, locale, messages }: AuthFormProps) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const copy = isSignup ? messages.signup : messages.signin;
  const { fields, errors: errorMessages } = messages;

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: "", company: "", password: "" },
  });

  const onSubmit = handleSubmit(async () => {
    // No auth API yet — validated submits land on the home page.
    router.push(`/${locale}`);
  });

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

      <form onSubmit={onSubmit} noValidate>
        <div className="mb-4 space-y-1.5">
          <Label htmlFor="email" className="text-[13px]">
            {fields.email}
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={fields.emailPlaceholder}
            aria-invalid={!!errors.email}
            className={fieldClassName}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        {isSignup && (
          <div className="mb-4 space-y-1.5">
            <Label htmlFor="company" className="text-[13px]">
              {fields.company}
            </Label>
            <Input
              id="company"
              autoComplete="organization"
              placeholder={fields.companyPlaceholder}
              aria-invalid={!!errors.company}
              className={fieldClassName}
              {...register("company")}
            />
            <FieldError message={errors.company?.message} />
          </div>
        )}

        <div className="mb-6 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password" className="text-[13px]">
              {fields.password}
            </Label>
            {!isSignup && (
              <Link
                href={`/${locale}/signin`}
                className="text-xs font-medium text-pulse-ink hover:underline"
              >
                {messages.signin.forgot}
              </Link>
            )}
          </div>
          <Input
            id="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder={fields.passwordPlaceholder}
            aria-invalid={!!errors.password}
            className={fieldClassName}
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-[46px] w-full text-[15px] font-semibold"
        >
          {copy.cta}
        </Button>
      </form>

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
          "border-input bg-transparent dark:bg-transparent"
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
