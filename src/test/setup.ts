import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

import { server } from "@/test/server";
import { resetPathname } from "@/test/mocks/next-navigation";
import { mockMatchMedia, mockResizeObserver } from "@/test/utils/observers";
import { clearTokens, clearUser } from "@/lib/api";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Global browser API stand-ins jsdom doesn't provide, needed by base-ui
// primitives (Button/Input) and any future popover/menu components. Reapplied
// every test since afterEach below undoes vi.stubGlobal via unstubAllGlobals.
beforeEach(() => {
  mockMatchMedia();
  mockResizeObserver();
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  vi.unstubAllGlobals();
  resetPathname();
  clearTokens();
  clearUser();
});

afterAll(() => server.close());
