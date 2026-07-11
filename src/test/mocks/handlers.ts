import type { HttpHandler } from "msw";

/**
 * Aggregate MSW handlers used by the default test server.
 *
 * No backend exists yet, so this starts empty. Add one file per API domain
 * under `src/test/mocks/handlers/`, export its handlers, and spread them
 * in here (e.g. `...authHandlers`). Individual tests can still layer
 * scenario-specific handlers on top via `server.use(...)`.
 */
export const handlers: HttpHandler[] = [];
