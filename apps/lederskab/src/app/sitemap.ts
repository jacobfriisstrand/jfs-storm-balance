import type { MetadataRoute } from "next";

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
      ? `https://${process.env.VERCEL_URL}`
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
