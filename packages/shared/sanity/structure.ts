import type { StructureResolver } from "sanity/structure";

import { PAGE_TYPES } from "@/sanity/constants/page-types";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = S =>
  S.list()
    .title("Menu")
    .items([
      S.divider().title("Sider"),
      S.listItem()
        .id("homePage")
        .schemaType("homePage")
        .title("Forside")
        .child(
          S.editor()
            .id("homePage")
            .schemaType("homePage")
            .documentId("homePage"),
        ),
      // Dynamically add page types from PAGE_TYPES constant
      ...PAGE_TYPES
        .filter(pageType => pageType !== "homePage" && pageType !== "notFoundPage")
        .map((pageType) => {
          // Custom title mapping for specific page types
          const customTitles: Record<string, string> = {
            genericPage: "Alle sider",
            // Add more custom titles here as needed
            // anotherPageType: "Custom Title",
          };

          const title = customTitles[pageType]
            || pageType
              .replace(/([A-Z])/g, " $1") // Add space before capital letters
              .toLowerCase() // Convert to lowercase
              .replace(/^./, str => str.toUpperCase()); // Capitalize first letter only

          return S.documentTypeListItem(pageType).title(title);
        }),
      S.divider().title("Indstillinger"),
      S.listItem()
        .title("Globale indstillinger")
        .icon(() => "🔧")
        .child(
          S.editor()
            .id("globalSettings")
            .schemaType("globalSettings")
            .documentId("globalSettings"),
        ),
      S.listItem()
        .title("Navigation")
        .icon(() => "🔗")
        .child(
          S.editor()
            .id("navigation")
            .schemaType("navigation")
            .title("Navigation")
            .documentId("navigation"),
        ),
      S.listItem()
        .title("Footer")
        .icon(() => "👟")
        .child(
          S.editor()
            .id("footer")
            .schemaType("footer")
            .title("Footer")
            .documentId("footer"),
        ),
      S.listItem()
        .title("Ikke fundet side")
        .icon(() => "🚨")
        .child(
          S.editor()
            .id("notFoundPage")
            .schemaType("notFoundPage")
            .title("Ikke fundet side")
            .documentId("notFoundPage"),
        ),
      S.documentTypeListItem("redirect")
        .title("Omdirigeringer")
        .icon(() => "🔄"),
      ...S.documentTypeListItems().filter(
        item =>
          item.getId()
          && !["globalSettings", "basePage", "homePage", "navigation", "footer", "notFoundPage", "redirect", ...PAGE_TYPES].includes(item.getId()!),
      ),
    ]);
