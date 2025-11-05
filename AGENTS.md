# Repository Guidelines

## Project Structure & Module Organization
This repository is brand new; follow a predictable layout as you introduce the marketplace codebase. Group application logic under `src/`, domain models under `src/domain/`, reusable UI under `src/components/`, and utility scripts under `scripts/`. Keep automated tests in `tests/` mirroring the `src/` tree. Store static assets (logos, sample data, email templates) in `assets/` and architectural notes in `docs/`. When adding a service (e.g., pricing, booking, operator onboarding), place it in its own module folder with a README that outlines purpose and integration points. Update the root README whenever the structure changes.

## Build, Test, and Development Commands
Expose canonical scripts through `package.json` so contributors share the same workflow:
- `npm install` — install dependencies for the Node/TypeScript toolchain.
- `npm run dev` — start the local development server (Next.js or Express) with hot reload; document required env vars in `.env.example`.
- `npm run lint` — run ESLint + Prettier to enforce formatting before opening a PR.
- `npm test` — execute the unit-test suite; use `npm test -- --watch` while iterating.
If you add build tooling (e.g., Docker, Makefile), keep command names consistent with these scripts and reference them in README and PR descriptions.

## Coding Style & Naming Conventions
Default to TypeScript with strict mode enabled. Use 2-space indentation, single quotes, and trailing commas. Prefer `camelCase` for variables/functions, `PascalCase` for React components and classes, `kebab-case` for file names, and `SNAKE_CASE` for environment variables. Ensure Prettier and ESLint configs live at the repository root, and extend `eslint-config-next` when shipping a Next.js front end. Document any intentional deviations near the code that requires them.

## Testing Guidelines
Adopt Jest (or Vitest if you add Vite) with `ts-jest` or an equivalent transformer. Name test files `*.spec.ts` alongside the implementation. Target ≥80% coverage on new modules and add integration tests whenever APIs, booking flows, or payment logic change. Running `npm test` should succeed on a clean checkout without extra setup; include fixtures or mocks under `tests/fixtures/`.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`) to make the changelog readable. Keep commits focused; each commit should compile and pass tests. PRs must include a summary, screenshots or curl examples for user-facing changes, linked issue numbers, and a checklist of commands run (`npm run lint`, `npm test`). Request review early for large architectural additions and record open questions in the PR description so reviewers can respond efficiently.
