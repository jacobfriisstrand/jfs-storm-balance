import { defineField, defineType } from "sanity";

export const ctaBlockType = defineType({
  name: "ctaBlock",
  title: "CTA block",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "description",
      type: "richTextNoImages",
    }),
    defineField({
      name: "image",
      type: "imageFieldType",
    }),
    defineField({
      name: "link",
      title: "Knap link",
      type: "navigationLink",
    }),
    defineField({
      name: "buttonType",
      title: "Knap type",
      type: "string",
      options: {
        list: [
          { title: "Primær", value: "primary" },
          { title: "Sekundær", value: "secondary" },
        ],
      },
      initialValue: "primary",
    }),
    defineField({
      name: "imagePosition",
      title: "Billedeplacering",
      type: "string",
      options: {
        list: [
          { title: "Venstre", value: "left" },
          { title: "Højre", value: "right" },
        ],
      },
      initialValue: "right",
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title,
        subtitle: "CTA block",
      };
    },
  },
});
