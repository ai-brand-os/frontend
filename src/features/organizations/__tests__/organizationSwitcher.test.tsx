import { http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { getApiBaseUrl } from "@/lib/api";
import { getMessages } from "@/i18n/dictionaries";
import { server } from "@/test/server";
import { renderWithProviders, screen, userEvent, waitFor } from "@/test/render";
import { serverError, success } from "@/test/mocks/response-factories";
import { router, setPathname } from "@/test/mocks/next-navigation";
import { organizationMembershipsFixture } from "@/test/mocks/handlers/organizations";
import { OrganizationSwitcher } from "../components/organizationSwitcher";

const messages = getMessages("en");
const t = messages.organization;
const base = getApiBaseUrl();

function renderSwitcher(orgId = "org_1", locale: "en" | "fa" = "en") {
  renderWithProviders(
    <OrganizationSwitcher
      locale={locale}
      orgId={orgId}
      messages={t}
      industryLabels={messages.auth.industries}
    />,
  );
}

describe("OrganizationSwitcher", () => {
  beforeEach(() => {
    setPathname("/en/dashboard/org_1");
  });

  it("shows a busy placeholder while the organization list is in flight", () => {
    renderSwitcher();

    expect(screen.getByLabelText(t.list.loading)).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("shows the org named by the URL with its localized industry", async () => {
    renderSwitcher();

    expect(await screen.findByText("Acme Skincare Co.")).toBeInTheDocument();
    expect(screen.getByText("Beauty & Personal Care")).toBeInTheDocument();
  });

  it("links each org to the current page under that org's id", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(
      await screen.findByRole("button", { name: t.switcher.trigger }),
    );

    expect(
      await screen.findByRole("menuitem", { name: /Northwind Labs/ }),
    ).toHaveAttribute("href", "/en/dashboard/org_2");
  });

  it("offers creating an organization from the menu", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(
      await screen.findByRole("button", { name: t.switcher.trigger }),
    );

    expect(
      await screen.findByRole("menuitem", { name: t.form.submitCreate }),
    ).toHaveAttribute("href", "/en/dashboard/organization/new");
  });

  it("does not open a menu when the caller belongs to a single org", async () => {
    server.use(
      http.get(`${base}/organizations`, () =>
        success([organizationMembershipsFixture[0]]),
      ),
    );

    renderSwitcher();

    await screen.findByText("Acme Skincare Co.");
    expect(
      screen.queryByRole("button", { name: t.switcher.trigger }),
    ).not.toBeInTheDocument();
  });

  it("replaces an org id the caller has no membership in with their first org", async () => {
    renderSwitcher("org_missing");

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/en/dashboard/org_1");
    });
  });

  it("points a caller with no organizations at the organization page", async () => {
    server.use(http.get(`${base}/organizations`, () => success([])));

    renderSwitcher("org_missing");

    expect(
      await screen.findByRole("link", { name: t.switcher.empty }),
    ).toHaveAttribute("href", "/en/dashboard/organization/new");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("surfaces a failed organization list instead of an empty switcher", async () => {
    server.use(http.get(`${base}/organizations`, () => serverError()));

    renderSwitcher();

    expect(await screen.findByText(t.errors.unexpected)).toBeInTheDocument();
  });
});

it.each(["en", "fa"] as const)(
  "switches from an organization management page without corrupting it (%s)",
  async (locale) => {
    setPathname(`/${locale}/dashboard/organization/org_1/edit`);
    renderSwitcher("", locale);
    await userEvent.click(
      await screen.findByRole("button", { name: t.switcher.trigger }),
    );
    expect(
      await screen.findByRole("menuitem", { name: /Northwind Labs/ }),
    ).toHaveAttribute("href", `/${locale}/dashboard/org_2`);
  },
);

it("preserves the scoped suffix when correcting a missing organization", async () => {
  setPathname("/fa/dashboard/org_missing");
  renderSwitcher("org_missing", "fa");
  await waitFor(() =>
    expect(router.replace).toHaveBeenCalledWith("/fa/dashboard/org_1"),
  );
});
