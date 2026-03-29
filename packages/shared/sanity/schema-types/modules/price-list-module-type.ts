import { defineField, defineType } from "sanity";

export const priceListModuleType = defineType({
  name: "priceListModule",
  title: "Prisliste modul",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Titel",
      type: "string",
    }),
    defineField({
      name: "subtitle",
      title: "Underoverskrift",
      type: "richTextNoImages",
    }),
    defineField({
      name: "columns",
      title: "Priserblokke",
      type: "array",
      of: [{ type: "object", fields: [{ name: "title", title: "Pris overskrift", type: "string" }, { name: "description", title: "Pris beskrivelse", type: "text" }, { name: "priceItems", title: "Pris elementer", type: "array", of: [{ type: "object", fields: [{ name: "title", title: "Pris element overskrift", type: "string" }, { name: "description", title: "Pris / element beskrivelse", type: "string" }] }] }] }],
      validation: Rule => Rule.required().min(1).error("Minimum 1 pris er påkrævet"),
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title,
        subtitle: "Prisliste modul",
      };
    },
  },
});
