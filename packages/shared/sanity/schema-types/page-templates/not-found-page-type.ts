import { defineField, defineType } from "sanity";

import { basePageType } from "./base-page-type";

export const notFoundPageType = defineType({
  name: "notFoundPage",
  title: "Ikke fundet side",
  type: "document",
  icon: () => "📄",
  fields: [
    ...basePageType.fields,
    defineField({
      name: "heading",
      title: "Overskrift",
      type: "string",
    }),
    defineField({
      name: "subheading",
      title: "Underoverskrift",
      type: "text",
    }),
  ],
  preview: basePageType.preview,
});
