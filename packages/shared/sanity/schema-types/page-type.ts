import { defineField, defineType } from "sanity";

import { apiVersion } from "../env";
import { client } from "../lib/client";

export const studioClient = client.withConfig({ apiVersion });

export const pageType = defineType({
  name: "page",
  title: "Side",
  icon: () => "📄",
  type: "document",
  groups: [
    {
      name: "seo",
      title: "SEO",
      default: true,
      icon: () => "🔍",
    },
    {
      name: "content",
      title: "Sideindhold",
      icon: () => "📄",
    },
  ],
  fields: [
    defineField({
      name: "seo",
      type: "seo",
      title: "SEO",
      group: "seo",
    }),
    defineField({
      name: "title",
      title: "Intern titel",
      type: "string",
      group: "content",
      validation: rule => rule.required(),
      description: "Dette bruges til at identificere siden i CMS'et og vises ikke offentligt.",
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: {
        source: "title",
      },
      description: "Dette bruges til at generere URL'en for siden og kan genereres ud fra titlen. Hvis siden er forsiden, skal dette felt være tomt.",

      validation: Rule =>
        Rule.custom(async (value, context) => {
          const docId = context.document?._id;
          const cleanDocId = docId?.startsWith("drafts.") ? docId.substring(7) : docId;
          const client = context.getClient({ apiVersion });

          const globalSettings = await client.fetch(`*[_type == "globalSettings"][0]`);

          const isHomePage = globalSettings?.homePage?._ref === cleanDocId;

          if (isHomePage) {
            return value ? { message: "Forsiden må ikke have en slug", isError: true } : true;
          }

          return !value ? { message: "Slug er påkrævet for sider, der ikke er forsiden" } : true;
        })
          .info("Dette bruges til at generere URL'en for siden og kan genereres ud fra titlen. Hvis siden er forsiden, skal dette felt være tomt."),
    }),
    defineField({
      name: "content",
      type: "pageBuilder",
      group: "content",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
    },
  },
});
