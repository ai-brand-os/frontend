import { router } from "@/test/mocks/next-navigation";

/**
 * `next/navigation` is mocked globally in setup.ts. Call this when a test
 * needs custom router behavior, e.g. a rejected navigation:
 *
 *   mockRouter({ push: vi.fn().mockRejectedValue(new Error('blocked')) })
 */
export function mockRouter(overrides: Partial<typeof router> = {}) {
  Object.assign(router, overrides);
  return router;
}

export { router };
