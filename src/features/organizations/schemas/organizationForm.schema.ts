import * as yup from "yup";

import type { Messages } from "@/i18n/dictionaries";
import {
  companySizeValues,
  industryValues,
  languageValues,
} from "../utils/organizationOptions";

/** `create` posts a new org; `edit` patches an existing one. */
export type OrganizationFormMode = "create" | "edit";

export type OrganizationFormValues = {
  name?: string;
  industry: string;
  companySize: string;
  websiteUrl?: string;
  primaryRegion: string;
  primaryLanguage: string;
};

/**
 * Builds the organization form's Yup schema, mirroring the backend DTOs: the
 * name is required when creating and absent when editing (the backend's
 * `UpdateOrganizationDto` has no `name`), and the enum fields are constrained
 * to the backend-mirrored option values.
 */
export function buildOrganizationSchema(
  mode: OrganizationFormMode,
  errorMessages: Messages["organization"]["form"]["errors"],
): yup.ObjectSchema<OrganizationFormValues> {
  return yup.object({
    name:
      mode === "create"
        ? yup.string().required(errorMessages.nameRequired)
        : yup.string().optional(),
    industry: yup
      .string()
      .required(errorMessages.industryRequired)
      .oneOf(industryValues, errorMessages.industryRequired),
    companySize: yup
      .string()
      .required(errorMessages.companySizeRequired)
      .oneOf(companySizeValues, errorMessages.companySizeRequired),
    websiteUrl: yup
      .string()
      .transform((value: string) => (value === "" ? undefined : value))
      .url(errorMessages.websiteUrlInvalid)
      .optional(),
    primaryRegion: yup.string().required(errorMessages.primaryRegionRequired),
    primaryLanguage: yup
      .string()
      .required(errorMessages.primaryLanguageRequired)
      .oneOf(languageValues, errorMessages.primaryLanguageRequired),
  });
}
