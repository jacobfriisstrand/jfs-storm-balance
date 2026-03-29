import { defineField, defineType } from "sanity";

export const gridModuleType = defineType({
  name: "gridModule",
  title: "Kolonne modul",
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
      type: "string",
    }),
    defineField({
      name: "columns",
      title: "Kolonner",
      type: "array",
      of: [{ type: "object", fields: [{ name: "title", title: "Titel", type: "string" }, { name: "description", title: "Beskrivelse", type: "text" }] }],
      validation: Rule => Rule.required().min(1).error("Minimum 1 kolonne er påkrævet"),
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title,
        subtitle: "Kolonne modul",
      };
    },
  },
});
