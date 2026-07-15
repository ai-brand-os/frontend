import type { HttpHandler } from "msw";

import { authHandlers } from "@/test/mocks/handlers/auth";
import { organizationHandlers } from "@/test/mocks/handlers/organizations";

/**
 * Aggregate MSW handlers used by the default test server.
 *
 * One file per API domain under `src/test/mocks/handlers/` exports its
 * handlers; spread them in here. Individual tests can still layer
 * scenario-specific handlers on top via `server.use(...)`.
 */
export const handlers: HttpHandler[] = [...authHandlers, ...organizationHandlers];
