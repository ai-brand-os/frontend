import { httpClient } from "@/lib/api";
import type {
  CreateOrganizationInput,
  Organization,
  OrganizationMember,
  OrganizationMembership,
  UpdateOrganizationInput,
} from "./organizations.types";

/**
 * GET /organizations — every org the caller belongs to, newest-first, each
 * tagged with the caller's role. Backs the org switcher (ADR-005).
 */
export function listOrganizations(): Promise<OrganizationMembership[]> {
  return httpClient.get<OrganizationMembership[]>("/organizations");
}

/**
 * POST /organizations — creates an additional org; the caller becomes Owner
 * (ADR-005).
 */
export function createOrganization(
  input: CreateOrganizationInput,
): Promise<Organization> {
  return httpClient.post<Organization>("/organizations", input);
}

/** GET /organizations/:id — the org profile; caller must be a member. */
export function getOrganization(id: string): Promise<Organization> {
  return httpClient.get<Organization>(`/organizations/${id}`);
}

/**
 * PATCH /organizations/:id — updates mutable profile fields. Requires
 * Owner/Admin. At least one field must be present.
 */
export function updateOrganization(
  id: string,
  input: UpdateOrganizationInput,
): Promise<Organization> {
  return httpClient.patch<Organization>(`/organizations/${id}`, input);
}

/** GET /organizations/:id/members — all members of the org. */
export function listOrganizationMembers(
  id: string,
): Promise<OrganizationMember[]> {
  return httpClient.get<OrganizationMember[]>(`/organizations/${id}/members`);
}
