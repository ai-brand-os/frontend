# AGENT.md

# AI Brand OS (Brand Brain)

This file defines the mandatory engineering rules for every AI agent working on this repository.

These rules are not suggestions. They must always be followed unless explicitly overridden by the user.

---

# General Principles

- Always preserve the existing architecture.
- Do not introduce new patterns without approval.
- Prefer consistency over creativity.
- Production-quality code only.
- Do not leave TODOs or placeholder implementations.
- Keep changes as small as possible.
- Do not refactor unrelated code.

---

# Tech Stack

Frontend

- Next.js App Router
- TypeScript (strict mode)
- TanStack React Query v5
- React Hook Form
- Yup
- Axios

Backend

- NestJS
- Prisma
- PostgreSQL

---

# Project Architecture

Always follow the existing feature-based architecture.

Never move files unless requested.

Never create duplicate utilities.

Always reuse existing abstractions.

---

# API Rules

## Never

- Never use fetch().
- Never call axios directly inside React components.
- Never hardcode API URLs.
- Never duplicate API logic.

## Always

Every endpoint must include:

- request types
- response types
- API function
- React Query hook
- query keys
- proper error handling

---

# React Query

Queries

- useQuery()
- useInfiniteQuery() when appropriate

Mutations

- useMutation()

Always:

- use shared query keys
- invalidate queries correctly
- keep cache updates predictable

Do not manually manage loading states that React Query already provides.

---

# Forms

Always use

- React Hook Form
- yup Resolver

Never use uncontrolled forms.

Validation should match backend DTOs whenever possible.

---

# TypeScript

Always

- strict typing
- avoid any
- avoid unknown unless necessary
- infer types where appropriate

Never disable TypeScript errors.

---

# Components

Components should:

- stay small
- be reusable
- contain minimal business logic

Business logic belongs in hooks or services.

---

# State Management

Server state

→ React Query

UI state

→ React state

Do not duplicate server state inside React state.

---

# API Client

All requests must go through the shared API client.

Authentication, interceptors and error handling belong there.

Never recreate axios instances.

---

# Error Handling

Always use the backend error format.

Never swallow errors.

Display user-friendly messages.

Log unexpected errors only where appropriate.

---

# Code Style

Prefer

- early returns
- descriptive naming
- small functions
- immutable patterns

Avoid

- deeply nested code
- duplicated logic
- magic numbers
- unnecessary comments

Write self-explanatory code.

---

# Prisma / Backend

Never edit Prisma schema unless requested.

Never generate migrations unless requested.

Respect existing domain models.

---

# Dependencies

Do not install new packages without approval.

Always reuse existing libraries.

---

# Testing

If modifying existing functionality:

- update related tests
- keep existing tests passing

Do not remove tests unless requested.

---

# Before Finishing

Always verify:

- TypeScript passes
- ESLint passes
- imports are clean
- no unused variables
- no duplicated code
- no dead code

Deliver production-ready code only.
