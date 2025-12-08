import type { PAGE_QUERYResult } from "@/sanity/types";
import type { WebPageElement, WithContext } from "schema-dts";

import { Image } from "@/components/core/image";
import { JSONLD } from "@/components/core/json-ld";
import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { ImageOverlay } from "@/components/ui/image-overlay";
import { Heading } from "@/components/ui/typography";

function generateGenericHeroData(props: GenericHeroProps): WithContext<WebPageElement> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPageElement",
    "@id": `#hero-${props._key}`,
    "identifier": props._key,
    "name": props.title ?? undefined,
    ...(props.image?.asset?.url && props.image.alt
      ? {
          image: {
            "@type": "ImageObject",
            "url": props.image.asset.url,
            "caption": props.image.alt,
            "alternateName": props.image.alt,
          },
        }
      : {}),
  };
}

type GenericHeroProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["pageBuilder"]>[number],
  { _type: "genericHero" }
>;

export function GenericHero({
  _key,
  title,
  image,
  ...props
}: GenericHeroProps) {
  const genericHeroData = generateGenericHeroData({ _key, title, image, ...props });

  return (
    <section className="space-y-20 tablet:space-y-40 mt-(--navigation-height-mobile) tablet:mt-(--navigation-height-desktop)">
      <JSONLD data={genericHeroData} />
      <Container size="fluid" className="relative">
        {image?.asset?.url && image.alt && (
          <Image
            loading="eager"
            className="aspect-3/4 tablet:aspect-video max-h-[70svh]"
            image={image}
          />
        )}
        <ImageOverlay orientation="fromBottom" colorScheme="light" />
      </Container>
      <Container>
        <Grid>
          <GridItem className="text-end">
            {title && <Heading size="h1" as="h1" colorScheme="dark">{title}</Heading>}
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}
