# Sanity and Next.js Monorepo

A monorepo containing multiple [Next.js](https://nextjs.org) sites powered by [Sanity.io](https://sanity.io). All sites share a common component library, Sanity schema, and styling — while each app can override or extend anything for site-specific needs.

## Project Structure

```
.
├── packages/
│   └── shared/                  # Shared code used by all apps
│       ├── components/
│       │   ├── core/            # Page builder, image, JSON-LD, draft mode
│       │   ├── modules/         # Page builder modules (hero, footer, etc.)
│       │   └── ui/              # Reusable UI primitives (button, typography, etc.)
│       ├── hooks/               # Shared React hooks
│       ├── contexts/            # Shared React contexts
│       ├── lib/                 # Utilities and helpers
│       ├── sanity/
│       │   ├── schema-types/    # All Sanity schema definitions
│       │   │   ├── modules/     # Module schemas (hero, footer, CTA, etc.)
│       │   │   ├── page-templates/ # Page schemas (home, generic, not-found)
│       │   │   └── utilities/   # Utility schemas (rich text, SEO, links)
│       │   ├── constants/       # Page types, available modules
│       │   ├── lib/             # Sanity client, queries, live preview
│       │   ├── presentation/    # Live preview resolve config
│       │   ├── extract.json     # Generated schema extraction
│       │   └── types.ts         # Generated TypeScript types
│       ├── styles/              # CSS files (globals, colors, spacing, etc.)
│       └── assets/              # Shared SVGs and static assets
├── apps/
│   ├── qi-gong/                 # Qi Gong site
│   └── psykoterapi/             # Psykoterapi site
├── scripts/                     # Shared code generation scripts
└── docs/                        # Deployment and setup guides
```

Each app is a thin shell containing only:
- **Routes** (`src/app/`) — pages, layouts, API routes
- **Config** — `sanity.config.ts`, `next.config.ts`, `.env`
- **Public assets** — favicons, block previews, OG images
- **Optional overrides** — site-specific components or schemas in `src/`

## How It Works

### Path Alias Resolution

The monorepo uses TypeScript path aliases with a fallback pattern. Each app's `tsconfig.json` maps `@/` imports to check the app's local `src/` first, then fall back to the shared package:

```json
"@/components/*": ["./src/components/*", "../../packages/shared/components/*"],
"@/sanity/*":     ["./src/sanity/*",     "../../packages/shared/sanity/*"],
"@/hooks/*":      ["./src/hooks/*",      "../../packages/shared/hooks/*"],
"@/contexts/*":   ["./src/contexts/*",   "../../packages/shared/contexts/*"],
"@/lib/*":        ["./src/lib/*",        "../../packages/shared/lib/*"]
```

This means:
- All shared code uses `@/` imports (e.g., `@/components/ui/button`, `@/sanity/lib/client`)
- If an app has a local file at the same path, it takes precedence over the shared version
- No import changes are needed when overriding — the resolution is automatic

### Shared Assets

Use `@shared/*` to import from the shared package directly:
```tsx
import FooterCorner from "@shared/assets/footer-corner.svg";
import "@shared/styles/globals.css";
```

## Per-App Customization

### Overriding a Shared Component

To customize a component for a specific app, create a file at the same path in the app's `src/` directory:

**Example:** Override the footer for psykoterapi:

```bash
# The shared footer lives at:
#   packages/shared/components/modules/footer.tsx

# Create a site-specific version:
mkdir -p apps/psykoterapi/src/components/modules/
cp packages/shared/components/modules/footer.tsx apps/psykoterapi/src/components/modules/footer.tsx
```

Now edit `apps/psykoterapi/src/components/modules/footer.tsx`. All imports of `@/components/modules/footer` in psykoterapi will resolve to the local version, while qi-gong continues using the shared one.

This works for any shared directory:
- `src/components/*` overrides `packages/shared/components/*`
- `src/hooks/*` overrides `packages/shared/hooks/*`
- `src/contexts/*` overrides `packages/shared/contexts/*`
- `src/lib/*` overrides `packages/shared/lib/*`
- `src/sanity/*` overrides `packages/shared/sanity/*`

### Customizing Sanity Schemas

#### Override an existing shared schema

Same pattern as components — create a file at the same path in the app's `src/sanity/` directory:

```bash
# Override the homepage hero schema for qi-gong:
mkdir -p apps/qi-gong/src/sanity/schema-types/modules/
cp packages/shared/sanity/schema-types/modules/homepage-hero-type.ts \
   apps/qi-gong/src/sanity/schema-types/modules/homepage-hero-type.ts
```

Edit the local copy. Since the app's `tsconfig.json` checks `./src/sanity/*` before `../../packages/shared/sanity/*`, the local schema will be used.

#### Add a site-specific schema type

1. Create the schema file in the app's local sanity directory:

```bash
mkdir -p apps/qi-gong/src/sanity/schema-types/modules/
```

```ts
// apps/qi-gong/src/sanity/schema-types/modules/class-schedule-type.ts
import { defineField, defineType } from "sanity";

export const classScheduleType = defineType({
  name: "classSchedule",
  title: "Class Schedule",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "time", type: "datetime" }),
  ],
});
```

2. Override the schema index to include the new type:

```bash
cp packages/shared/sanity/schema-types/index.ts \
   apps/qi-gong/src/sanity/schema-types/index.ts
```

```ts
// apps/qi-gong/src/sanity/schema-types/index.ts
// Re-export everything from shared, then add site-specific schemas
import { schema as sharedSchema } from "@shared/sanity/schema-types";
import { classScheduleType } from "./modules/class-schedule-type";

export const schema = [...sharedSchema, classScheduleType];
```

3. Register the new type in the page builder or Sanity structure as needed.

#### Add site-specific constants

Override `constants/page-types.ts` or `constants/available-modules.ts` the same way:

```bash
mkdir -p apps/qi-gong/src/sanity/constants/
```

```ts
// apps/qi-gong/src/sanity/constants/available-modules.ts
// Import shared modules and add site-specific ones
import { AVAILABLE_MODULES as SHARED_MODULES } from "@shared/sanity/constants/available-modules";

export const AVAILABLE_MODULES = [
  ...SHARED_MODULES,
  { type: "classSchedule" },
];
```

### Overriding the Sanity Studio Structure

To customize how documents appear in the Sanity Studio sidebar:

```bash
cp packages/shared/sanity/structure.ts apps/qi-gong/src/sanity/structure.ts
```

Edit the local `structure.ts`. The app's `sanity.config.ts` imports `@/sanity/structure` which will resolve to the local version.

## Code Style

- [@antfu/eslint-config](https://github.com/antfu/eslint-config) for strict code formatting and linting
- Kebab-case for filenames (except README.md)
- Double quotes and semicolons
- TypeScript-first with strict type checking
- Automatic import sorting

## Getting Started

### Initial Setup

1. Install dependencies (shared across all apps):
   ```bash
   npm install
   ```

2. Create `.env` files for each app (see [Environment Variables](#environment-variables))

3. Copy Sanity dataset (optional, for initial data):
   ```bash
   cd apps/qi-gong
   sanity dataset export development --output=./dataset-export.tar.gz
   cd ../psykoterapi
   sanity dataset import ./dataset-export.tar.gz development
   ```

### Running Apps

```bash
npm run dev:qi-gong        # Start qi-gong at http://localhost:3000
npm run dev:psykoterapi    # Start psykoterapi at http://localhost:3000
```

Visit `/admin` for the Sanity Studio.

### Quick Setup Script

```bash
cd apps/qi-gong  # or apps/psykoterapi
npm run setup:project
```

## Environment Variables

Each app requires its own `.env` file:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_NAME=qi-gong  # or 'psykoterapi'

# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=development

# Optional
# SANITY_API_VERSION=2025-03-26
```

Each app must have its own Sanity project ID and datasets.

## Available Scripts

### Root Level

| Script | Description |
|--------|-------------|
| `npm run dev:qi-gong` | Start qi-gong dev server |
| `npm run dev:psykoterapi` | Start psykoterapi dev server |
| `npm run build:qi-gong` | Build qi-gong for production |
| `npm run build:psykoterapi` | Build psykoterapi for production |
| `npm run start:qi-gong` | Start qi-gong production server |
| `npm run start:psykoterapi` | Start psykoterapi production server |
| `npm run typegen:qi-gong` | Generate TypeScript types for qi-gong |
| `npm run typegen:psykoterapi` | Generate TypeScript types for psykoterapi |
| `npm run create:module` | Scaffold a new shared module |
| `npm run create:pagetype` | Scaffold a new shared page type |
| `npm run create:app` | Scaffold a new app in the monorepo |
| `npm run lint` | Run ESLint on all apps |
| `npm run lint:fix` | Fix ESLint issues automatically |

### App Level

```bash
cd apps/qi-gong  # or apps/psykoterapi
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run typegen     # Generate TypeScript types
```

## Page Builder Component Previews

Add custom image previews for page builder components:

1. Add a 600×400px PNG screenshot to `apps/<app>/public/block-previews/`
2. Name it to match the schema type (e.g., `hero.png`, `splitImage.png`)
3. Reference in page builder options:
   ```ts
   options: {
     insertMenu: {
       views: [{
         name: "grid",
         previewImageUrl: schemaType => `/block-previews/${schemaType}.png`,
       }],
     },
   }
   ```

## Adding a New App

Run the scaffold script to generate a new app with all the required config and routes:

```bash
npm run create:app
```

You'll be prompted for:
- **App name** — lowercase kebab-case (e.g., `massage-therapy`)
- **Sanity project ID** — from [sanity.io/manage](https://www.sanity.io/manage) (can be added later)

The script creates a fully wired app at `apps/<name>/` with:
- `package.json` with all standard scripts
- `tsconfig.json` with the multi-path fallback aliases
- `next.config.ts` with SVG, image, and monorepo settings
- `sanity.config.ts`, `sanity.cli.ts`, `sanity-typegen.json`
- All route files (pages, layouts, API routes, sitemap)
- `.env` with site name and Sanity config placeholders
- `vercel.json` for deployment

It also automatically:
- Adds `dev:<name>`, `build:<name>`, `start:<name>`, and `typegen:<name>` scripts to the root `package.json`
- Runs `npm install` to register the new workspace

After scaffolding, run `npm run dev:<name>` to start developing.

## Deployment

Each app deploys as a separate Vercel project. See [docs/vercel-deployment-guide.md](docs/vercel-deployment-guide.md) for details.

Key settings per Vercel project:
- **Root Directory**: `apps/qi-gong` or `apps/psykoterapi`
- **Environment Variables**: `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`
