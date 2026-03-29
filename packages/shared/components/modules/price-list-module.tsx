import type { PAGE_QUERYResult } from "@/sanity/types";
import type { ItemList, ListItem, WithContext } from "schema-dts";

import { JSONLD } from "@/components/core/json-ld";
import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading, headingVariants, Paragraph, paragraphVariants } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { getPortableTextComponents } from "@/sanity/rich-text-components";
import { PortableText } from "next-sanity";

function generatePriceListModuleData(props: PriceListModuleProps): WithContext<ItemList> {
  const { _key, title, columns } = props;

  const listItems: ListItem[] | undefined = columns?.filter(column => column?.title || column?.description).map((column, index) => {
    const priceItemsText = column.priceItems?.filter(item => item?.title && item?.description)
      .map(item => `${item.title}: ${item.description}`)
      .join("; ");

    const description = [
      column.description,
      priceItemsText,
    ].filter(Boolean).join(" - ") || undefined;

    return {
      "@type": "ListItem",
      "position": index + 1,
      ...(column.title ? { name: column.title } : {}),
      ...(description ? { description } : {}),
    } as ListItem;
  }) as ListItem[] | undefined;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `#price-list-module-${_key ?? "primary"}`,
    "name": title || "Prisliste modul",
    "description": title
      ? `Prisliste modul: ${title}`
      : "Prisliste modul module content",
    ...(listItems && listItems.length > 0 ? { itemListElement: listItems } : {}),
  };
}

type PriceListModuleProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["pageBuilder"]>[number],
  { _type: "priceListModule" }
>;

type PriceListBlockProps = NonNullable<PriceListModuleProps["columns"]>[number];

export function PriceListModule({
  _key,
  title,
  subtitle,
  columns,
  ...props
}: PriceListModuleProps) {
  const priceListModuleData = generatePriceListModuleData({ _key, title, subtitle, columns, ...props });

  return (
    <Container asChild>
      <section>
        <JSONLD data={priceListModuleData} />
        <Grid className="gap-y-20 tablet:gap-y-80">
          <GridItem className="tablet:col-span-5">
            {title && <Heading size="h2" as="h2" colorScheme="dark" className="text-balance">{title}</Heading>}
          </GridItem>
          <GridItem className="tablet:col-span-6 tablet:col-start-7">
            {subtitle && <PortableText value={subtitle} components={getPortableTextComponents({ allowImages: false, colorScheme: "dark" })} />}
          </GridItem>
          <GridItem className="tablet:col-span-8">
            <ul className="mt-20 space-y-40 tablet:space-y-60">
              {columns?.map(block => (
                <PriceListBlock key={block._key} block={block as PriceListBlockProps} />
              ))}
            </ul>
          </GridItem>
        </Grid>
      </section>
    </Container>
  );
}

function PriceListBlock({ block }: { block: PriceListBlockProps }) {
  return (
    <li className="border aspect-square grid grid-rows-[1fr_auto] tablet:grid-rows-auto tablet:grid-cols-[70%_30%] border-dark rounded-base p-20 tablet:aspect-auto tablet:p-40 tablet:items-end">
      <div className="space-y-8 tablet:space-y-20">
        <p className={headingVariants({ size: "h4", colorScheme: "dark" })}>{block.title}</p>
        <Paragraph>{block.description}</Paragraph>
      </div>
      <ul className="space-y-20">
        {block.priceItems?.map(priceItem => (
          <li className={cn("grid", paragraphVariants({ size: "default", colorScheme: "dark" }))} key={priceItem._key}>
            <span>{priceItem.title}</span>
            <span>{priceItem.description}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}
