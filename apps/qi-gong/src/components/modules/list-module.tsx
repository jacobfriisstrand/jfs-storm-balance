import type { PAGE_QUERYResult } from "@/sanity/types";
import type {
  ImageObject,
  ItemList,
  ListItem,
  WithContext,
} from "schema-dts";

import { Image } from "@/components/core/image";
import { JSONLD } from "@/components/core/json-ld";
import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { ImageOverlay } from "@/components/ui/image-overlay";
import { Heading } from "@/components/ui/typography";
import YinYangIcon from "@public/assets/yin-yang.svg";

import { Paragraph } from "../ui/typography";

function generateListModuleData(props: ListModuleProps): WithContext<ItemList> {
  const { _key, title, items, image } = props;

  const imageObject: ImageObject | undefined = image?.asset?.url
    ? {
        "@type": "ImageObject",
        "contentUrl": image.asset.url,
        "url": image.asset.url,
        "caption": image.alt || undefined,
      }
    : undefined;

  const listItems: ListItem[] | undefined = items?.filter(item => item?.title || item?.description).map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    ...(item.title ? { name: item.title } : {}),
    ...(item.description ? { description: item.description } : {}),
  })) as ListItem[] | undefined;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `#list-module-${_key ?? "primary"}`,
    "name": title || "Liste blok",
    "description": title
      ? `Liste blok: ${title}`
      : "Liste blok module content",
    ...(imageObject ? { image: imageObject } : {}),
    ...(listItems && listItems.length > 0 ? { itemListElement: listItems } : {}),
  };
}

type ListModuleProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["pageBuilder"]>[number],
  { _type: "listModule" }
>;

export function ListModule({
  _key,
  title,
  items,
  image,
  ...props
}: ListModuleProps) {
  const listModuleData = generateListModuleData({ _key, title, items, image, ...props });

  return (
    <Container asChild>
      <section>
        <JSONLD data={listModuleData} />
        <Grid className="gap-y-32 tablet:gap-y-80">
          <GridItem>
            {title && <Heading size="h2" as="h2" colorScheme="dark" className="text-center tablet:text-left">{title}</Heading>}
          </GridItem>
          <GridItem className="tablet:col-span-5 row-start-3 tablet:row-start-2 relative my-auto">
            {image?.asset?.url && image.alt && (
              <>
                <Image className="w-auto h-auto aspect-square" image={{ asset: { url: image.asset.url }, alt: image.alt }} />
                <ImageOverlay orientation="fromLeft" className="hidden tablet:block" colorScheme="light" />
              </>
            )}
          </GridItem>
          <GridItem className="tablet:col-span-7 tablet:col-start-6 flex items-center max-tablet:justify-center">
            <ul className="flex flex-col gap-28 tablet:gap-44">
              {items?.map(item => (
                (item?.title || item?.description)
                  ? (
                      <ListModuleItem key={item._key} title={item.title} description={item.description} />
                    )
                  : null
              ))}
            </ul>
          </GridItem>
        </Grid>
      </section>
    </Container>
  );
}

function ListModuleItem({ title, description }: { title?: string; description?: string }) {
  return (
    <li className="flex flex-col text-center gap-8 tablet:gap-16 tablet:text-left">
      {title && (
        <div className="flex flex-col items-center text-balance gap-8 tablet:flex-row">
          <YinYangIcon className="size-20 tablet:size-40" />
          <Heading size="h3" as="h3" colorScheme="dark">{title}</Heading>
        </div>
      )}
      {!title && description && <YinYangIcon className="size-20 tablet:size-40 mx-auto tablet:mx-0" />}
      {description && <Paragraph className="text-balance">{description}</Paragraph>}
    </li>
  );
}
