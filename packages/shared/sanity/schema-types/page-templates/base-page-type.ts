import { defineField, defineType } from "sanity";

// This is the base type for all pages. It is used as a general template for all pages.
// It is not used directly in the CMS, but is used in other page templates / types.

export const basePageType = defineType({
  type: "document",
  name: "basePage",
  title: "Basis-side",
  fields: [
    defineField({
      name: "title",
      title: "Intern titel",
      type: "string",
      validation: rule => rule.required(),
      description: "Dette bruges til at identificere siden i CMS'et og vises ikke på den offentlige side.",
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
      },
      description: "Dette bruges til at generere URL'en for siden og kan genereres ud fra titlen.",
      hidden: ({ document }) => document?._type === "homePage" || document?._type === "notFoundPage",
      validation: rule => rule.custom((slug, context) => {
        if (context.document?._type === "homePage" || context.document?._type === "notFoundPage") {
          return true;
        }
        if (!slug?.current) {
          return "Slug er påkrævet";
        }
        return true;
      }),
    }),
    defineField({
      name: "seo",
      type: "seo",
      title: "SEO",
      validation: rule => rule.required().error("SEO-indhold er påkrævet"),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
    },
  },
});
