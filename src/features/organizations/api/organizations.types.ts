/** Membership roles within an org, mirroring the backend `OrgRole` enum. */
export type OrgRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

/** Mirrors the backend `OrganizationView` — an org profile. */
export type Organization = {
  id: string;
  name: string;
  industry: string;
  companySize: string;
  websiteUrl: string | null;
  primaryRegion: string;
  primaryLanguage: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Mirrors the backend `OrganizationMembershipView` — an org in the caller's
 * list, annotated with their own role. Returned by GET /organizations.
 */
export type OrganizationMembership = Organization & {
  role: OrgRole;
};

/** Mirrors the backend `OrganizationMemberView` — one member of an org. */
export type OrganizationMember = {
  userId: string;
  email: string;
  fullName: string;
  role: OrgRole;
  joinedAt: string;
};

/** Request DTO for `POST /organizations`. Mirrors the backend `CreateOrganizationDto`. */
export type CreateOrganizationInput = {
  name: string;
  industry: string;
  companySize: string;
  websiteUrl?: string;
  primaryRegion: string;
  primaryLanguage: string;
};

/**
 * Request DTO for `PATCH /organizations/:id`. Mirrors the backend
 * `UpdateOrganizationDto` — every field optional; at least one required.
 */
export type UpdateOrganizationInput = {
  industry?: string;
  companySize?: string;
  websiteUrl?: string;
  primaryRegion?: string;
  primaryLanguage?: string;
};
