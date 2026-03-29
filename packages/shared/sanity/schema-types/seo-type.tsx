import { defineField, defineType, set } from "sanity";

export const seoType = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "SEO-titel",
      type: "string",
      validation: rule => rule.required().error("SEO-titel er påkrævet"),
    }),
    defineField({
      name: "description",
      title: "SEO-beskrivelse",
      type: "text",
      rows: 3,
      description: "SEO-beskrivelsen er et kort resumé af din side. Den vises i søgeresultater og når din side deles på sociale medier.",
      components: {
        input: (props) => {
          const { value, onChange } = props;
          const charCount = value ? value.length : 0;

          return (
            <div>
              <textarea
                value={value || ""}
                onChange={e => onChange(set(e.target.value))}
                rows={3}
                className="w-full p-2 border rounded"
              />
              <div className="mt-1 text-xs">
                {charCount}
                {" "}
                tegn
              </div>
            </div>
          );
        },
      },
      validation: rule => [
        rule.required().error("SEO-beskrivelse er påkrævet"),
        rule.required().info("En SEO-beskrivelse hjælper søgemaskiner med at forstå din side og dens indhold. Brug nøgleord, der er relevante for siden og indholdet, for bedre synlighed."),
        rule.min(150).max(160).warning("For optimal SEO bør resuméet være mellem 150-160 tegn"),
      ],
    }),
    defineField({
      name: "image",
      title: "SEO-billede",
      type: "image",
      description: "Dette billede bruges som SEO-billede, f.eks. når siden deles på sociale medier",
    }),
    defineField({
      name: "noIndex",
      type: "boolean",
      description: "Hvis aktiveret, vil siden ikke blive indekseret af søgemaskiner",
    }),

  ],
});
