import { PAGE_TYPES } from "@/sanity/constants/page-types";
import { defineField, defineType } from "sanity";

export const navigationLinkType = defineType({
  name: "navigationLink",
  type: "object",
  preview: {
    select: {
      title: "label",
      linkType: "linkType",
    },
    prepare({ title, linkType }) {
      return {
        title: title || "Link uden label",
        subtitle: linkType === "internal" ? "Intern link" : linkType === "external" ? "Ekstern link" : "",
      };
    },
  },
  fields: [
    defineField({
      name: "label",
      title: "Etiket",
      description: "Teksten der vises i linket / knappen",
      type: "string",
    }),
    defineField({
      name: "linkType",
      title: "Linktype",
      type: "string",
      options: {
        list: [
          { title: "Intern", value: "internal" },
          { title: "Ekstern", value: "external" },
        ],
      },
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      description: "Indtast en gyldig URL, der starter med https:// (f.eks. https://eksempel.dk)",
      validation: Rule => Rule.custom((value, context) => {
        const parent = context.parent as { linkType?: string };
        if (parent?.linkType === "external" && !value) {
          return "URL er påkrævet for eksterne links";
        }
        return true;
      }),
      hidden: ({ parent }) => parent?.linkType !== "external",
    }),
    defineField({
      name: "page",
      title: "Side",
      type: "reference",
      validation: Rule => Rule.custom((value, context) => {
        const parent = context.parent as { linkType?: string };
        if (parent?.linkType === "internal" && !value) {
          return "Side er påkrævet for interne links";
        }
        return true;
      }),
      to: PAGE_TYPES.map(type => ({ type })),
      hidden: ({ parent }) => parent?.linkType !== "internal",
    }),
  ],
});
