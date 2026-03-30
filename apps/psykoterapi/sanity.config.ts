"use client";

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/admin/[[...tool]]/page.tsx` route
 */

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works.
import { apiVersion, projectId, siteName } from "@/sanity/env";
import { resolve } from "@/sanity/presentation/resolve";
import { schema } from "@/sanity/schema-types";
import { structure } from "@/sanity/structure";
import { visionTool } from "@sanity/vision";
import { defineConfig, isDev } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

// Shared configuration for newDocumentOptions
const filteredDocumentTypes = [
  "globalSettings", // Singleton
  "homePage", // Singleton
  "navigation", // Singleton
  "notFoundPage", // Singleton
  "basePage", // Base type, not meant to be created directly
  "seo", // Utility type
  "imageField", // Utility type
  "richText", // Utility type
  "redirect", // Utility type
  "navigationLink", // Utility type
];

function getTitle() {
  if (isDev)
    return "Development";
  const siteNameMap: Record<string, string> = {
    "qi-gong": "Storm Balance Qi Gong",
    "psykoterapi": "Storm Balance Psykoterapi",
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
