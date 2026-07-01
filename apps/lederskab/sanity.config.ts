"use client";

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
    return "Lederskab development";
  const siteNameMap: Record<string, string> = {
    "qi-gong": "Storm Balance Qi Gong",
    "psykoterapi": "Storm Balance Psykoterapi",
    "lederskab": "Storm Balance Lederskab",
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
