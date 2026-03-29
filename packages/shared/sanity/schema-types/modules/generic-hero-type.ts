import { defineField, defineType } from "sanity";

export const genericHeroType = defineType({
  name: "genericHero",
  title: "Generisk side hero",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Titel",
      type: "string",
      validation: Rule => Rule.required().error("Dette felt er påkrævet"),
    }),
    defineField({
      name: "image",
      title: "Billede",
      type: "imageFieldType",
      validation: Rule => Rule.required().error("Dette felt er påkrævet"),
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
    },
    prepare({ title, media }) {
      return {
        title,
        subtitle: "Generisk side hero",
        media,
      };
    },
  },
});
