import { http } from "msw";

import { getApiBaseUrl } from "@/lib/api";
import type { OrganizationMembership } from "@/features/organizations";
import { success } from "@/test/mocks/response-factories";

const base = getApiBaseUrl();

/** Representative `GET /organizations` payload, matching the backend view. */
export const organizationMembershipsFixture: OrganizationMembership[] = [
  {
    id: "org_1",
    name: "Acme Skincare Co.",
    industry: "BEAUTY_PERSONAL_CARE",
    companySize: "SIZE_6_20",
    websiteUrl: "https://acme.co",
    primaryRegion: "United States",
    primaryLanguage: "en",
    createdAt: "2026-01-05T10:00:00.000Z",
    updatedAt: "2026-01-05T10:00:00.000Z",
    role: "OWNER",
  },
  {
    id: "org_2",
    name: "Northwind Labs",
    industry: "SAAS_TECHNOLOGY",
    companySize: "SIZE_21_50",
    websiteUrl: null,
    primaryRegion: "Germany",
    primaryLanguage: "en",
    createdAt: "2026-02-11T10:00:00.000Z",
    updatedAt: "2026-02-11T10:00:00.000Z",
    role: "EDITOR",
  },
];

/**
 * Default happy-path handlers so any component that reads the organizations
 * API in a test resolves without wiring its own. Override per-scenario with
 * `server.use(...)` and the error factories.
 */
export const organizationHandlers = [
  http.get(`${base}/organizations`, () => success(organizationMembershipsFixture)),
];
