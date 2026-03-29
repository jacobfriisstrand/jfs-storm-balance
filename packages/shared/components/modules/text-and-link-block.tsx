import type { InputLink } from "@/lib/utils/transform-navigation-link";
import type { PAGE_QUERYResult } from "@/sanity/types";
import type {
  EntryPoint,
  ReadAction,
  WebPageElement,
  WithContext,
} from "schema-dts";

import { JSONLD } from "@/components/core/json-ld";
import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading, headingVariants } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { getNavigationHref, transformNavigationLinks } from "@/lib/utils/transform-navigation-link";
import { components } from "@/sanity/rich-text-components";
import { ArrowRightIcon } from "lucide-react";
import { PortableText } from "next-sanity";
import NextLink from "next/link";

function generateTextAndLinkBlockData(props: TextAndLinkBlockProps): WithContext<WebPageElement> {
  const { _key, title, link } = props;

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

  return {
    "@context": "https://schema.org",
    "@type": "WebPageElement",
    "@id": `#text-and-link-block-${_key ?? "primary"}`,
    "name": title || "Tekst og link blok",
    "description": title
      ? `Tekst og link blok: ${title}`
      : "Tekst og link blok module content",
    "isPartOf": { "@id": "#webpage" },
    "mainEntityOfPage": { "@id": "#webpage" },
    ...(action ? { potentialAction: action } : {}),
  };
}

type TextAndLinkBlockProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["pageBuilder"]>[number],
  { _type: "textAndLinkBlock" }
>;

export function TextAndLinkBlock({
  _key,
  title,
  description,
  link,
  ...props
}: TextAndLinkBlockProps) {
  const textAndLinkBlockData = generateTextAndLinkBlockData({ _key, title, description, link, ...props });

  const transformedLink = transformNavigationLinks(link ? [link as InputLink] : []);
  const firstLink = transformedLink[0];
  const href = firstLink ? getNavigationHref(firstLink) : "#";

  return (
    <Container asChild>

      <section>
        <JSONLD data={textAndLinkBlockData} />
        <Grid className="gap-y-20 tablet:gap-y-80">
          <GridItem className="tablet:col-span-5">
            {title && <Heading size="h2" as="h2" colorScheme="dark">{title}</Heading>}
          </GridItem>
          <GridItem className="tablet:col-span-5 tablet:col-start-7 grid">
            {description && <PortableText value={description} components={components} />}
          </GridItem>
          {firstLink?.label && (
            <GridItem className="tablet:col-span-5 tablet:col-start-7">
              <NextLink className={cn(headingVariants({ size: "h3", colorScheme: "dark" }), "font-sans flex items-center gap-8 w-fit focus-visible:focus-outline group")} href={href}>
                {firstLink.label}
                {" "}
                <ArrowRightIcon strokeWidth={1.5} className="size-[1em] text-dark group-hover:translate-x-8 transition-transform duration-normal ease-in-out" />
              </NextLink>
            </GridItem>
          )}
        </Grid>
      </section>
    </Container>
  );
}
