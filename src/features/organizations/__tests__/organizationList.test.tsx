import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { getApiBaseUrl } from "@/lib/api";
import { getMessages } from "@/i18n/dictionaries";
import { server } from "@/test/server";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/render";
import { serverError, success } from "@/test/mocks/response-factories";
import { OrganizationList } from "../components/organizationList";
import { organizationMembershipsFixture } from "@/test/mocks/handlers/organizations";

const messages = getMessages("en");
const t = messages.organization;
const base = getApiBaseUrl();

function renderList(onEdit = vi.fn()) {
  renderWithProviders(
    <OrganizationList
      messages={t}
      industryLabels={messages.auth.industries}
      onEdit={onEdit}
    />,
  );
  return { onEdit };
}

describe("OrganizationList", () => {
  it("shows a busy placeholder while the request is in flight", () => {
    renderList();

    expect(screen.getByLabelText(t.list.loading)).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("renders every organization with its localized industry and role", async () => {
    renderList();

    expect(await screen.findByText("Acme Skincare Co.")).toBeInTheDocument();
    expect(screen.getByText("Beauty & Personal Care")).toBeInTheDocument();
    expect(screen.getByText(t.roles.OWNER)).toBeInTheDocument();

    expect(screen.getByText("Northwind Labs")).toBeInTheDocument();
    expect(screen.getByText("SaaS & Technology")).toBeInTheDocument();
    expect(screen.getByText(t.roles.EDITOR)).toBeInTheDocument();
  });

  it("offers edit only where the caller's role may patch the organization", async () => {
    renderList();

    await screen.findByText("Acme Skincare Co.");

    const editButtons = screen.getAllByRole("button", { name: t.form.edit });
    expect(editButtons).toHaveLength(1);
  });

  it("hands the chosen organization to onEdit", async () => {
    const user = userEvent.setup();
    const { onEdit } = renderList();

    await user.click(await screen.findByRole("button", { name: t.form.edit }));

    expect(onEdit).toHaveBeenCalledWith(organizationMembershipsFixture[0]);
  });

  it("falls back to the raw industry value when no label exists", async () => {
    server.use(
      http.get(`${base}/organizations`, () =>
        success([
          {
            id: "org_9",
            name: "Frontier Foods",
            industry: "SPACE_LOGISTICS",
            companySize: "SIZE_1_5",
            websiteUrl: null,
            primaryRegion: "Canada",
            primaryLanguage: "en",
            createdAt: "2026-03-01T10:00:00.000Z",
            updatedAt: "2026-03-01T10:00:00.000Z",
            role: "VIEWER",
          },
        ]),
      ),
    );

    renderList();

    expect(await screen.findByText("SPACE_LOGISTICS")).toBeInTheDocument();
  });

  it("shows the empty state when the caller belongs to no organization", async () => {
    server.use(http.get(`${base}/organizations`, () => success([])));

    renderList();

    expect(await screen.findByText(t.list.empty)).toBeInTheDocument();
  });

  it("maps a forbidden failure to the no-access message via the error code", async () => {
    server.use(
      http.get(`${base}/organizations`, () =>
        HttpResponse.json(
          {
            success: false,
            error: { code: "FORBIDDEN", message: "Forbidden" },
          },
          { status: 403 },
        ),
      ),
    );

    renderList();

    expect(await screen.findByText(t.errors.forbidden)).toBeInTheDocument();
  });

  it("falls back to the generic message for an unmapped failure", async () => {
    server.use(http.get(`${base}/organizations`, () => serverError()));

    renderList();

    expect(await screen.findByText(t.errors.unexpected)).toBeInTheDocument();
  });

  it("refetches when the user retries after a failure", async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${base}/organizations`, () => serverError(), { once: true }),
    );

    renderList();

    await user.click(await screen.findByRole("button", { name: t.list.retry }));

    await waitFor(() => {
      expect(screen.getByText("Acme Skincare Co.")).toBeInTheDocument();
    });
  });
});
