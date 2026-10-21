import { existsSync } from "node:fs";
import { join } from "node:path";
import DashboardLayout from "@/app/[locale]/dashboard/layout";
import { getMessages } from "@/i18n/dictionaries";
import { renderWithProviders, screen } from "@/test/render";

it.each(["en", "fa"] as const)(
  "keeps existing navigation and signout available below md (%s)",
  async (locale) => {
    const layout = await DashboardLayout({
      params: Promise.resolve({ locale }),
      children: <p>Dashboard content</p>,
    });
    const { container } = renderWithProviders(layout);
    const sidebar = container.querySelector("aside");
    expect(sidebar).toHaveClass("flex", "w-full", "md:w-60");
    expect(sidebar).not.toHaveClass("hidden");
    expect(container.firstChild).toHaveClass("flex-col", "md:flex-row");
    expect(
      screen.getByRole("button", { name: getMessages(locale).nav.signOut }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: getMessages(locale).nav.organization }),
    ).toHaveAttribute("href", `/${locale}/dashboard/organization`);
  },
);

it("anchors canonical redirects to existing App Router pages", () => {
  for (const route of [
    "[locale]/dashboard/[orgId]/page.tsx",
    "[locale]/dashboard/organization/page.tsx",
    "[locale]/dashboard/organization/new/page.tsx",
    "[locale]/dashboard/organization/[orgId]/edit/page.tsx",
    "[locale]/(auth)/signin/page.tsx",
  ]) {
    expect(existsSync(join(process.cwd(), "src/app", route)), route).toBe(true);
  }
  expect(
    existsSync(
      join(process.cwd(), "src/app/[locale]/[orgId]/dashboard/page.tsx"),
    ),
  ).toBe(false);
});
