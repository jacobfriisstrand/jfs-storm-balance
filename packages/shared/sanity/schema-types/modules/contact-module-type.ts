import { defineField, defineType } from "sanity";

export const contactModuleType = defineType({
  name: "contactModule",
  title: "Kontakt modul",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Titel",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Beskrivelse",
      type: "richTextNoImages",
    }),
    defineField({
      name: "showContactButton",
      title: "Vis kontakt knap",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "contactButtonText",
      title: "Kontakt knap tekst",
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
        subtitle: "Kontakt modul",
      };
    },
  },
});
