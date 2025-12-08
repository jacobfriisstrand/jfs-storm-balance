import type { InputLink } from "@/lib/utils/transform-navigation-link";
import type { PAGE_QUERYResult } from "@/sanity/types";
import type {
  EntryPoint,
  ReadAction,
  WebPageElement,
  WithContext,
} from "schema-dts";

import { Image } from "@/components/core/image";
import { JSONLD } from "@/components/core/json-ld";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { ImageOverlay } from "@/components/ui/image-overlay";
import { Heading } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { getNavigationHref, transformNavigationLinks } from "@/lib/utils/transform-navigation-link";
import { getPortableTextComponents } from "@/sanity/rich-text-components";
import { PortableText } from "next-sanity";

function generateCtaBlockData(props: CtaBlockProps): WithContext<WebPageElement> {
  const { _key, title, link, image } = props;

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
    "@id": `#cta-block-${_key ?? "primary"}`,
    "name": title || "CTA block",
    "description": title
      ? `CTA block: ${title}`
      : "CTA block module content",
    "isPartOf": { "@id": "#webpage" },
    "mainEntityOfPage": { "@id": "#webpage" },
    ...(image?.asset?.url ? { image: image.asset.url } : {}),
    ...(action ? { potentialAction: action } : {}),
  };
}

type CtaBlockProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["pageBuilder"]>[number],
  { _type: "ctaBlock" }
>;

export function CtaBlock({
  _key,
  title,
  description,
  image,
  link,
  buttonType,
  imagePosition,
  ...props
}: CtaBlockProps) {
  const ctaBlockData = generateCtaBlockData({ _key, title, description, image, link, buttonType, imagePosition, ...props });

  const transformedLink = transformNavigationLinks(link ? [link as InputLink] : []);
  const firstLink = transformedLink[0];
  const href = firstLink ? getNavigationHref(firstLink) : undefined;

  return (
    <Container asChild>
      <section>
        <JSONLD data={ctaBlockData} />
        <Grid className="gap-y-40 tablet:gap-y-0 tablet:min-h-[50svh] tablet:items-center">
          <GridItem className={cn("tablet:col-span-5 tablet:row-start-1", imagePosition === "left" ? "tablet:col-start-8" : "tablet:col-start-1")}>
            {title && <Heading size="h2" as="h2" colorScheme="dark">{title}</Heading>}
          </GridItem>

          <GridItem className={cn("tablet:col-span-5 tablet:row-start-2", imagePosition === "left" ? "tablet:col-start-8" : "tablet:col-start-1")}>
            {description && <PortableText value={description} components={getPortableTextComponents({ allowImages: false })} />}
          </GridItem>

          {firstLink?.label && (
            <GridItem className={cn("tablet:col-span-5 tablet:row-start-3", imagePosition === "left" ? "tablet:col-start-8" : "tablet:col-start-1")}>
              <Button className="w-fit" href={href} variant={buttonType}>{firstLink.label}</Button>
            </GridItem>
          )}
          <GridItem className={cn("tablet:row-span-3 relative", imagePosition === "left" ? "tablet:col-start-1 tablet:col-span-7" : "tablet:col-start-6")}>
            {image?.asset?.url && image.alt && (
              <>
                <Image className="aspect-3/4 tablet:aspect-video size-full" image={image} />
                <ImageOverlay orientation={imagePosition === "left" ? "fromLeft" : "fromRight"} colorScheme="light" />
              </>
            )}
          </GridItem>
        </Grid>
      </section>
    </Container>
  );
}
