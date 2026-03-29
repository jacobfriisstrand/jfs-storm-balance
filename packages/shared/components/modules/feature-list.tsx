import type { InputLink } from "@/lib/utils/transform-navigation-link";
import type { PAGE_QUERYResult } from "@/sanity/types";
import type {
  EntryPoint,
  ItemList,
  ListItem,
  ReadAction,
  WithContext,
} from "schema-dts";

import { JSONLD } from "@/components/core/json-ld";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading, Paragraph } from "@/components/ui/typography";
import { getNavigationHref, transformNavigationLinks } from "@/lib/utils/transform-navigation-link";
import { components } from "@/sanity/rich-text-components";
import { PortableText } from "next-sanity";

function generateFeatureListData(props: FeatureListProps): WithContext<ItemList> {
  const { _key, title, link, items } = props;

  const transformedLink = transformNavigationLinks([link as InputLink]);
  const href = link ? getNavigationHref(transformedLink[0]) : undefined;

  const action: ReadAction | undefined = href && transformedLink[0]?.label
    ? {
        "@type": "ReadAction",
        "name": transformedLink[0].label,
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": href,
        } as EntryPoint,
      }
    : undefined;

  const listItems: ListItem[] | undefined = items?.filter(item => item?.title && item?.description).map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.title!,
    "description": item.description!,
  })) as ListItem[] | undefined;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `#feature-list-${_key ?? "primary"}`,
    "name": title || "Feature liste",
    "description": title
      ? `Feature liste: ${title}`
      : "Feature liste module content",
    ...(listItems && listItems.length > 0 ? { itemListElement: listItems } : {}),
    ...(action ? { potentialAction: action } : {}),
  };
}

type FeatureListProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["pageBuilder"]>[number],
  { _type: "featureList" }
>;

export function FeatureList({
  _key,
  title,
  description,
  link,
  buttonType,
  items,
  ...props
}: FeatureListProps) {
  const featureListData = generateFeatureListData({ _key, title, description, link, buttonType, items, ...props });

  const transformedLink = transformNavigationLinks(link ? [link as InputLink] : []);
  const firstLink = transformedLink[0];
  const href = firstLink ? getNavigationHref(firstLink) : undefined;

  return (
    <>
      <JSONLD data={featureListData} />
      <Container asChild>
        <section>
          <Grid className="gap-y-20 tablet:gap-y-0">
            <GridItem className="tablet:text-center tablet:mb-80">
              {title && <Heading size="h2" as="h2" colorScheme="dark">{title}</Heading>}
            </GridItem>
            <GridItem className="tablet:col-span-4 tablet:row-start-2 tablet:mb-20">
              {description && <PortableText value={description} components={components} />}
            </GridItem>

            <GridItem className="tablet:col-start-7 tablet:row-span-4">
              <ul className="space-y-20 tablet:space-y-32">
                {items?.map(item => item?.title && item?.description && (
                  <FeatureListItem key={item._key} title={item.title} description={item.description} />
                ))}
              </ul>
            </GridItem>
            {firstLink?.label && (
              <GridItem className="tablet:col-span-4 tablet:row-start-3 w-fit">
                <Button href={href} variant={buttonType}>{firstLink.label}</Button>
              </GridItem>
            )}
          </Grid>
        </section>
      </Container>
    </>
  );
}

function FeatureListItem({ title, description }: { title: string; description: string }) {
  return (
    <li className="border border-dark p-20">
      <article className="flex flex-col gap-20 tablet:flex-row tablet:justify-between tablet:items-center">
        <Heading size="h4" as="h3" colorScheme="dark">{title}</Heading>
        <Paragraph className="text-balance tablet:text-right">{description}</Paragraph>
      </article>
    </li>
  );
}
