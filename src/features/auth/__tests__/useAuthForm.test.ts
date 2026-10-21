import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HttpResponse, http } from "msw";

import { useAuthForm } from "@/features/auth/hooks/useAuthForm";
import { getApiBaseUrl } from "@/lib/api";
import { createWrapper } from "@/test/render";
import { server } from "@/test/server";
import { authMessagesFixture } from "@/test/fixtures/messages.fixture";
import { buildAuthFormValues } from "@/test/factories/auth-form-values.factory";
import { success } from "@/test/mocks/response-factories";
import { router } from "@/test/utils/router";

function setup(
  mode: "signin" | "signup" = "signin",
  locale: "en" | "fa" = "en",
) {
  // react-hook-form's formState is a Proxy that only starts tracking (and
  // therefore updating) a field once something reads it during render — in
  // the real app that read happens inside AppForm/FormInput. Reading
  // `.errors` here mirrors that subscription so this hook-only test sees
  // the same updates a mounted form would.
  return renderHook(
    () => {
      const result = useAuthForm({
        mode,
        locale,
        messages: authMessagesFixture,
      });
      void result.form.formState.errors;
      return result;
    },
    { wrapper: createWrapper() },
  );
}

describe("useAuthForm", () => {
  it("starts with empty default values and no errors", () => {
    const { result } = setup();

    expect(result.current.form.getValues()).toEqual({
      email: "",
      password: "",
      fullName: "",
      company: "",
      industry: "",
      companySize: "",
      region: "",
      language: "",
    });
    expect(result.current.form.formState.errors).toEqual({});
  });

  it("rejects submission with an empty email", async () => {
    const { result } = setup();
    const values = buildAuthFormValues({ email: "" });

    act(() => {
      result.current.form.setValue("email", values.email);
      result.current.form.setValue("password", values.password);
    });
    await act(() => result.current.onSubmit());

    await waitFor(() =>
      expect(result.current.form.formState.errors.email?.message).toBe(
        authMessagesFixture.errors.emailRequired,
      ),
    );
    expect(router.push).not.toHaveBeenCalled();
  });

  it("rejects an invalid email format", async () => {
    const { result } = setup();

    act(() => {
      result.current.form.setValue("email", "not-an-email");
      result.current.form.setValue("password", "long-enough-pass");
    });
    await act(() => result.current.onSubmit());

    await waitFor(() =>
      expect(result.current.form.formState.errors.email?.message).toBe(
        authMessagesFixture.errors.emailInvalid,
      ),
    );
  });

  it("rejects a password shorter than 8 characters", async () => {
    const { result } = setup();

    act(() => {
      result.current.form.setValue("email", "founder@acme.dev");
      result.current.form.setValue("password", "short");
    });
    await act(() => result.current.onSubmit());

    await waitFor(() =>
      expect(result.current.form.formState.errors.password?.message).toBe(
        authMessagesFixture.errors.passwordMin,
      ),
    );
  });

  it("requires company only in signup mode", async () => {
    const { result } = setup("signup");

    act(() => {
      result.current.form.setValue("email", "founder@acme.dev");
      result.current.form.setValue("password", "long-enough-pass");
    });
    await act(() => result.current.onSubmit());

    await waitFor(() =>
      expect(result.current.form.formState.errors.company?.message).toBe(
        authMessagesFixture.errors.companyRequired,
      ),
    );
  });

  it("does not require company in signin mode", async () => {
    const { result } = setup("signin");
    const values = buildAuthFormValues({ company: "" });

    act(() => {
      result.current.form.setValue("email", values.email);
      result.current.form.setValue("password", values.password);
    });
    await act(() => result.current.onSubmit());

    expect(result.current.form.formState.errors.company).toBeUndefined();
  });

  it("redirects to the dashboard of the org signup created", async () => {
    const { result } = setup("signup");
    const values = buildAuthFormValues();

    act(() => {
      result.current.form.setValue("email", values.email);
      result.current.form.setValue("password", values.password);
      result.current.form.setValue("fullName", values.fullName!);
      result.current.form.setValue("company", values.company!);
      result.current.form.setValue("industry", values.industry!);
      result.current.form.setValue("companySize", values.companySize!);
      result.current.form.setValue("region", values.region!);
      result.current.form.setValue("language", values.language!);
    });
    await act(() => result.current.onSubmit());

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith("/en/dashboard/org_1"),
    );
  });

  it("redirects to the first organization's dashboard on signin", async () => {
    const { result } = setup("signin");
    const values = buildAuthFormValues();

    act(() => {
      result.current.form.setValue("email", values.email);
      result.current.form.setValue("password", values.password);
    });
    await act(() => result.current.onSubmit());

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith("/en/dashboard/org_1"),
    );
  });

  it("falls back to organization creation when the caller has no organization", async () => {
    server.use(http.get(`${getApiBaseUrl()}/organizations`, () => success([])));
    const { result } = setup("signin");
    const values = buildAuthFormValues();

    act(() => {
      result.current.form.setValue("email", values.email);
      result.current.form.setValue("password", values.password);
    });
    await act(() => result.current.onSubmit());

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith(
        "/en/dashboard/organization/new",
      ),
    );
  });

  it("surfaces a root error when the API rejects the credentials", async () => {
    server.use(
      http.post(`${getApiBaseUrl()}/auth/login`, () =>
        HttpResponse.json(
          {
            success: false,
            error: { code: "INVALID_CREDENTIALS", message: "nope" },
          },
          { status: 401 },
        ),
      ),
    );
    const { result } = setup("signin");
    const values = buildAuthFormValues();

    act(() => {
      result.current.form.setValue("email", values.email);
      result.current.form.setValue("password", values.password);
    });
    await act(() => result.current.onSubmit());

    await waitFor(() =>
      expect(result.current.form.formState.errors.root?.message).toBe(
        authMessagesFixture.errors.invalidCredentials,
      ),
    );
    expect(router.push).not.toHaveBeenCalled();
  });
});

it.each([false, true])(
  "uses localized Persian routes after signin (empty=%s)",
  async (empty) => {
    if (empty)
      server.use(
        http.get(`${getApiBaseUrl()}/organizations`, () => success([])),
      );
    const { result } = setup("signin", "fa");
    act(() => {
      result.current.form.setValue("email", "founder@acme.dev");
      result.current.form.setValue("password", "long-enough-pass");
    });
    await act(() => result.current.onSubmit());
    expect(router.push).toHaveBeenCalledWith(
      empty ? "/fa/dashboard/organization/new" : "/fa/dashboard/org_1",
    );
  },
);
