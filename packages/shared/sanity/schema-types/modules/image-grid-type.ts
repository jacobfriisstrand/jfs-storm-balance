import { defineField, defineType } from "sanity";

export const imageGridType = defineType({
  name: "imageGrid",
  title: "Billede kolonne modul",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "images",
      title: "Billeder",
      type: "array",
      of: [{ type: "imageFieldType" }],
      validation: Rule => Rule.required().min(1).error("Minimum 1 billede er påkrævet"),
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title,
        subtitle: "Billede kolonne modul",
      };
    },
  },
});
