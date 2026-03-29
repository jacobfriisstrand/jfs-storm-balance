# Project Instructions

## Monorepo Structure

This is an npm workspaces monorepo with multiple Next.js apps sharing a common package.

```
apps/           # Next.js apps (one per website)
packages/shared # Shared components, sanity config, styles, hooks, contexts, lib
scripts/        # Monorepo tooling (create-app, create-module, create-page-type)
```

## Key Conventions

- **TypeScript path aliases** use multi-path fallback: `@/components/*` resolves to the app's local `src/components/*` first, then `packages/shared/components/*`. This allows per-app overrides.
- **Shared aliases**: `@shared/*` → `packages/shared/*`, `@public/*` → `./public/*`
- **Per-app theming**: Each app has its own `src/app/styles/globals.css` that `@import`s shared globals plus local `colors.css` and `fonts.css`. Only colors and font families are per-app; sizes, weights, line-heights, tracking, spacing, radii, and animations are shared.
- **Tailwind CSS v4**: Theme tokens use `@theme` blocks in CSS files. All theme files must be in the CSS `@import` chain (not JS imports).
- **Sanity CMS**: Schema types, queries, and lib are in `packages/shared/sanity/`. Each app has its own `sanity.config.ts` and environment variables. The `apiVersion` is defined once in `packages/shared/sanity/env.ts` — always import it, never hardcode.
- **Root tsconfig** is the base config. App tsconfigs use `"extends": "../../tsconfig.json"` and only add paths, plugins, includes.

## Tech Stack

- Next.js 16, React 19, Sanity 4, Tailwind CSS v4
- npm workspaces
- TypeScript (strict mode)
- Framer Motion for animations
- shadcn/ui components (via CVA + Radix)

## Build & Dev

```bash
npm run dev:APP_NAME      # Start dev server for an app
npm run build:APP_NAME    # Build an app
npm run build:all         # Build all apps
npm run type-check        # TypeScript check (all code)
npm run lint              # ESLint check
npm run create:app        # Scaffold a new app
npm run create:module     # Create a new page-builder module
npm run create:pagetype   # Create a new page type
```
