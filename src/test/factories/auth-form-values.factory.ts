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
    company: "Acme Skincare Co.",
    password: "correct-horse-battery-staple",
    ...overrides,
  };
}
