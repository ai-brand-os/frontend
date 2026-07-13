import type { AuthFormValues } from "@/components/auth/useAuthForm";

/**
 * Factory for form input, distinct from the `messages.fixture` above:
 * this is data the *user types*, so tests override only what the scenario
 * cares about instead of repeating the whole shape.
 *
 *   buildAuthFormValues({ email: "" }) // trigger "required" validation
 */
export function buildAuthFormValues(
  overrides: Partial<AuthFormValues> = {},
): AuthFormValues {
  return {
    email: "founder@acme.dev",
    password: "correct-horse-battery-staple",
    fullName: "Ada Lovelace",
    company: "Acme Skincare Co.",
    industry: "SAAS_TECHNOLOGY",
    companySize: "SIZE_6_20",
    region: "United States",
    language: "en",
    ...overrides,
  };
}
