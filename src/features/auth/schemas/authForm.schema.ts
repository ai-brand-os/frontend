import * as yup from "yup";

import type { Messages } from "@/i18n/dictionaries";
import {
  companySizeValues,
  industryValues,
  languageValues,
} from "../utils/organizationOptions";

export type AuthMode = "signin" | "signup";

/** Fields collected on the first signup wizard step (user account). */
export const accountFields = ["email", "fullName", "password"] as const;
/** Fields collected on the second signup wizard step (organization). */
export const organizationFields = [
  "company",
  "industry",
  "companySize",
  "region",
  "language",
] as const;

export const signupStepCount = 2;

export type AuthFormValues = {
  email: string;
  password: string;
  fullName?: string;
  company?: string;
  industry?: string;
  companySize?: string;
  region?: string;
  language?: string;
};

/**
 * Builds the auth form's Yup schema. Sign-in validates only email/password;
 * signup additionally requires the account + organization fields, with the
 * enum fields constrained to the backend-mirrored option values.
 */
export function buildAuthSchema(
  isSignup: boolean,
  errorMessages: Messages["auth"]["errors"],
): yup.ObjectSchema<AuthFormValues> {
  const optionalString = yup.string().optional();
  return yup.object({
    email: yup
      .string()
      .required(errorMessages.emailRequired)
      .email(errorMessages.emailInvalid),
    password: yup
      .string()
      .required(errorMessages.passwordRequired)
      .min(8, errorMessages.passwordMin),
    fullName: isSignup
      ? yup.string().required(errorMessages.fullNameRequired)
      : optionalString,
    company: isSignup
      ? yup.string().required(errorMessages.companyRequired)
      : optionalString,
    industry: isSignup
      ? yup
          .string()
          .required(errorMessages.industryRequired)
          .oneOf(industryValues, errorMessages.industryRequired)
      : optionalString,
    companySize: isSignup
      ? yup
          .string()
          .required(errorMessages.companySizeRequired)
          .oneOf(companySizeValues, errorMessages.companySizeRequired)
      : optionalString,
    region: isSignup
      ? yup.string().required(errorMessages.regionRequired)
      : optionalString,
    language: isSignup
      ? yup
          .string()
          .required(errorMessages.languageRequired)
          .oneOf(languageValues, errorMessages.languageRequired)
      : optionalString,
  });
}
