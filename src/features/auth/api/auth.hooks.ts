"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getUser,
  isAuthenticated,
  subscribeTokens,
  subscribeUser,
  type AuthUser,
} from "@/lib/api";
import { login, logout, signup } from "./auth.service";
import type { LoginInput, SignupInput } from "./auth.types";

/**
 * Reactive auth flag, backed by the token store. Re-renders on login/logout.
 * Returns `false` during SSR (no `window`) to match the first client render.
 */
export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(subscribeTokens, isAuthenticated, () => false);
}

/**
 * The signed-in user, or `null` when signed out. Backed by the user store, so
 * it re-renders on login/logout. Returns `null` during SSR (no `window`) to
 * match the first client render.
 */
export function useCurrentUser(): AuthUser | null {
  return useSyncExternalStore(subscribeUser, getUser, () => null);
}

/** Mutation wrapping `POST /auth/login`. On error, throws an `ApiError`. */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => {
      queryClient.clear();
      return login(input);
    },
  });
}

/** Mutation wrapping `POST /auth/signup`. */
export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SignupInput) => {
      queryClient.clear();
      return signup(input);
    },
  });
}

/** Clears cached principal data before attempting server logout. */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      queryClient.clear();
      return logout();
    },
  });
}
