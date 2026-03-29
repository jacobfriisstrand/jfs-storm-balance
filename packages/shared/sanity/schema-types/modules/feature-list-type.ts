import { defineField, defineType } from "sanity";

export const featureListType = defineType({
  name: "featureList",
  title: "Feature liste",
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
      type: "richText",
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
      name: "items",
      title: "Feature elementer",
      type: "array",
      of: [{ type: "object", title: "Feature element", fields: [{ name: "title", title: "Titel", type: "string" }, { name: "description", title: "Beskrivelse", type: "text" }] }],
      validation: Rule => Rule.required().min(1).error("Minimum 1 feature element er påkrævet"),
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title,
        subtitle: "Feature liste",
      };
    },
  },
});
