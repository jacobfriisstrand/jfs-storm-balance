import type { PAGE_QUERYResult } from "@/sanity/types";
import type { ImageObject, WebPageElement, WithContext } from "schema-dts";

import { Image } from "@/components/core/image";
import { JSONLD } from "@/components/core/json-ld";
import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { stegaClean } from "@sanity/client/stega";

type TextAndImageProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["pageBuilder"]>[number],
  { _type: "textAndImage" }
>;

function generateTextAndImageData(props: TextAndImageProps): WithContext<WebPageElement> {
  const { _key, title, image } = props;

  const imageObject: ImageObject | undefined = image?.asset?.url
    ? {
        "@type": "ImageObject",
        "contentUrl": image.asset.url,
        "url": image.asset.url,
        "caption": image.alt || undefined,
        "alternateName": image.alt || undefined,
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "WebPageElement",
    "@id": `#text-and-image-${_key ?? "primary"}`,
    "name": title || "Tekst og billede",
    "description": title
      ? `Tekst og billede: ${title}`
      : "Tekst og billede module content",
    "isPartOf": { "@id": "#webpage" },
    "mainEntityOfPage": { "@id": "#webpage" },
    ...(imageObject ? { image: imageObject } : {}),
  };
}

export function TextAndImage({ _key, title, image, orientation, ...props }: TextAndImageProps) {
  const textAndImageData = generateTextAndImageData({ _key, title, image, orientation, ...props });

  return (
    <Container asChild>
      <section
        data-orientation={stegaClean(orientation) || "imageRight"}
      >
        <JSONLD data={textAndImageData} />
        <Grid className="gap-y-20 tablet:gap-y-0 items-end">
          <GridItem className={cn("tablet:col-span-5", orientation === "imageRight" ? "tablet:col-start-1" : "tablet:col-start-7")}>
            {title
              ? (
                  <Heading size="h4" as="h2" colorScheme="dark" className="text-balance leading-24 tablet:leading-48">
                    {title}
                  </Heading>
                )
              : null}
          </GridItem>
          <GridItem className={cn("tablet:row-start-1", orientation === "imageRight" ? "tablet:col-start-7" : "tablet:col-start-1 tablet:col-span-5")}>
            {image?.asset?.url && image.alt
              ? (
                  <Image
                    className="aspect-3/4"
                    image={image}
                  />
                )
              : null}
          </GridItem>
        </Grid>
      </section>
    </Container>
  );
}
