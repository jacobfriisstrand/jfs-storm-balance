import { defineField, defineType } from "sanity";

export const listModuleType = defineType({
  name: "listModule",
  title: "Liste blok",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "image",
      type: "imageFieldType",
    }),
    defineField({
      name: "items",
      title: "Listepunkter",
      type: "array",
      of: [{ type: "object", fields: [{ name: "title", title: "Listepunkt", type: "string" }, { name: "description", title: "Beskrivelse", type: "text" }] }],
      validation: Rule => Rule.required().min(1).error("Minimum 1 listepunkt er påkrævet"),
    }),
  ],
  preview: {
    select: {
      title: "title",
      image: "image",
    },
    prepare({ title, image }) {
      return {
        title,
        subtitle: "Liste blok",
        media: image,
      };
    },
  },
});
