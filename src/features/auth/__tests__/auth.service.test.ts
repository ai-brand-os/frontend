import { describe, expect, it } from "vitest";

import { login, logout, signup } from "@/features/auth/api/auth.service";
import { getUser } from "@/lib/api";
import { authResultFixture } from "@/test/mocks/handlers/auth";
import { buildAuthFormValues } from "@/test/factories/auth-form-values.factory";

const credentials = {
  email: "founder@acme.dev",
  password: "long-enough-pass",
};

function buildSignupInput() {
  const values = buildAuthFormValues();
  return {
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
  };
}

describe("auth service user persistence", () => {
  it("stores the user returned by login", async () => {
    await login(credentials);

    expect(getUser()).toEqual(authResultFixture.user);
  });

  it("stores the user returned by signup", async () => {
    await signup(buildSignupInput());

    expect(getUser()).toEqual(authResultFixture.user);
  });

  it("keeps the stored user across a fresh read from localStorage", async () => {
    await login(credentials);

    expect(
      JSON.parse(window.localStorage.getItem("abos.user") ?? "null"),
    ).toEqual(authResultFixture.user);
  });

  it("clears the stored user on logout", async () => {
    await login(credentials);
    await logout();

    expect(getUser()).toBeNull();
    expect(window.localStorage.getItem("abos.user")).toBeNull();
  });
});
