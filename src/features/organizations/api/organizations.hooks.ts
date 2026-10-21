"use client";

import { getUser } from "@/lib/api";
import { getCredentialEpoch } from "@/lib/api/token-store";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createOrganization,
  getOrganization,
  listOrganizationMembers,
  listOrganizations,
  updateOrganization,
} from "./organizations.service";
import { organizationKeys } from "./organizations.query-keys";
import type {
  CreateOrganizationInput,
  Organization,
  UpdateOrganizationInput,
} from "./organizations.types";

/** Freshness for org profile data — cheap to keep warm, rarely changes. */
const ORG_STALE_TIME = 5 * 60 * 1000;

/** Query wrapping `GET /organizations` — the caller's org list (switcher). */
export function useOrganizations() {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: listOrganizations,
    staleTime: ORG_STALE_TIME,
  });
}

/**
 * Query wrapping `GET /organizations/:id`. Disabled until `id` is truthy so it
 * is safe to call before the id is known. `placeholderData` keeps the previous
 * org on screen while switching ids instead of flashing a loading state.
 */
export function useOrganization(id: string) {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => getOrganization(id),
    enabled: Boolean(id),
    staleTime: ORG_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

/** Query wrapping `GET /organizations/:id/members`. */
export function useOrganizationMembers(id: string) {
  return useQuery({
    queryKey: organizationKeys.members(id),
    queryFn: () => listOrganizationMembers(id),
    enabled: Boolean(id),
    staleTime: ORG_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

/** Mutation wrapping `POST /organizations`. Invalidates the org list. */
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => createOrganization(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

/**
 * Mutation wrapping `PATCH /organizations/:id` with an optimistic update: the
 * detail cache is patched immediately, rolled back on error, and reconciled
 * with the server on settle. The list is invalidated too (name/role rows may
 * have changed).
 */
export function useUpdateOrganization(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrganizationInput) =>
      updateOrganization(id, input),
    onMutate: async (input: UpdateOrganizationInput) => {
      const epoch = getCredentialEpoch();
      const principalId = getUser()?.id;
      const detailKey = organizationKeys.detail(id);
      await queryClient.cancelQueries({ queryKey: detailKey });
      if (epoch !== getCredentialEpoch())
        return { epoch, principalId, previous: undefined };
      const previous = queryClient.getQueryData<Organization>(detailKey);
      if (previous) {
        queryClient.setQueryData<Organization>(detailKey, {
          ...previous,
          ...input,
        });
      }
      return { previous, epoch, principalId };
    },
    onError: (_error, _input, context) => {
      if (
        context?.previous &&
        context.epoch === getCredentialEpoch() &&
        context.principalId === getUser()?.id
      ) {
        queryClient.setQueryData(organizationKeys.detail(id), context.previous);
      }
    },
    onSettled: (_data, _error, _input, context) => {
      if (
        context?.epoch !== getCredentialEpoch() ||
        context.principalId !== getUser()?.id
      )
        return;
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}
