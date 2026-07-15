"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { listOrganizations, organizationKeys } from "@/features/organizations";
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
  const queryClient = useQueryClient();
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

  /**
   * The dashboard is org-scoped, so authenticating has to land on a concrete
   * org. Signup returns the org it just created; login doesn't, so the
   * caller's list is read through the query cache — the sidebar switcher then
   * reuses it instead of refetching.
   */
  const resolveOrganizationId = useCallback(
    async (createdOrganizationId?: string) => {
      if (createdOrganizationId) return createdOrganizationId;

      const organizations = await queryClient.fetchQuery({
        queryKey: organizationKeys.lists(),
        queryFn: listOrganizations,
      });
      return organizations[0]?.id;
    },
    [queryClient],
  );

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = isSignup
        ? await signupMutation.mutateAsync({
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
          })
        : await loginMutation.mutateAsync({
            email: values.email,
            password: values.password,
          });

      const organizationId = await resolveOrganizationId(result.organizationId);

      router.push(
        organizationId ? `/${locale}/${organizationId}/dashboard` : `/${locale}`,
      );
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
