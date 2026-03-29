import { Paragraph } from "@/components/ui/typography";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * This is the schema type for block content used in the post document type
 * Importing this type into the studio configuration's `schema` property
 * lets you reuse it in other document types with:
 *  {
 *    name: 'someName',
 *    title: 'Some title',
 *    type: 'blockContent'
 *  }
 */

function createRichTextType(options?: {
  allowImages?: boolean;
  name?: string;
  title?: string;
  allowContactReferences?: boolean;
}) {
  const {
    allowImages = true,
    name = "richText",
    title = "Rich Text",
    allowContactReferences = false,
  } = options ?? {};

  // Define inline blocks for contact references
  const inlineBlocks: ReturnType<typeof defineArrayMember>[] = [];

  if (allowContactReferences) {
    inlineBlocks.push(
      defineArrayMember({
        type: "emailReference",
      }),
      defineArrayMember({
        type: "phoneReference",
      }),
    );
  }

  const of: ReturnType<typeof defineArrayMember>[] = [
    defineArrayMember({
      type: "block",
      // Add inline blocks if contact references are enabled
      ...(allowContactReferences
        && inlineBlocks.length > 0 && { of: inlineBlocks }),
      // Styles let you define what blocks can be marked up as. The default
      // set corresponds with HTML tags, but you can set any title or value
      // you want, and decide how you want to deal with it where you want to
      // use your content.
      styles: [
        { title: "Normal", value: "normal", component: Paragraph },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "Citat", value: "blockquote" },
      ],
      lists: [{ title: "Punktliste", value: "bullet" }],
      // Marks let you mark up inline text in the Portable Text Editor
      marks: {
        // Decorators usually describe a single property – e.g. a typographic
        // preference or highlighting
        decorators: [
          { title: "Fed", value: "strong" },
          { title: "Kursiv", value: "em" },
        ],
        // Annotations can be any object structure – e.g. a link or a footnote.
        annotations: [
          {
            title: "URL",
            name: "link",
            type: "object",
            fields: [
              defineField({
                title: "URL",
                name: "href",
                type: "url",
              }),
            ],
          },
        ],
      },
    }),
  ];

  // Conditionally add image type if allowed
  if (allowImages) {
    of.push(
      defineArrayMember({
        type: "imageFieldType",
        title: "Billede",
        preview: {
          select: {
            title: "title",
            media: "image",
          },
          prepare({ media }) {
            return {
              media,
            };
          },
        },
      }),
    );
  }

  return defineType({
    title,
    name,
    type: "array",
    description:
      "Tip: Hvis du vil lave linjeskift/mellemrum i teksten, hold da SHIFT nede, når du taster enter.",
    of,
  });
}

// Default rich text type with images enabled (for backward compatibility)
export const richTextType = createRichTextType({
  allowImages: true,
  allowContactReferences: true,
});

// Rich text type without images
export const richTextNoImagesType = createRichTextType({
  allowImages: false,
  name: "richTextNoImages",
  title: "Rich Text (No Images)",
  allowContactReferences: true,
});
