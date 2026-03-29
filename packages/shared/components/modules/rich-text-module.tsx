import type { PAGE_QUERYResult } from "@/sanity/types";
import type { WebPageElement, WithContext } from "schema-dts";

import { JSONLD } from "@/components/core/json-ld";
import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading } from "@/components/ui/typography";
import { getPortableTextComponents } from "@/sanity/rich-text-components";
import { PortableText } from "next-sanity";

function generateRichTextModuleData(props: RichTextModuleProps): WithContext<WebPageElement> {
  const { _key, title } = props;

  return {
    "@context": "https://schema.org",
    "@type": "WebPageElement",
    "@id": `#rich-text-module-${_key ?? "primary"}`,
    "name": title || "Tekst modul",
    "description": title
      ? `Tekst modul: ${title}`
      : "Tekst modul module content",
    "isPartOf": { "@id": "#webpage" },
    "mainEntityOfPage": { "@id": "#webpage" },
  };
}

type RichTextModuleProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["pageBuilder"]>[number],
  { _type: "richTextModule" }
>;

export function RichTextModule({
  _key,
  title,
  description,
  ...props
}: RichTextModuleProps) {
  const richTextModuleData = generateRichTextModuleData({ _key, title, description, ...props });

  return (
    <Container asChild>
      <section>
        <JSONLD data={richTextModuleData} />
        <Grid className="gap-y-20 tablet:gap-y-0">
          <GridItem className="tablet:col-span-5">
            {title && <Heading size="h2" as="h2" colorScheme="dark" className="text-balance">{title}</Heading>}
          </GridItem>
          <GridItem className="tablet:col-start-7">
            {description && <PortableText value={description} components={getPortableTextComponents()} />}
          </GridItem>
        </Grid>
      </section>
    </Container>
  );
}
