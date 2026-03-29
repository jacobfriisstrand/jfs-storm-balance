import { defineField, defineType } from "sanity";

export const richTextModuleType = defineType({
  name: "richTextModule",
  title: "Tekst modul",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "description",
      type: "richText",
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title,
        subtitle: "Tekst modul",
      };
    },
  },
});
