#!/usr/bin/env tsx

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";

const WORKSPACE_ROOT = process.cwd();

function readLines(): Promise<string[]> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const lines: string[] = [];
    const questions = [
      "App name (kebab-case, e.g. 'my-new-site'): ",
      "Sanity project ID (leave empty to configure later): ",
    ];
    let i = 0;

    function askNext() {
      if (i >= questions.length) {
        rl.close();
        resolve(lines);
        return;
      }
      rl.question(questions[i], (answer) => {
        lines.push(answer.trim());
        i++;
        askNext();
      });
    }

    askNext();
  });
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function writeFile(filePath: string, content: string) {
  const dir = join(filePath, "..");
  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, content);
  console.warn(`  Created ${filePath.replace(`${WORKSPACE_ROOT}/`, "")}`);
}

async function main() {
  console.warn("\n🏗️  Create a new app in the monorepo\n");

  const [rawName, sanityProjectId] = await readLines();
  const name = toKebabCase(rawName);

  if (!name) {
    console.error("Error: App name is required.");
    process.exit(1);
  }

  const appDir = join(WORKSPACE_ROOT, "apps", name);

  if (existsSync(appDir)) {
    console.error(`Error: apps/${name} already exists.`);
    process.exit(1);
  }

  const sanityProjectIdVal = sanityProjectId || "";

  console.warn(`\nScaffolding apps/${name}...\n`);

  // --- package.json ---
  writeFile(join(appDir, "package.json"), JSON.stringify({
    name,
    version: "0.1.0",
    private: true,
    scripts: {
      "dev": "next dev --turbopack",
      "build": "next build",
      "start": "next start",
      "lint": "eslint .",
      "lint:fix": "eslint --fix .",
      "predev": "npm run typegen",
      "prebuild": "npm run typegen",
      "typegen": "sanity schema extract --workspace=development --path=../../packages/shared/sanity/extract.json && sanity typegen generate",
    },
  }, null, 2));

  // --- tsconfig.json ---
  writeFile(join(appDir, "tsconfig.json"), JSON.stringify({
    extends: "../../tsconfig.json",
    compilerOptions: {
      paths: {
        "@/components/*": ["./src/components/*", "../../packages/shared/components/*"],
        "@/hooks/*": ["./src/hooks/*", "../../packages/shared/hooks/*"],
        "@/contexts/*": ["./src/contexts/*", "../../packages/shared/contexts/*"],
        "@/lib/*": ["./src/lib/*", "../../packages/shared/lib/*"],
        "@/sanity/*": ["./src/sanity/*", "../../packages/shared/sanity/*"],
        "@/*": ["./src/*"],
        "@shared/*": ["../../packages/shared/*"],
        "@public/*": ["./public/*"],
      },
      plugins: [{ name: "next" }],
    },
    include: [
      "next-env.d.ts",
      "**/*.ts",
      "**/*.tsx",
      ".next/types/**/*.ts",
      ".next/dev/types/**/*.ts",
      "../../packages/shared/**/*.ts",
      "../../packages/shared/**/*.tsx",
    ],
    exclude: ["node_modules"],
  }, null, 2));

  // --- next.config.ts ---
  writeFile(join(appDir, "next.config.ts"), `import type { NextConfig } from "next";

import { fetchRedirects } from "@/sanity/lib/fetch-redirects";
import { resolve } from "node:path";

const workspaceRoot = resolve(__dirname, "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.(".svg"),
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: ["@svgr/webpack"],
      },
    );

    fileLoaderRule.exclude = /\\.svg$/i;

    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
    qualities: [100, 75, 80],
  },

  devIndicators: false,

  async redirects() {
    return await fetchRedirects();
  },

  turbopack: {
    root: workspaceRoot,
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.ts",
      },
    },
  },
};

export default nextConfig;
`);

  // --- sanity.config.ts ---
  writeFile(join(appDir, "sanity.config.ts"), `"use client";

import { apiVersion, projectId, siteName } from "@/sanity/env";
import { resolve } from "@/sanity/presentation/resolve";
import { schema } from "@/sanity/schema-types";
import { structure } from "@/sanity/structure";
import { visionTool } from "@sanity/vision";
import { defineConfig, isDev } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

const filteredDocumentTypes = [
  "globalSettings",
  "homePage",
  "navigation",
  "notFoundPage",
  "basePage",
  "seo",
  "imageField",
  "richText",
  "redirect",
  "navigationLink",
];

function getTitle() {
  if (isDev)
    return "Development";
  const siteNameMap: Record<string, string> = {
    "${name}": "${rawName}",
  };
  return siteNameMap[siteName] || siteName;
}

export default defineConfig({
  name: "default",
  title: getTitle(),
  basePath: "/admin",
  projectId,
  dataset: isDev ? "development" : "production",
  plugins: [
    structureTool({ structure }),
    ...(isDev ? [visionTool({ defaultApiVersion: apiVersion })] : []),
    presentationTool({
      resolve,
      previewUrl: {
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
  ],
  schema: {
    types: schema,
  },
  document: {
    newDocumentOptions: prev => prev.filter(item => !filteredDocumentTypes.includes(item.templateId)),
  },
});
`);

  // --- sanity.cli.ts ---
  writeFile(join(appDir, "sanity.cli.ts"), `import { defineCliConfig } from "sanity/cli";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

export default defineCliConfig({ api: { projectId, dataset } });
`);

  // --- sanity-typegen.json ---
  writeFile(join(appDir, "sanity-typegen.json"), JSON.stringify({
    path: [
      "./src/**/*.{ts,tsx,js,jsx}",
      "../../packages/shared/**/*.{ts,tsx,js,jsx}",
    ],
    schema: "../../packages/shared/sanity/extract.json",
    generates: "../../packages/shared/sanity/types.ts",
  }, null, 2));

  // --- vercel.json ---
  writeFile(join(appDir, "vercel.json"), JSON.stringify({
    installCommand: "cd ../.. && npm ci",
    buildCommand: "npm run build",
    framework: "nextjs",
  }, null, 2));

  // --- .gitignore ---
  writeFile(join(appDir, ".gitignore"), `.vercel
`);

  // --- .env ---
  writeFile(join(appDir, ".env"), `NEXT_PUBLIC_SITE_NAME="${name}"

NEXT_PUBLIC_SANITY_PROJECT_ID="${sanityProjectIdVal}"

# PRODUCTION DATASET
# NEXT_PUBLIC_SANITY_DATASET="production"

# DEVELOPMENT DATASET
NEXT_PUBLIC_SANITY_DATASET="development"

NEXT_PUBLIC_SANITY_API_READ_TOKEN=
`);

  // --- next-env.d.ts ---
  writeFile(join(appDir, "next-env.d.ts"), `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
`);

  // --- src/app/layout.tsx ---
  writeFile(join(appDir, "src/app/layout.tsx"), `import "./styles/globals.css";

import type { Metadata } from "next";

import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { groq } from "next-sanity";

async function getFavicon() {
  const globalSettings = await client.fetch(
    groq\`*[_type == "globalSettings"][0]{
      favicon
    }\`,
  );

  if (!globalSettings?.favicon) {
    return null;
  }

  return urlFor(globalSettings.favicon)
    .width(32)
    .height(32)
    .format("png")
    .url();
}

export async function generateMetadata(): Promise<Metadata> {
  const faviconUrl = await getFavicon();

  return {
    icons: faviconUrl
      ? {
          icon: faviconUrl,
          shortcut: faviconUrl,
          apple: faviconUrl,
        }
      : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background grid min-h-dvh grid-rows-[auto_1fr_auto]">
        {children}
      </body>
    </html>
  );
}
`);

  // --- src/app/(frontend)/layout.tsx ---
  writeFile(join(appDir, "src/app/(frontend)/layout.tsx"), `import { DisableDraftMode } from "@/components/core/disable-draft-mode";
import Footer from "@/components/modules/footer";
import Navigation from "@/components/modules/navigation";
import { TouchProvider } from "@/contexts/touch-context";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { CONTACT_BUTTONS_QUERY, FOOTER_INFO_QUERY, FOOTER_QUERY, LOGO_QUERY, NAVIGATION_QUERY } from "@/sanity/lib/queries";
import { VisualEditing } from "next-sanity/visual-editing";
import { draftMode } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: navigationData } = await sanityFetch({
    query: NAVIGATION_QUERY,
  });

  const { data: logoData } = await sanityFetch<typeof LOGO_QUERY>({ query: LOGO_QUERY });

  const { data: contactButtonsData } = await sanityFetch<typeof CONTACT_BUTTONS_QUERY>({ query: CONTACT_BUTTONS_QUERY });

  const { data: footerData } = await sanityFetch<typeof FOOTER_QUERY>({ query: FOOTER_QUERY });

  const { data: footerInfoData } = await sanityFetch<typeof FOOTER_INFO_QUERY>({ query: FOOTER_INFO_QUERY });

  return (
    <TouchProvider>
        <Navigation navigationData={navigationData} logoData={logoData} contactButtonsData={contactButtonsData} />
        {children}
        <Footer footerData={footerData} footerInfoData={footerInfoData} />
        <SanityLive />
        {(await draftMode()).isEnabled && (
          <>
            <DisableDraftMode />
            <VisualEditing />
          </>
        )}
    </TouchProvider>
  );
}
`);

  // --- src/app/(frontend)/page.tsx ---
  writeFile(join(appDir, "src/app/(frontend)/page.tsx"), `import type { Metadata } from "next";

import { PageBuilderWrapper } from "@/components/core/page-builder-wrapper";
import { PAGE_TYPES } from "@/sanity/constants/page-types";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

async function getPage(params: RouteProps["params"]) {
  return sanityFetch({
    query: HOME_PAGE_QUERY,
    params: await params,
  });
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { data: page } = await getPage(params);

  if (!page) {
    return {};
  }

  const metadata: Metadata = {
    title: page?.seo.title,
    description: page?.seo.description,
  };

  if (page?.seo.image && page?.seo.image.asset?._ref) {
    metadata.openGraph = {
      images: {
        url: urlFor(page.seo.image).width(1200).height(630).url(),
        width: 1200,
        height: 630,
      },
    };
  }

  if (page?.seo.noIndex) {
    metadata.robots = "noindex";
  }

  return metadata;
}

export default async function Page({ params }: RouteProps) {
  const { data: page } = await getPage(params);

  return (
    <>
      <title>{page?.seo?.title}</title>
      {page?.pageBuilder
        ? (
            <PageBuilderWrapper modules={page.pageBuilder} documentId={page._id} documentType={PAGE_TYPES[0]} />
          )
        : null}
    </>
  );
}
`);

  // --- src/app/(frontend)/not-found.tsx ---
  writeFile(join(appDir, "src/app/(frontend)/not-found.tsx"), `import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading, Paragraph } from "@/components/ui/typography";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import { NOT_FOUND_PAGE_QUERY } from "@/sanity/lib/queries";

async function getPage() {
  return sanityFetch({
    query: NOT_FOUND_PAGE_QUERY,
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const { data: page } = await getPage();

  if (!page) {
    return {};
  }

  const metadata: Metadata = {
    title: page.seo.title,
    description: page.seo.description,
  };

  if (page.seo.image && page.seo.image.asset?._ref) {
    metadata.openGraph = {
      images: {
        url: urlFor(page.seo.image).width(1200).height(630).url(),
        width: 1200,
        height: 630,
      },
    };
  }

  if (page.seo.noIndex) {
    metadata.robots = "noindex";
  }

  return metadata;
}

export default async function NotFound() {
  const { data: page } = await getPage();

  return (
    <main className="mt-(--navigation-height-mobile) tablet:mt-(--navigation-height-desktop) flex items-center justify-center h-[calc(100svh-var(--navigation-height-mobile))] tablet:h-[calc(100svh-var(--navigation-height-desktop))]">
      <Container>
        <Grid className="gap-y-20">
          <GridItem>
            <Heading size="h1" as="h1" colorScheme="dark">{page?.heading}</Heading>
          </GridItem>
          <GridItem>
            <Paragraph size="default" colorScheme="dark">{page?.subheading}</Paragraph>
          </GridItem>
        </Grid>
      </Container>
    </main>
  );
}
`);

  // --- src/app/(frontend)/[slug]/page.tsx ---
  writeFile(join(appDir, "src/app/(frontend)/[slug]/page.tsx"), `import type { Metadata } from "next";

import { PageBuilderWrapper } from "@/components/core/page-builder-wrapper";
import { PAGE_TYPES } from "@/sanity/constants/page-types";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

async function getPage(params: RouteProps["params"]) {
  const resolvedParams = await params;

  return sanityFetch({
    query: PAGE_QUERY,
    params: {
      slug: resolvedParams.slug,
      pageTypes: PAGE_TYPES,
    },
  });
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { data: page } = await getPage(params);

  if (!page) {
    return {};
  }

  const metadata: Metadata = {
    title: page.seo.title,
    description: page.seo.description,
  };

  if (page.seo.image && page.seo.image.asset?._ref) {
    metadata.openGraph = {
      images: {
        url: urlFor(page.seo.image).width(1200).height(630).url(),
        width: 1200,
        height: 630,
      },
    };
  }

  if (page.seo.noIndex) {
    metadata.robots = "noindex";
  }

  return metadata;
}

export default async function Page({ params }: RouteProps) {
  const { data: page } = await getPage(params);

  if (!page) {
    notFound();
  }

  return (
    <>
      <title>{page.seo.title}</title>
      {page.pageBuilder ? <PageBuilderWrapper modules={page.pageBuilder} documentId={page._id} documentType={PAGE_TYPES[0]} /> : null}
    </>
  );
}
`);

  // --- src/app/admin/[[...tool]]/page.tsx ---
  writeFile(join(appDir, "src/app/admin/[[...tool]]/page.tsx"), `import { NextStudio } from "next-sanity/studio";

import config from "../../../../sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
`);

  // --- src/app/api/draft-mode/disable/route.ts ---
  writeFile(join(appDir, "src/app/api/draft-mode/disable/route.ts"), `import type { NextRequest } from "next/server";

import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  return NextResponse.redirect(new URL("/", request.url));
}
`);

  // --- src/app/api/draft-mode/enable/route.ts ---
  writeFile(join(appDir, "src/app/api/draft-mode/enable/route.ts"), `import { client } from "@/sanity/lib/client";
import { token } from "@/sanity/lib/token";
import { defineEnableDraftMode } from "next-sanity/draft-mode";

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token }),
});
`);

  // --- src/app/api/og/route.tsx ---
  writeFile(join(appDir, "src/app/api/og/route.tsx"), `import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { OG_IMAGE_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

export const runtime = "edge";

async function loadGoogleFont(font: string, text: string) {
  const url = \`https://fonts.googleapis.com/css2?family=\${font}&text=\${encodeURIComponent(text)}\`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\\((.+)\\) format\\('(opentype|truetype)'\\)/,
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    notFound();
  }

  const data = await client.fetch(OG_IMAGE_QUERY, { id });

  if (!data) {
    notFound();
  }

  const vibrantBackground
    = data?.image?.asset?.metadata?.palette?.vibrant?.background ?? "#515750";
  const darkVibrantBackground
    = data?.image?.asset?.metadata?.palette?.darkVibrant?.background ?? "#515750";

  const text = data.title || "";
  const hasImage = data?.image?.asset?.url;

  return new ImageResponse(
    (
      <div
        tw="flex w-full h-full relative"
        style={{
          background: \`linear-gradient(135deg, \${vibrantBackground} 0%, \${darkVibrantBackground} 100%)\`,
        }}
      >
        <div tw="flex flex-row w-full h-full relative">
          <div tw="flex-1 flex items-center px-10">
            <h1 tw="text-7xl tracking-tight leading-none text-white leading-tight">
              {text}
            </h1>
          </div>
          {hasImage && (
            <div tw="flex w-[500px] h-[630px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.image ? urlFor(data.image).width(500).height(630).url() : ""}
                alt=""
                tw="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: await loadGoogleFont("Inter", text),
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
`);

  // --- src/app/sitemap.ts ---
  writeFile(join(appDir, "src/app/sitemap.ts"), `import type { MetadataRoute } from "next";

import { PAGE_TYPES } from "@/sanity/constants/page-types";
import { client } from "@/sanity/lib/client";
import { SITEMAP_QUERY } from "@/sanity/lib/queries";

type SitemapPath = {
  href: string;
  _updatedAt: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const paths = await client.fetch<SitemapPath[]>(SITEMAP_QUERY, {
      pageTypes: PAGE_TYPES,
    });

    if (!paths)
      return [];

    const baseUrl = process.env.VERCEL
      ? \`https://\${process.env.VERCEL_URL}\`
      : "http://localhost:3000";

    const sitemapEntries: MetadataRoute.Sitemap = [
      {
        url: new URL("/", baseUrl).toString(),
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 1,
      },
      ...paths.map(path => ({
        url: new URL(path.href, baseUrl).toString(),
        lastModified: new Date(path._updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];

    return sitemapEntries;
  }
  catch (error) {
    console.error("Failed to generate sitemap:", error);
    return [];
  }
}
`);

  // --- public directories ---
  mkdirSync(join(appDir, "public/assets"), { recursive: true });
  mkdirSync(join(appDir, "public/block-previews"), { recursive: true });
  writeFile(join(appDir, "public/.gitkeep"), "");

  // --- src/app/styles/globals.css ---
  writeFile(join(appDir, "src/app/styles/globals.css"), `@import "../../../../../packages/shared/styles/globals.css";
@import "./colors.css";
@import "./fonts.css";
`);

  // --- src/app/styles/colors.css ---
  writeFile(join(appDir, "src/app/styles/colors.css"), `@theme inline {
  --color-*: initial;

  --color-dark: #000000;
  --color-light: #ffffff;
  --color-brand: #515750;

  --color-background: var(--color-light);
}
`);

  // --- src/app/styles/fonts.css ---
  writeFile(join(appDir, "src/app/styles/fonts.css"), `@theme {
  --font-*: initial;

  --font-sans: Avenir, Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif;
  --font-serif: Optima, Candara, "Noto Sans", source-sans-pro, sans-serif;
}
`);

  // --- Done ---
  console.warn(`\n✅ App scaffolded at apps/${name}\n`);

  // --- Update root package.json scripts ---
  console.warn("Updating root package.json scripts...");
  const rootPkgPath = join(WORKSPACE_ROOT, "package.json");
  const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf-8"));
  rootPkg.scripts[`dev:${name}`] = `npm run dev --workspace=apps/${name}`;
  rootPkg.scripts[`build:${name}`] = `npm run build --workspace=apps/${name}`;
  rootPkg.scripts[`start:${name}`] = `npm run start --workspace=apps/${name}`;
  rootPkg.scripts[`typegen:${name}`] = `npm run typegen --workspace=apps/${name}`;
  writeFileSync(rootPkgPath, `${JSON.stringify(rootPkg, null, 2)}\n`);
  console.warn("  Updated root package.json with dev/build/start/typegen scripts.");

  // --- Run npm install ---
  console.warn("\nRunning npm install...");
  execSync("npm install", { cwd: WORKSPACE_ROOT, stdio: "inherit" });

  console.warn(`\n✅ Done! Run 'npm run dev:${name}' to start developing.`);
  console.warn(`\n  Tip: Update the siteNameMap in apps/${name}/sanity.config.ts with your site title.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
