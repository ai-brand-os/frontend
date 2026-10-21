import { http, HttpResponse } from "msw";
import { SidebarUserSection } from "../dashboard/Sidebar/user";
import { getMessages } from "@/i18n/dictionaries";
import { getAccessToken, getApiBaseUrl, setTokens, setUser } from "@/lib/api";
import { renderWithProviders, screen, userEvent, waitFor } from "@/test/render";
import { router } from "@/test/utils/router";
import { server } from "@/test/server";

function setup(locale: "en" | "fa") {
  const nav = getMessages(locale).nav;
  setTokens({ accessToken: "access", refreshToken: "refresh" });
  setUser({ id: "user", email: "user@example.com", fullName: "Real user" });
  renderWithProviders(
    <SidebarUserSection
      locale={locale}
      logoutFailureLabel={nav.signOutFailed}
      user={{
        name: nav.userName,
        role: nav.userRole,
        signOutLabel: nav.signOut,
      }}
    />,
  );
  return nav;
}

describe("dashboard signout", () => {
  it.each(["en", "fa"] as const)(
    "logs out and navigates to localized signin (%s)",
    async (locale) => {
      server.use(
        http.post(
          `${getApiBaseUrl()}/auth/logout`,
          () => new HttpResponse(null, { status: 204 }),
        ),
      );
      const nav = setup(locale);
      await userEvent.click(screen.getByRole("button", { name: nav.signOut }));
      await waitFor(() =>
        expect(router.replace).toHaveBeenCalledWith(`/${locale}/signin`),
      );
      expect(getAccessToken()).toBeNull();
    },
  );

  it("shows unconfirmed server revocation after a failed request without hiding it by redirecting", async () => {
    server.use(
      http.post(`${getApiBaseUrl()}/auth/logout`, () => HttpResponse.error()),
    );
    const nav = setup("fa");
    await userEvent.click(screen.getByRole("button", { name: nav.signOut }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      nav.signOutFailed,
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/fa/signin");
    expect(router.replace).not.toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
  });
});
