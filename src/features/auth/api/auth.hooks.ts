"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { isAuthenticated, subscribeTokens } from "@/lib/api";
import { login, logout, signup } from "./auth.service";
import type { LoginInput, SignupInput } from "./auth.types";

/**
 * Reactive auth flag, backed by the token store. Re-renders on login/logout.
 * Returns `false` during SSR (no `window`) to match the first client render.
 */
export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(subscribeTokens, isAuthenticated, () => false);
}

/** Mutation wrapping `POST /auth/login`. On error, throws an `ApiError`. */
export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
  });
}

/** Mutation wrapping `POST /auth/signup`. */
export function useSignup() {
  return useMutation({
    mutationFn: (input: SignupInput) => signup(input),
  });
}

/** Mutation wrapping `POST /auth/logout`. Clears cached queries afterwards. */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
