import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading, Paragraph } from "@/components/ui/typography";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import { NOT_FOUND_PAGE_QUERY } from "@/sanity/lib/queries";

async function getPage() {
  return sanityFetch({
    query: NOT_FOUND_PAGE_QUERY,
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const { data: page } = await getPage();

  if (!page) {
    return {};
  }

  const metadata: Metadata = {
    title: page.seo.title,
    description: page.seo.description,
  };

  if (page.seo.image && page.seo.image.asset?._ref) {
    metadata.openGraph = {
      images: {
        url: urlFor(page.seo.image).width(1200).height(630).url(),
        width: 1200,
        height: 630,
      },
    };
  }

  if (page.seo.noIndex) {
    metadata.robots = "noindex";
  }

  return metadata;
}

export default async function NotFound() {
  const { data: page } = await getPage();

  return (
    <main className="mt-(--navigation-height-mobile) tablet:mt-(--navigation-height-desktop) flex items-center justify-center h-[calc(100svh-var(--navigation-height-mobile))] tablet:h-[calc(100svh-var(--navigation-height-desktop))]">
      <Container>
        <Grid className="gap-y-20">
          <GridItem>
            <Heading size="h1" as="h1" colorScheme="dark">{page?.heading}</Heading>
          </GridItem>
          <GridItem>
            <Paragraph size="default" colorScheme="dark">{page?.subheading}</Paragraph>
          </GridItem>
        </Grid>
      </Container>
    </main>
  );
}
