import { useUpdateOrganization } from "@/features/organizations/api/organizations.hooks";
import { organizationKeys } from "@/features/organizations/api/organizations.query-keys";
import { organizationMembershipsFixture } from "@/test/mocks/handlers/organizations";
import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useLogin, useLogout, useSignup } from "../api/auth.hooks";
import { login, logout } from "../api/auth.service";
import {
  getAccessToken,
  getRefreshToken,
  getUser,
  setTokens,
  setUser,
  getApiBaseUrl,
} from "@/lib/api";
import { createWrapper, createTestQueryClient } from "@/test/render";
import { server } from "@/test/server";
import { authResultFixture } from "@/test/mocks/handlers/auth";

const credentials = {
  email: "new@example.com",
  password: "long-enough-password",
};
const signupInput = {
  ...credentials,
  fullName: "New user",
  organization: {
    name: "New org",
    industry: "OTHER",
    companySize: "SIZE_1_5",
    primaryRegion: "EU",
    primaryLanguage: "en",
  },
};
const base = getApiBaseUrl();
function seedCredentials() {
  setTokens({ accessToken: "old-access", refreshToken: "old-refresh" });
  setUser({ id: "old-user", email: "old@example.com", fullName: "Old User" });
}

describe("auth cache transitions", () => {
  it.each([false, true])(
    "clears credentials and cache before logout settles (failure=%s)",
    async (fails) => {
      seedCredentials();
      let release!: () => void;
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      server.use(
        http.post(`${base}/auth/logout`, async ({ request }) => {
          expect(await request.json()).toEqual({ refreshToken: "old-refresh" });
          await pending;
          return fails
            ? HttpResponse.error()
            : new HttpResponse(null, { status: 204 });
        }),
      );
      const client = createTestQueryClient();
      client.setQueryData(["private"], "old tenant");
      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper({ queryClient: client }),
      });
      act(() => result.current.mutate());
      await waitFor(() => expect(getAccessToken()).toBeNull());
      expect(getRefreshToken()).toBeNull();
      expect(getUser()).toBeNull();
      expect(client.getQueryData(["private"])).toBeUndefined();
      expect(localStorage.getItem("abos.refreshToken")).toBeNull();
      release();
      await waitFor(() => expect(result.current.isPending).toBe(false));
      expect(result.current.isError).toBe(fails);
    },
  );

  it.each(["login", "signup"] as const)(
    "drops the previous principal cache on %s",
    async (mode) => {
      seedCredentials();
      const client = createTestQueryClient();
      client.setQueryData(["organizations", "list"], [{ id: "old-org" }]);
      const { result } = renderHook(
        () => ({ login: useLogin(), signup: useSignup() }),
        {
          wrapper: createWrapper({ queryClient: client }),
        },
      );
      await act(async () => {
        if (mode === "login")
          await result.current.login.mutateAsync(credentials);
        else await result.current.signup.mutateAsync(signupInput);
      });
      expect(client.getQueryData(["organizations", "list"])).toBeUndefined();
      expect(getUser()).toEqual(authResultFixture.user);
    },
  );

  it("does not restore credentials from a login response arriving after logout", async () => {
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    let started!: () => void;
    const ready = new Promise<void>((resolve) => {
      started = resolve;
    });
    server.use(
      http.post(`${base}/auth/login`, async () => {
        started();
        await pending;
        return HttpResponse.json(authResultFixture);
      }),
    );
    const attempt = login(credentials);
    const rejection = expect(attempt).rejects.toThrow("superseded");
    await ready;
    await logout();
    release();
    await rejection;
    expect(getAccessToken()).toBeNull();
    expect(getUser()).toBeNull();
  });
});

it("does not restore an optimistic organization snapshot after logout", async () => {
  seedCredentials();
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  server.use(
    http.patch(`${base}/organizations/org_1`, async () => {
      started();
      await pending;
      return HttpResponse.json(
        {
          success: false,
          error: { code: "INTERNAL_ERROR", message: "failed" },
        },
        { status: 500 },
      );
    }),
    http.post(
      `${base}/auth/logout`,
      () => new HttpResponse(null, { status: 204 }),
    ),
  );
  const client = createTestQueryClient();
  const key = organizationKeys.detail("org_1");
  client.setQueryData(key, organizationMembershipsFixture[0]);
  const { result } = renderHook(
    () => ({ update: useUpdateOrganization("org_1"), logout: useLogout() }),
    { wrapper: createWrapper({ queryClient: client }) },
  );
  act(() => result.current.update.mutate({ primaryRegion: "New region" }));
  await ready;
  await act(async () => {
    await result.current.logout.mutateAsync();
  });
  release();
  await waitFor(() => expect(result.current.update.isError).toBe(true));
  expect(client.getQueryData(key)).toBeUndefined();
});
