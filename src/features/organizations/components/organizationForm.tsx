"use client";

import {
  AppForm,
  FormInput,
  FormSelect,
  SubmitButton,
  type FormSelectOption,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { Messages } from "@/i18n/dictionaries";
import type { Organization } from "../api";
import { useOrganizationForm } from "../hooks/useOrganizationForm";
import type {
  OrganizationFormMode,
  OrganizationFormValues,
} from "../schemas/organizationForm.schema";
import {
  companySizeValues,
  industryValues,
  languageValues,
} from "../utils/organizationOptions";
import type { OrganizationOptionLabels } from "./organizationOptionLabels";

function toOptions(
  values: readonly string[],
  labels: Record<string, string>,
): FormSelectOption[] {
  return values.map((value) => ({ value, label: labels[value] ?? value }));
}

type OrganizationFormProps = {
  mode: OrganizationFormMode;
  /** The org being edited; omitted when creating. */
  organization?: Organization;
  messages: Messages["organization"];
  optionLabels: OrganizationOptionLabels;
  onCancel: () => void;
  onSuccess: () => void;
};

export function OrganizationForm({
  mode,
  organization,
  messages,
  optionLabels,
  onCancel,
  onSuccess,
}: OrganizationFormProps) {
  const { form, onSubmit } = useOrganizationForm({
    mode,
    organization,
    messages,
    onSuccess,
  });

  const isCreate = mode === "create";
  const t = messages.form;
  const rootError = form.formState.errors.root?.message;

  return (
    <section className="mb-6 rounded-xl border border-border bg-card">
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-[15px] font-semibold text-foreground">
          {isCreate ? t.createTitle : t.editTitle}
        </h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {isCreate ? t.createSubtitle : (organization?.name ?? t.editSubtitle)}
        </p>
      </div>

      <AppForm<OrganizationFormValues>
        form={form}
        onSubmit={onSubmit}
        className="border-t border-border px-5 pt-5 pb-5"
      >
        {isCreate && (
          <FormInput<OrganizationFormValues>
            name="name"
            label={t.fields.name}
            placeholder={t.fields.namePlaceholder}
            required
          />
        )}

        <div className="grid gap-x-4 sm:grid-cols-2">
          <FormSelect<OrganizationFormValues>
            name="industry"
            label={t.fields.industry}
            placeholder={t.fields.industryPlaceholder}
            options={toOptions(industryValues, optionLabels.industries)}
            required
          />
          <FormSelect<OrganizationFormValues>
            name="companySize"
            label={t.fields.companySize}
            placeholder={t.fields.companySizePlaceholder}
            options={toOptions(companySizeValues, optionLabels.companySizes)}
            required
          />
          <FormInput<OrganizationFormValues>
            name="primaryRegion"
            label={t.fields.primaryRegion}
            placeholder={t.fields.primaryRegionPlaceholder}
            required
          />
          <FormSelect<OrganizationFormValues>
            name="primaryLanguage"
            label={t.fields.primaryLanguage}
            placeholder={t.fields.primaryLanguagePlaceholder}
            options={toOptions(languageValues, optionLabels.languages)}
            required
          />
          <FormInput<OrganizationFormValues>
            name="websiteUrl"
            label={t.fields.websiteUrl}
            type="url"
            placeholder={t.fields.websiteUrlPlaceholder}
          />
        </div>

        {rootError && (
          <p role="alert" className="mb-4 text-xs text-ember">
            {rootError}
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-4 text-sm font-semibold"
            onClick={onCancel}
          >
            {t.cancel}
          </Button>
          <SubmitButton className="h-10 w-auto px-4 text-sm">
            {isCreate ? t.submitCreate : t.submitEdit}
          </SubmitButton>
        </div>
      </AppForm>
    </section>
  );
}
