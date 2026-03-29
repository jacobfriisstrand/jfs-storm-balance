import { defineField, defineType } from "sanity";

export const textAndLinkBlockType = defineType({
  name: "textAndLinkBlock",
  title: "Tekst og link blok",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Overskrift",
    }),
    defineField({
      name: "description",
      title: "Brødtekst",
      type: "richText",
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "navigationLink",
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title,
        subtitle: "Tekst og link blok",
      };
    },
  },
});
