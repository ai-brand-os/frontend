import { vi } from "vitest";

/**
 * Shared mock for `next/navigation`, registered once from `setup.ts` so
 * it's active for every test file. Import `router` to assert on calls:
 *
 *   expect(router.push).toHaveBeenCalledWith('/en')
 *
 * `restoreMocks: true` in vitest.config.mts clears call history between
 * tests automatically — no manual reset needed.
 */
export const router = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

const DEFAULT_PATHNAME = "/";

let pathname = DEFAULT_PATHNAME;

/**
 * Points `usePathname()` at a route for the current test. Reset to `/` after
 * each test from `setup.ts`.
 */
export function setPathname(value: string) {
  pathname = value;
}

export function resetPathname() {
  pathname = DEFAULT_PATHNAME;
}

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return {
    ...actual,
    useRouter: () => router,
    usePathname: () => pathname,
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
  };
});
