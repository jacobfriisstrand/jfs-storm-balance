import type { PAGE_QUERYResult } from "@/sanity/types";
import type { ImageObject, ItemList, ListItem, WithContext } from "schema-dts";

import { Image } from "@/components/core/image";
import { JSONLD } from "@/components/core/json-ld";
import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading } from "@/components/ui/typography";

function generateImageGridData(props: ImageGridProps): WithContext<ItemList> {
  const { _key, title, images } = props;

  const listItems: ListItem[] | undefined = images?.filter(image => image.asset && image.alt).map((image, index) => {
    const imageUrl = image.asset?._ref
      ? undefined // We'd need to resolve the URL from the ref, but for now we'll use what we have
      : (image.asset as { url?: string })?.url;

    const imageObject: ImageObject | undefined = imageUrl
      ? {
          "@type": "ImageObject",
          "contentUrl": imageUrl,
          "url": imageUrl,
          "caption": image.alt || undefined,
          "alternateName": image.alt || undefined,
        }
      : undefined;

    return {
      "@type": "ListItem",
      "position": index + 1,
      ...(image.alt ? { name: image.alt } : {}),
      ...(imageObject ? { image: imageObject } : {}),
    } as ListItem;
  }) as ListItem[] | undefined;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `#image-grid-${_key ?? "primary"}`,
    "name": title || "Billede kolonne modul",
    "description": title
      ? `Billede kolonne modul: ${title}`
      : "Billede kolonne modul module content",
    ...(listItems && listItems.length > 0 ? { itemListElement: listItems } : {}),
  };
}

type ImageGridProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["pageBuilder"]>[number],
  { _type: "imageGrid" }
>;

export function ImageGrid({
  _key,
  title,
  images,
  ...props
}: ImageGridProps) {
  const imageGridData = generateImageGridData({ _key, title, images, ...props });

  return (
    <Container asChild>
      <section>
        <JSONLD data={imageGridData} />
        <Grid className="gap-y-40 tablet:gap-y-60">
          <GridItem>
            {title && <Heading size="h2" as="h2" colorScheme="dark" className="text-balance">{title}</Heading>}
          </GridItem>
          <GridItem>
            <ul className="grid grid-cols-1 tablet:grid-cols-3 gap-40 tablet:gap-60">
              {images?.map(image => (
                image.asset && image.alt && (
                  <li key={image._key}>
                    <Image className="aspect-square tablet:aspect-3/4" image={image} />
                  </li>
                )
              ))}
            </ul>
          </GridItem>
        </Grid>
      </section>
    </Container>
  );
};
