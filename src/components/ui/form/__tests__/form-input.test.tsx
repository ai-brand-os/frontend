import { useEffect } from "react";
import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import { AppForm, FormInput } from "@/components/ui/form";
import { render, screen } from "@/test/render";

type Values = { email: string };

function Harness({ defaultError }: { defaultError?: string } = {}) {
  const form = useForm<Values>({ defaultValues: { email: "" } });

  useEffect(() => {
    if (defaultError) {
      form.setError("email", { type: "manual", message: defaultError });
    }
  }, [defaultError, form]);

  return (
    <AppForm form={form} onSubmit={form.handleSubmit(() => {})}>
      <FormInput<Values> name="email" label="Email" placeholder="you@company.com" />
    </AppForm>
  );
}

describe("FormInput", () => {
  it("associates the label with the input for accessibility", () => {
    render(<Harness />);

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("placeholder", "you@company.com");
  });

  it("accepts typed input", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const input = screen.getByLabelText("Email");
    await user.type(input, "founder@acme.dev");

    expect(input).toHaveValue("founder@acme.dev");
  });

  it("renders a field error message and marks the input invalid", () => {
    render(<Harness defaultError="Enter a valid email address." />);

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("Enter a valid email address."),
    ).toBeInTheDocument();
  });

  it("does not render an error message when the field is valid", () => {
    render(<Harness />);

    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });
});
