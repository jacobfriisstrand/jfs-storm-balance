import type { InputLink } from "@/lib/utils/transform-navigation-link";
import type { PAGE_QUERYResult } from "@/sanity/types";
import type {
  EntryPoint,
  ImageObject,
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
import { Heading, Paragraph } from "@/components/ui/typography";
import { getNavigationHref, transformNavigationLinks } from "@/lib/utils/transform-navigation-link";

function generateHomepageHeroData(props: HomepageHeroProps): WithContext<WebPageElement> {
  const { _key, title, description, image, buttons } = props;

  const imageObject: ImageObject | undefined = image?.asset?.url
    ? {
        "@type": "ImageObject",
        "contentUrl": image.asset.url,
        "url": image.asset.url,
        "caption": image.alt || undefined,
      }
    : undefined;

  const actions: ReadAction[] | undefined = Array.isArray(buttons) && buttons.length
    ? (buttons
        .map((btn: any) => {
          const href = getNavigationHref(btn);
          if (!href)
            return undefined;
          const target: EntryPoint = {
            "@type": "EntryPoint",
            "urlTemplate": href,
          };
          return {
            "@type": "ReadAction",
            "name": btn.label || undefined,
            target,
          } as ReadAction;
        })
        .filter(Boolean) as ReadAction[])
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "WebPageElement",
    "@id": `#hero-${_key ?? "primary"}`,
    "name": title ?? undefined,
    "description": description ?? undefined,
    "isPartOf": { "@id": "#webpage" },
    "mainEntityOfPage": { "@id": "#webpage" },
    "image": imageObject,
    "potentialAction": actions,
  };
}

type HomepageHeroProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["pageBuilder"]>[number],
  { _type: "homepageHero" }
>;

export function HomepageHero({
  _key,
  title,
  description,
  image,
  buttons,
  ...props
}: HomepageHeroProps) {
  const homepageHeroData = generateHomepageHeroData({ _key, title, description, image, buttons, ...props });
  const transformedButtons = transformNavigationLinks(buttons as InputLink[]);

  return (
    <section className="grid place-items-end mt-(--navigation-height-mobile) tablet:mt-(--navigation-height-desktop)">
      <JSONLD data={homepageHeroData} />

      <Container size="fluid" className="[grid-area:1/1] -z-1 relative">
        {image?.asset?.url && image.alt && (
          <Image
            loading="eager"
            className="aspect-3/4 tablet:aspect-video max-h-[80svh]"
            image={image}
          />
        )}
        <ImageOverlay orientation="fromBottom" colorScheme="dark" />
      </Container>

      <Container className="[grid-area:1/1] pb-28">
        <Grid className="max-tablet:gap-y-16">
          <GridItem className="tablet:col-span-7">
            {title && (
              <Heading size="h1" as="h1" colorScheme="light">
                {title}
              </Heading>
            )}

          </GridItem>

          <GridItem className="tablet:col-span-4 tablet:col-start-9 grid gap-16 tablet:gap-20">
            {description && (
              <Paragraph colorScheme="light">{description}</Paragraph>
            )}
            <div className="flex flex-row gap-16 tablet:gap-20">
              {transformedButtons && transformedButtons
                .filter(btn => btn.label)
                .map((btn, index) => {
                  const href = getNavigationHref(btn);
                  return (
                    <Button className="w-fit focus-visible:outline-light" key={`${href}-${btn.label}`} href={href} variant={index > 0 ? "secondary" : "primary"}>
                      {btn.label}
                    </Button>
                  );
                })}
            </div>
          </GridItem>
        </Grid>

      </Container>

    </section>
  );
}
