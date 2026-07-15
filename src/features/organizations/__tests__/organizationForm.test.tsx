import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { getApiBaseUrl } from "@/lib/api";
import { getMessages } from "@/i18n/dictionaries";
import { server } from "@/test/server";
import { renderWithProviders, screen, userEvent, waitFor } from "@/test/render";
import { success } from "@/test/mocks/response-factories";
import { organizationMembershipsFixture } from "@/test/mocks/handlers/organizations";
import { OrganizationForm } from "../components/organizationForm";
import type { Organization } from "../api";

const messages = getMessages("en");
const t = messages.organization;
const base = getApiBaseUrl();

const optionLabels = {
  industries: messages.auth.industries,
  companySizes: messages.auth.companySizes,
  languages: messages.auth.languages,
};

const existingOrganization: Organization = organizationMembershipsFixture[0];

function renderForm(
  overrides: Partial<React.ComponentProps<typeof OrganizationForm>> = {},
) {
  const onSuccess = vi.fn();
  const onCancel = vi.fn();
  renderWithProviders(
    <OrganizationForm
      mode="create"
      messages={t}
      optionLabels={optionLabels}
      onCancel={onCancel}
      onSuccess={onSuccess}
      {...overrides}
    />,
  );
  return { onSuccess, onCancel };
}

describe("OrganizationForm", () => {
  it("blocks submission and reports the missing required fields", async () => {
    const user = userEvent.setup();
    const { onSuccess } = renderForm();

    await user.click(screen.getByRole("button", { name: t.form.submitCreate }));

    expect(
      await screen.findByText(t.form.errors.nameRequired),
    ).toBeInTheDocument();
    expect(screen.getByText(t.form.errors.industryRequired)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("rejects a website that is not a valid URL", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/website/i), "acme");
    await user.click(screen.getByRole("button", { name: t.form.submitCreate }));

    expect(
      await screen.findByText(t.form.errors.websiteUrlInvalid),
    ).toBeInTheDocument();
  });

  it("posts the new organization and reports success", async () => {
    const user = userEvent.setup();
    const requests: unknown[] = [];
    server.use(
      http.post(`${base}/organizations`, async ({ request }) => {
        requests.push(await request.json());
        return success(existingOrganization, { status: 201 });
      }),
    );
    const { onSuccess } = renderForm();

    await user.type(screen.getByLabelText(/organization name/i), "Acme Skincare Co.");
    await user.selectOptions(
      screen.getByLabelText(/industry/i),
      "BEAUTY_PERSONAL_CARE",
    );
    await user.selectOptions(screen.getByLabelText(/company size/i), "SIZE_6_20");
    await user.type(screen.getByLabelText(/primary region/i), "United States");
    await user.selectOptions(screen.getByLabelText(/primary language/i), "en");
    await user.click(screen.getByRole("button", { name: t.form.submitCreate }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(requests).toEqual([
      {
        name: "Acme Skincare Co.",
        industry: "BEAUTY_PERSONAL_CARE",
        companySize: "SIZE_6_20",
        primaryRegion: "United States",
        primaryLanguage: "en",
      },
    ]);
  });

  it("prefills the org being edited and patches without the name", async () => {
    const user = userEvent.setup();
    const requests: unknown[] = [];
    server.use(
      http.patch(
        `${base}/organizations/${existingOrganization.id}`,
        async ({ request }) => {
          requests.push(await request.json());
          return success(existingOrganization);
        },
      ),
    );
    const { onSuccess } = renderForm({
      mode: "edit",
      organization: existingOrganization,
    });

    expect(screen.queryByLabelText(/organization name/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/primary region/i)).toHaveValue("United States");

    await user.selectOptions(
      screen.getByLabelText(/industry/i),
      "SAAS_TECHNOLOGY",
    );
    await user.click(screen.getByRole("button", { name: t.form.submitEdit }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(requests).toEqual([
      {
        industry: "SAAS_TECHNOLOGY",
        companySize: "SIZE_6_20",
        websiteUrl: "https://acme.co",
        primaryRegion: "United States",
        primaryLanguage: "en",
      },
    ]);
  });

  it("surfaces a localized message when the server rejects the change", async () => {
    const user = userEvent.setup();
    server.use(
      http.patch(`${base}/organizations/${existingOrganization.id}`, () =>
        HttpResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Forbidden" } },
          { status: 403 },
        ),
      ),
    );
    const { onSuccess } = renderForm({
      mode: "edit",
      organization: existingOrganization,
    });

    await user.click(screen.getByRole("button", { name: t.form.submitEdit }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      t.errors.forbidden,
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("closes without a request when cancelled", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderForm();

    await user.click(screen.getByRole("button", { name: t.form.cancel }));

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
