import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * A QueryClient tuned for tests: no retries and no cache reuse across
 * assertions, so failed requests fail fast and tests never see stale data
 * from a previous render.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

type WrapperOptions = {
  queryClient?: QueryClient;
};

export function createWrapper({ queryClient = createTestQueryClient() }: WrapperOptions = {}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

/**
 * Renders with the same providers the app mounts at runtime (React Query
 * today; extend `createWrapper` if more global providers are added).
 * Prefer this over bare `render()` for anything under a provider boundary.
 */
export function renderWithProviders(
  ui: ReactElement,
  { queryClient, ...options }: WrapperOptions & Omit<RenderOptions, "wrapper"> = {},
) {
  return render(ui, { wrapper: createWrapper({ queryClient }), ...options });
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
