# AGENTS.md

## Project

This repository contains the React Native mobile app for **WeSwapCards**, a platform where users manage card collections, swap cards, and communicate through in-app messaging.

This repo contains the **mobile app only**.  
The backend API lives in a separate repository.

---

## Stack

- React Native
- Expo
- Expo Router
- TypeScript (strict)
- Clerk authentication
- Axios for API requests
- Jest + @testing-library/react-native

---

## TypeScript

TypeScript strict mode is enabled.

Guidelines:

- avoid `any`
- prefer explicit types
- reuse existing types before creating new ones

Path alias:

@/\* → repository root

---

## Repository Structure

The app uses a **feature-based architecture**.

Typical feature structure:

features/<feature>/

- api/
- hooks/
- components/
- types/

Responsibilities:

**api**

- network requests
- request params
- typed responses

**hooks**

- feature state
- side effects
- API coordination

**components**

- UI and interaction
- minimal business logic

**types**

- shared feature types

---

## React Conventions

- functional components
- typed props
- reusable logic in hooks

Component file names use **PascalCase**.

Example:
UserCard.tsx

Hooks use camelCase starting with `use`.
Example:
useDashboard.ts

---

## Separation of Concerns

Keep every unit focused on a single responsibility. **Default to extracting, not
growing a file.** Clean, maintainable structure takes priority over the smallest
possible diff.

- **Components stay presentational.** They render UI and wire callbacks. Keep
  orchestration — API calls, multi-step side effects, navigation, error/loading
  state — out of them.
- **Logic lives in hooks.** Any non-trivial behavior (data fetching, sequenced
  effects, state machines) belongs in a `use*` hook the component consumes. Follow
  existing hooks such as `useNotifications`, `useChatScreen`, `useDeleteAccount`.
- **Extract a new hook** when a component starts owning logic, when logic is reused,
  or to make behavior unit-testable in isolation.
- **Extract a new component** when JSX is reused or a self-contained UI block grows
  large or independent. Don't fragment a shared `StyleSheet` just to split one
  element — keep tightly-related markup with its siblings.
- **One responsibility per file.** When adding a distinct concern to an existing
  component (e.g. a destructive action with its own flow), create a hook/component
  instead of inlining it.
- **Reuse before creating.** Check for an existing hook, component, or util first.
- Place feature code under `features/<feature>/{api,hooks,components,types}` per the
  structure above.

Rule of thumb: if a change adds a new responsibility or non-trivial logic, extract
it rather than inlining. When the right boundary (hook vs component) is genuinely
ambiguous, ask.

---

## Navigation Safety

Routing is defined by **Expo Router** in the `app/` directory.

Do not modify:

- route folder structure
- `_layout.tsx`
- tab structure

unless explicitly instructed.

---

## Authentication Safety

Authentication uses **Clerk**.

Do not modify:

- auth flow
- Clerk configuration
- token handling

unless explicitly requested.

Never hardcode credentials or secrets.

---

## API Contract Safety

The backend API is maintained in a separate repository.

Do not:

- invent API fields
- change request shapes
- assume backend behavior

If a change requires backend support, state the assumption clearly.

---

## Backend (shared with production web)

The backend API lives in a **separate repository** at `html/weswapcards/back`
(`/var/www/html/WeSwapCards/back`).

- **Always check the current branch before pushing.** Backend changes needed for
  the native app must be pushed to the backend's **`native`** branch, not `main`.
- **The backend is shared with the live production web app.** Any change made for
  the native app must **not** affect the web version. Before editing, confirm the
  web uses a different code path (e.g. a different endpoint/mode or function), and
  keep behavior identical for existing callers.

---

## Testing

Testing stack:

- Jest
- @testing-library/react-native

Prefer testing observable behavior.  
Mock API modules when necessary.

**Before committing**, always run all lints and tests for the native front end
and make sure they pass:

- `npm run lint`
- `npm run typecheck`
- `npm run format`
- `npm test`

---

## Agent Guidelines

When making changes:

- follow existing feature structure
- preserve current patterns
- make the smallest change necessary
- avoid rewriting unrelated code

If something is unclear, inspect nearby files and follow existing patterns.
