import { defineField, defineType } from "sanity";

export const footerType = defineType({
  name: "footer",
  type: "document",
  title: "Footer",
  icon: () => "�",
  preview: {
    select: {},
    prepare() {
      return {
        title: "Footer",
      };
    },
  },
  fields: [
    defineField({
      name: "menu",
      title: "Footer menu",
      description: "Links til footermenuen.",
      type: "array",
      of: [{ type: "navigationLink" }],
      validation: Rule => Rule.required().min(1).error("Min 1 link er påkrævet"),
    }),
  ],
});
