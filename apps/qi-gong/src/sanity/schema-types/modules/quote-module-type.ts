import { defineField, defineType } from "sanity";

export const quoteModuleType = defineType({
  name: "quoteModule",
  title: "Citat modul",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Titel",
      type: "string",
    }),
    defineField({
      name: "quote",
      title: "Citat",
      type: "richText",
    }),
    defineField({
      name: "author",
      title: "Forfatter",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title,
        subtitle: "Citat modul",
      };
    },
  },
});
