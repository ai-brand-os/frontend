"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import type { Messages } from "@/i18n/dictionaries";
import { useCreateOrganization, useUpdateOrganization } from "../api";
import type { Organization } from "../api";
import {
  buildOrganizationSchema,
  type OrganizationFormMode,
  type OrganizationFormValues,
} from "../schemas/organizationForm.schema";
import { resolveOrganizationErrorMessage } from "../utils/organizationErrorDictionary";

type UseOrganizationFormArgs = {
  mode: OrganizationFormMode;
  /** The org being edited; omitted when creating. */
  organization?: Organization;
  messages: Messages["organization"];
  onSuccess: () => void;
};

function toDefaultValues(
  organization: Organization | undefined,
): OrganizationFormValues {
  return {
    name: organization?.name ?? "",
    industry: organization?.industry ?? "",
    companySize: organization?.companySize ?? "",
    websiteUrl: organization?.websiteUrl ?? "",
    primaryRegion: organization?.primaryRegion ?? "",
    primaryLanguage: organization?.primaryLanguage ?? "",
  };
}

/**
 * Owns the add/edit organization form: validation, the create/update mutation
 * for the current mode, and mapping a failed request to a localized root
 * error. `onSuccess` runs once the server has accepted the change.
 */
export function useOrganizationForm({
  mode,
  organization,
  messages,
  onSuccess,
}: UseOrganizationFormArgs) {
  const isCreate = mode === "create";
  const { errors: errorMessages } = messages;
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization(organization?.id ?? "");

  const schema = useMemo(
    () => buildOrganizationSchema(mode, messages.form.errors),
    [mode, messages.form.errors],
  );

  const form = useForm<OrganizationFormValues>({
    resolver: yupResolver(schema),
    defaultValues: toDefaultValues(organization),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isCreate) {
        await createMutation.mutateAsync({
          name: values.name!,
          industry: values.industry,
          companySize: values.companySize,
          websiteUrl: values.websiteUrl,
          primaryRegion: values.primaryRegion,
          primaryLanguage: values.primaryLanguage,
        });
      } else {
        await updateMutation.mutateAsync({
          industry: values.industry,
          companySize: values.companySize,
          websiteUrl: values.websiteUrl,
          primaryRegion: values.primaryRegion,
          primaryLanguage: values.primaryLanguage,
        });
      }
      onSuccess();
    } catch (error) {
      form.setError("root", {
        message: resolveOrganizationErrorMessage(error, errorMessages),
      });
    }
  });

  return { form, onSubmit };
}
