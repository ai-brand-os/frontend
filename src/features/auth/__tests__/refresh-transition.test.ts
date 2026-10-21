import { http, HttpResponse } from "msw";
import {
  clearTokens,
  getAccessToken,
  getApiBaseUrl,
  httpClient,
  setTokens,
} from "@/lib/api";
import { refreshAccessToken } from "@/lib/api/http/token-refresher";
import { server } from "@/test/server";
import { authResultFixture } from "@/test/mocks/handlers/auth";

it("does not restore a refresh result after logout", async () => {
  setTokens({ accessToken: "old", refreshToken: "old-refresh" });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  server.use(
    http.post(`${getApiBaseUrl()}/auth/refresh`, async () => {
      started();
      await pending;
      return HttpResponse.json(authResultFixture);
    }),
  );
  const refresh = refreshAccessToken();
  await ready;
  clearTokens();
  release();
  expect(await refresh).toBe(false);
  expect(getAccessToken()).toBeNull();
});

it("does not refresh or replay an old principal's request after account change", async () => {
  setTokens({ accessToken: "old", refreshToken: "old-refresh" });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  let refreshes = 0;
  server.use(
    http.get(`${getApiBaseUrl()}/organizations`, async () => {
      started();
      await pending;
      return HttpResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "expired" } },
        { status: 401 },
      );
    }),
    http.post(`${getApiBaseUrl()}/auth/refresh`, () => {
      refreshes++;
      return HttpResponse.json(authResultFixture);
    }),
  );
  const request = httpClient.get("/organizations");
  const rejected = expect(request).rejects.toMatchObject({ status: 401 });
  await ready;
  clearTokens();
  setTokens({ accessToken: "new", refreshToken: "new-refresh" });
  release();
  await rejected;
  expect(refreshes).toBe(0);
  expect(getAccessToken()).toBe("new");
});

it("still coalesces ordinary concurrent 401 refreshes and replays with fresh credentials", async () => {
  setTokens({ accessToken: "old", refreshToken: "old-refresh" });
  let refreshes = 0;
  server.use(
    http.get(`${getApiBaseUrl()}/organizations`, ({ request }) =>
      request.headers.get("Authorization") === "Bearer access-token-1"
        ? HttpResponse.json([])
        : HttpResponse.json(
            {
              success: false,
              error: { code: "UNAUTHORIZED", message: "expired" },
            },
            { status: 401 },
          ),
    ),
    http.post(`${getApiBaseUrl()}/auth/refresh`, async () => {
      refreshes++;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return HttpResponse.json(authResultFixture);
    }),
  );
  await expect(
    Promise.all([
      httpClient.get("/organizations"),
      httpClient.get("/organizations"),
    ]),
  ).resolves.toEqual([[], []]);
  expect(refreshes).toBe(1);
});

it("starts a separate refresh for a new account while the old refresh is pending", async () => {
  setTokens({ accessToken: "old", refreshToken: "old-refresh" });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  server.use(
    http.post(`${getApiBaseUrl()}/auth/refresh`, async ({ request }) => {
      const body = (await request.json()) as { refreshToken: string };
      if (body.refreshToken === "old-refresh") {
        started();
        await pending;
      }
      return HttpResponse.json(authResultFixture);
    }),
  );
  const oldRefresh = refreshAccessToken();
  await ready;
  clearTokens();
  setTokens({ accessToken: "new", refreshToken: "new-refresh" });
  expect(await refreshAccessToken()).toBe(true);
  release();
  expect(await oldRefresh).toBe(false);
  expect(getAccessToken()).toBe("access-token-1");
});
