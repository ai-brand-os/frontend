# Testing

This project uses **Vitest**, **React Testing Library**, **@testing-library/user-event**,
and **MSW** to test observable behavior — what a user sees and can do — rather than
component internals.

## Stack and why

| Tool | Role | Why this one |
|---|---|---|
| Vitest | Test runner | Native ESM/TS, Vite-speed watch mode, Jest-compatible API, drop-in with the Next.js Vitest guide (`node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`) |
| React Testing Library | Rendering + queries | Queries by role/label/text — the same things a user or screen reader sees, not component internals |
| @testing-library/user-event | Interaction simulation | Fires real event sequences (focus, keydown, input, blur) instead of a single synthetic `fireEvent`, so form/keyboard behavior is exercised realistically |
| MSW | API mocking | Intercepts at the network layer, so components/hooks call real `fetch`/React Query code — nothing about `fetch` or `axios` itself is mocked |
| jsdom | DOM environment | Chosen over happy-dom: this app's UI primitives (`@base-ui/react`) and React 19 need broad DOM API coverage (layout, `ResizeObserver`-dependent positioning, focus management) that jsdom implements more completely. happy-dom is faster but has known gaps with exactly this class of component library |
| @vitest/coverage-v8 | Coverage | No instrumentation step, accurate line/branch numbers straight from V8 |

No Enzyme, no shallow rendering, no snapshot-heavy testing.

## Folder structure

```
src/
  test/                        # shared test infrastructure (not feature code)
    setup.ts                   # global hooks: MSW server lifecycle, jsdom polyfills, mock resets
    server.ts                  # msw/node setupServer, wired to test/mocks/handlers
    render.tsx                 # renderWithProviders(), createTestQueryClient()
    factories/                 # functions that build *input* data, overridable per test
    fixtures/                  # static, realistic data (e.g. real en.json copy)
    mocks/
      handlers.ts               # aggregate MSW handler list consumed by server.ts
      response-factories.ts     # success/validationError/serverError/unauthorized/networkError helpers
      next-navigation.ts        # global next/navigation mock (useRouter/usePathname/...)
    utils/
      router.ts                 # mockRouter() — override router behavior per test
      observers.ts               # mockIntersectionObserver/mockResizeObserver/mockMatchMedia
      storage.ts                  # mockLocalStorage/mockSessionStorage
      clipboard.ts                # mockClipboard
      file-upload.ts              # createTestFile/mockFileUpload

  components/
    auth/
      authForm.tsx
      useAuthForm.ts
      __tests__/
        authForm.test.tsx        # integration: renders the connected component, real user interaction
        useAuthForm.test.ts      # hook-level: validation rules, submit behavior
    ui/
      form/
        form-input.tsx
        __tests__/form-input.test.tsx
```

