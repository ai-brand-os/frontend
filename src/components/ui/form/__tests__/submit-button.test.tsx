import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import { AppForm, SubmitButton } from "@/components/ui/form";
import { render, screen } from "@/test/render";

type Values = { email: string };

function Harness({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const form = useForm<Values>({ defaultValues: { email: "" } });

  return (
    <AppForm form={form} onSubmit={form.handleSubmit(onSubmit)}>
      <SubmitButton>Sign in</SubmitButton>
    </AppForm>
  );
}

describe("SubmitButton", () => {
  it("is enabled while the form is idle", () => {
    render(<Harness onSubmit={async () => {}} />);

    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });

  it("disables itself while the form is submitting", async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });

    render(<Harness onSubmit={() => pending} />);

    const button = screen.getByRole("button", { name: "Sign in" });
    await user.click(button);

    expect(await screen.findByRole("button", { name: "Sign in" })).toBeDisabled();

    resolveSubmit();
  });
});
