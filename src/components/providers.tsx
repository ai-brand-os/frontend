"use client";

import { useEffect, useState } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import {
  ApiError,
  getUser,
  isAuthenticated,
  subscribeTokens,
  subscribeUser,
  toDeveloperMessage,
} from "@/lib/api";

/**
 * Retry policy: never retry client errors (4xx) — they won't succeed on
 * repeat — but retry transport failures (network/timeout, `status = 0`) and
 * server errors (5xx) up to twice.
 */
function retryQuery(failureCount: number, error: unknown): boolean {
  const status = error instanceof ApiError ? error.status : 0;
  if (status >= 400 && status < 500) return false;
  return failureCount < 2;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Central failure log for every query. Runs alongside each query's own
        // error handling, so logging lives in one place, not per hook.
        queryCache: new QueryCache({
          onError: (error) => {
            console.error(toDeveloperMessage(error));
          },
        }),
        // Central failure log for every mutation. Runs alongside each
        // mutation's own `onError` (which handles user-facing messaging), so
        // logging lives in one place instead of being repeated per hook.
        mutationCache: new MutationCache({
          onError: (error) => {
            console.error(toDeveloperMessage(error));
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: retryQuery,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  useEffect(() => {
    let principalId = getUser()?.id;
    const unsubscribeUser = subscribeUser(() => {
      const nextPrincipalId = getUser()?.id;
      if (nextPrincipalId !== principalId) queryClient.clear();
      principalId = nextPrincipalId;
    });
    const unsubscribeTokens = subscribeTokens(() => {
      if (!isAuthenticated()) queryClient.clear();
    });
    return () => {
      unsubscribeUser();
      unsubscribeTokens();
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
