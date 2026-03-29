import { defineField, defineType } from "sanity";

export const navigationType = defineType({
  name: "navigation",
  type: "document",
  title: "Navigation",
  icon: () => "🔗",
  preview: {
    select: {
      title: "title",
    },
    prepare() {
      return {
        title: "Navigation",
      };
    },
  },
  fields: [
    defineField({
      name: "logoText",
      title: "Logo tekst",
      description: "Teksten der vises ved siden af logoet på større desktop skærme. Vises ikke på tablets eller mobiler.",
      type: "string",
    }),
    defineField({
      name: "menu",
      description: "Links til navigationslinjen.",
      type: "array",
      of: [{ type: "navigationLink" }],
      validation: Rule => Rule.required().max(6).error("Max 6 links er tilladt"),
    }),
    defineField({
      name: "contactButtonText",
      title: "Kontakt knap tekst",
      description: "Knaptekst til kontakt i menuen.",
      type: "string",
      validation: Rule => Rule.required().error("Dette felt er påkrævet"),
    }),
  ],
});
