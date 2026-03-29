import { defineField, defineType } from "sanity";

export const emailReferenceType = defineType({
  name: "emailReference",
  title: "E-mail reference",
  type: "object",
  fields: [
    defineField({
      name: "globalSettings",
      type: "reference",
      to: [{ type: "globalSettings" }],
      validation: Rule => Rule.required(),
      options: {
        disableNew: true,
      },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "E-mail",
        subtitle: "E-mail reference",
      };
    },
  },
});

export const phoneReferenceType = defineType({
  name: "phoneReference",
  title: "Telefon reference",
  type: "object",
  fields: [
    defineField({
      name: "globalSettings",
      type: "reference",
      to: [{ type: "globalSettings" }],
      validation: Rule => Rule.required(),
      options: {
        disableNew: true,
      },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Telefon",
        subtitle: "Telefon reference",
      };
    },
  },
});
