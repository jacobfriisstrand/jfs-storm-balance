/**
 * This file configures the Sanity Presentation tool's document location resolver.
 * It creates dynamic links between Sanity Studio documents and their corresponding front-end locations,
 * enabling live preview functionality in the Presentation tool.
 */

import type { PresentationPluginOptions } from "sanity/presentation";

import { defineLocations } from "sanity/presentation";

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    // Configure locations for different document types
    // Each document type needs its own location configuration to enable live preview

    // Page document type configuration
    page: defineLocations({
      // Select the fields needed to generate the preview URL
      select: {
        title: "title",
        slug: "slug.current",
      },
      // Resolve function generates the preview location for pages
      resolve: doc => ({
        locations: [
          // Individual page preview location
          {
            title: doc?.title || "Untitled",
            href: `/${doc?.slug}`,
          },
        ],
      }),
    }),
  },
};
