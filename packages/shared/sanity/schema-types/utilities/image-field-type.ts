import { defineField, defineType } from "sanity";

export const imageFieldType = defineType({
  name: "imageFieldType",
  type: "image",
  options: {
    hotspot: true,
  },
  fields: [
    defineField({
      name: "alt",
      type: "string",
      title: "Alternativ tekst",
      description: "Alternativ tekst bruges til at beskrive billedet for synshandicappede. Den bruges også af søgemaskiner til at forstå billedets indhold.",
      validation: Rule => Rule.required(),
    }),
  ],
});
