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

## Testing

Testing stack:

- Jest
- @testing-library/react-native

Prefer testing observable behavior.  
Mock API modules when necessary.

---

## Agent Guidelines

When making changes:

- follow existing feature structure
- preserve current patterns
- make the smallest change necessary
- avoid rewriting unrelated code

If something is unclear, inspect nearby files and follow existing patterns.