Tests live next to the code they cover, in a `__tests__/` folder — matching this repo's
existing convention (no `features/` directory exists here, so the architecture wasn't
forced onto one; it follows the `components/`, `lib/`, `i18n/` layout that's already in place).

## Naming conventions

- Test files: `<subject>.test.ts` / `.test.tsx`, colocated in `__tests__/` beside the subject.
- `describe` block name = the unit under test (component, hook, or function name).
- `it`/`test` names describe **behavior**, phrased so the sentence reads naturally after
  the subject: `it("rejects an invalid email format")`, not `it("test 1")` or
  `it("should validate")`.

## What to test vs. not

Test (all covered somewhere in this suite):

- Validation rules (`useAuthForm.test.ts`)
- Submission success/failure and navigation side effects (`useAuthForm.test.ts`, `authForm.test.tsx`)
- Error rendering and `aria-invalid` (`form-input.test.tsx`, `authForm.test.tsx`)
- Disabled/loading state during submit (`submit-button.test.tsx`)
- Pure utilities and business logic (`utils.test.ts`, `config.test.ts`, `dictionaries.test.ts`, `proxy.test.ts`)
- Reusable components' observable behavior (`badge.test.tsx`, `card.test.tsx`, `button.test.tsx`)
- Accessibility, implicitly: every query in this suite is `getByRole`/`getByLabelText`/`getByText` —
  if a query fails, it usually means the markup lost its accessible name or role, which is the
  same thing a screen reader user would hit.

Do **not** test:

- React internal state (`useState` values) — assert on the rendered DOM instead.
- react-hook-form/yup/@tanstack/react-query internals — trust the library, test how *this app*
  configures and uses it.
- Class names / Tailwind output — `Badge`'s test checks that a custom `className` is merged in,
  not what the resulting string is.
- Anything in an `async` Server Component (`app/**/page.tsx`, `layout.tsx`) — Vitest can't render
  these (see the Next.js Vitest guide's note on this); they're excluded from coverage and are a
  target for E2E tests instead (Playwright/Cypress can plug in here later; MSW handlers under
  `src/test/mocks/` are reusable there too via `msw/browser`).

## Running tests

```bash
npm test              # single run (CI mode)
npm run test:watch    # watch mode
npm run test:coverage # single run + coverage report (text + HTML in coverage/index.html)
npm run test:ui       # Vitest's browser UI
npm run test:changed  # only files affected by uncommitted/unpushed changes
```

`vitest.config.mts` sets `environment: "jsdom"`, `globals: true` (so `describe`/`it`/`expect`
don't need importing), and `restoreMocks: true` (every `vi.fn()`/spy is reset between tests
automatically — you don't need to remember to do it).

## Writing a component test

Use `renderWithProviders` from `@/test/render` (not `@testing-library/react`'s `render`
directly) whenever the component sits under a provider boundary — today that means
React Query; extend `createWrapper` in `render.tsx` if more app-wide providers are added.
Plain `render` (re-exported from the same module) is fine for components with no provider
dependency.

```tsx
import userEvent from "@testing-library/user-event";
import { AuthForm } from "@/components/auth/authForm";
import { renderWithProviders, screen } from "@/test/render";
import { authMessagesFixture } from "@/test/fixtures/messages.fixture";
import { router } from "@/test/utils/router";

it("submits successfully and navigates home with valid input", async () => {
  const user = userEvent.setup();
  renderWithProviders(
    <AuthForm mode="signin" locale="en" messages={authMessagesFixture} />,
  );

  await user.type(screen.getByLabelText(authMessagesFixture.fields.email), "founder@acme.dev");
  await user.type(screen.getByLabelText(authMessagesFixture.fields.password), "correct-horse-battery-staple");
  await user.click(screen.getByRole("button", { name: authMessagesFixture.signin.cta }));

  expect(router.push).toHaveBeenCalledWith("/en");
});
```

Query priority (matches Testing Library's own guidance): `getByRole` > `getByLabelText` >
`getByText` > `getByTestId` (avoid `getByTestId` unless nothing else identifies the element —
none of this suite needs it).

`next/navigation` is mocked globally from `setup.ts` (see `src/test/mocks/next-navigation.ts`).
Import `router` from `@/test/utils/router` to assert calls or override behavior per test —
you never need to write your own `vi.mock('next/navigation', ...)` in a test file.

## Writing a hook test

Use `renderHook`/`act` from `@testing-library/react`. One react-hook-form gotcha to know:
**`formState` is a Proxy that only starts updating a field once something reads it during
render.** In the real app that read happens inside `AppForm`/`FormInput`. A hook-only test
that never renders those has to do the same read itself, or `formState.errors` stays frozen
at `{}` even after a failed submit:

```ts
function setup(mode: "signin" | "signup" = "signin") {
  return renderHook(() => {
    const result = useAuthForm({ mode, locale: "en", messages: authMessagesFixture });
    void result.form.formState.errors; // primes RHF's proxy tracking — see useAuthForm.test.ts
    return result;
  });
}
```

Async submits need `await act(async () => { await result.current.onSubmit(); })` so React
flushes the resulting state update before assertions run.

## Writing an API/MSW test

No backend exists yet, so `src/test/mocks/handlers.ts` starts empty. When an API lands:

1. Add `src/test/mocks/handlers/<domain>.ts` exporting an array of `http.get/post(...)` handlers.
2. Spread it into `handlers` in `src/test/mocks/handlers.ts`.
3. Use the response builders in `src/test/mocks/response-factories.ts` instead of hand-rolling
   `Response` objects, so every handler covers the same shapes consistently:

```ts
import { http } from "msw";
import { success, validationError, serverError, unauthorizedError, networkError } from "@/test/mocks/response-factories";

export const authHandlers = [
  http.post("/api/auth/signin", () => success({ token: "test-token" })),
];
```

4. Override per-test with `server.use(...)` (imported from `@/test/server`) for a one-off
   scenario — a validation error, a 500, a dropped connection — without touching the default
   handler used by every other test:

```ts
import { http } from "msw";
import { server } from "@/test/server";
import { serverError } from "@/test/mocks/response-factories";

it("shows an error message when the server fails", async () => {
  server.use(http.post("/api/auth/signin", () => serverError()));
  // render, submit, assert the error state
});
```

`onUnhandledRequest: "error"` (set in `setup.ts`) means a request nobody mocked fails the test
loudly instead of silently hitting the network — no request goes unaccounted for.

## Data: factories vs. fixtures

- **`fixtures/`** — static, realistic data that shouldn't change per test. `messages.fixture.ts`
  re-exports the real `en.json` copy, so assertions like
  `screen.getByText(authMessagesFixture.signin.cta)` check against what a user actually sees,
  not a synthetic string that can drift from the real copy.
- **`factories/`** — functions that build data a test *varies*, e.g. form input:

  ```ts
  buildAuthFormValues({ email: "" }); // only override what this scenario cares about
  ```

  Prefer factories over hardcoding full objects inline in every test — they keep tests
  readable (only the relevant field is visible) and resilient to the shape gaining new
  required fields later.

## Browser API mocks

jsdom doesn't implement several browser APIs. Helpers in `src/test/utils/` stub them:

| Helper | Use when a component needs |
|---|---|
| `mockIntersectionObserver()` | lazy loading / visibility tracking |
| `mockResizeObserver()` | layout measurement (also stubbed globally in `setup.ts` for base-ui) |
| `mockMatchMedia()` | `prefers-color-scheme` / responsive JS (also stubbed globally) |
| `mockLocalStorage()` / `mockSessionStorage()` | spy-able storage, e.g. asserting `theme-toggle.test.tsx`'s `localStorage.setItem` call |
| `mockClipboard()` | copy-to-clipboard actions |
| `createTestFile()` / `mockFileUpload()` | `<input type="file">` flows |
| `mockRouter()` | overriding `next/navigation`'s router for a single test |

`vi.stubGlobal` mocks are torn down automatically after every test (`vi.unstubAllGlobals()` in
`setup.ts`'s global `afterEach`) — call the helper again in a `beforeEach` if a whole file needs it.

## Coverage

`npm run test:coverage` runs with the V8 provider and writes `text`, `html` (open
`coverage/index.html`), and `lcov` reporters. Thresholds (`vitest.config.mts`): 70%
statements/functions/lines, 65% branches — enforced project-wide, not per file.

Excluded from coverage: `*.d.ts`, `*.config.*`, `src/test/**`, test files themselves,
barrel `index.ts` files, `src/messages/**` (JSON copy), and async Server Component
pages/layouts under `src/app/**` (untestable with Vitest — see above).

## Adding a new test

1. Put it in `__tests__/` next to the file it covers, named `<subject>.test.ts(x)`.
2. Reach for `@/test/render` (not raw `@testing-library/react`) for anything under a provider.
3. Reach for `@/test/fixtures` and `@/test/factories` before inlining literal test data.
4. If the component/hook calls an API, add or extend a handler under
   `@/test/mocks/handlers.ts` rather than mocking `fetch` directly.
5. Assert through the DOM/return value a user or caller would see — not through internal
   state, refs, or spying on library internals.
