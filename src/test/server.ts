import { setupServer } from "msw/node";

import { handlers } from "@/test/mocks/handlers";

/**
 * Node-side MSW server for Vitest. Started once in `src/test/setup.ts` and
 * reset between tests so handlers added with `server.use(...)` in one test
 * never leak into the next.
 */
export const server = setupServer(...handlers);
