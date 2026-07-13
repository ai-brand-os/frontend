import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";

import { AuthForm } from "@/components/auth/authForm";
import { renderWithProviders, screen } from "@/test/render";
import { authMessagesFixture } from "@/test/fixtures/messages.fixture";
import { router } from "@/test/utils/router";

function renderAuthForm(mode: "signin" | "signup" = "signin") {
  return renderWithProviders(
    <AuthForm mode={mode} locale="en" messages={authMessagesFixture} />,
  );
}

describe("AuthForm", () => {
  it("renders the sign-in copy and fields", () => {
    renderAuthForm("signin");

    expect(
      screen.getByRole("heading", {
        name: authMessagesFixture.signin.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(authMessagesFixture.fields.email)).toBeInTheDocument();
    expect(
      screen.getByLabelText(authMessagesFixture.fields.password),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(authMessagesFixture.fields.company),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: authMessagesFixture.signin.cta }),
    ).toBeInTheDocument();
  });

  it("starts signup on the account step and hides organization fields", () => {
    renderAuthForm("signup");

    expect(
      screen.getByLabelText(authMessagesFixture.fields.email),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(authMessagesFixture.fields.fullName),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(authMessagesFixture.fields.company),
    ).not.toBeInTheDocument();
  });

  it("advances to the organization step after valid account input", async () => {
    const user = userEvent.setup();
    renderAuthForm("signup");

    await user.type(
      screen.getByLabelText(authMessagesFixture.fields.email),
      "founder@acme.dev",
    );
    await user.type(
      screen.getByLabelText(authMessagesFixture.fields.fullName),
      "Ada Lovelace",
    );
    await user.type(
      screen.getByLabelText(authMessagesFixture.fields.password),
      "correct-horse-battery-staple",
    );
    await user.click(
      screen.getByRole("button", { name: authMessagesFixture.signup.next }),
    );

    expect(
      await screen.findByLabelText(authMessagesFixture.fields.company),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(authMessagesFixture.fields.email),
    ).not.toBeInTheDocument();
  });

  it("blocks the account step until required fields are valid", async () => {
    const user = userEvent.setup();
    renderAuthForm("signup");

    await user.click(
      screen.getByRole("button", { name: authMessagesFixture.signup.next }),
    );

    expect(
      await screen.findByText(authMessagesFixture.errors.emailRequired),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(authMessagesFixture.fields.company),
    ).not.toBeInTheDocument();
  });

  it("shows validation errors and blocks navigation when submitted empty", async () => {
    const user = userEvent.setup();
    renderAuthForm("signin");

    await user.click(
      screen.getByRole("button", { name: authMessagesFixture.signin.cta }),
    );

    expect(
      await screen.findByText(authMessagesFixture.errors.emailRequired),
    ).toBeInTheDocument();
    expect(
      screen.getByText(authMessagesFixture.errors.passwordRequired),
    ).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("submits successfully and navigates home with valid input", async () => {
    const user = userEvent.setup();
    renderAuthForm("signin");

    await user.type(
      screen.getByLabelText(authMessagesFixture.fields.email),
      "founder@acme.dev",
    );
    await user.type(
      screen.getByLabelText(authMessagesFixture.fields.password),
      "correct-horse-battery-staple",
    );
    await user.click(
      screen.getByRole("button", { name: authMessagesFixture.signin.cta }),
    );

    await screen.findByRole("button", { name: authMessagesFixture.signin.cta });
    expect(router.push).toHaveBeenCalledWith("/en");
  });

  it("shows the forgot-password link in signin mode", () => {
    renderAuthForm("signin");
    expect(
      screen.getByRole("link", { name: authMessagesFixture.signin.forgot }),
    ).toBeInTheDocument();
  });

  it("hides the forgot-password link in signup mode", () => {
    renderAuthForm("signup");
    expect(
      screen.queryByRole("link", { name: authMessagesFixture.signin.forgot }),
    ).not.toBeInTheDocument();
  });
});
