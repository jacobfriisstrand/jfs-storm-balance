import type { Metadata } from "next";

import { PageBuilderWrapper } from "@/components/core/page-builder-wrapper";
import { PAGE_TYPES } from "@/sanity/constants/page-types";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

async function getPage(params: RouteProps["params"]) {
  const resolvedParams = await params;

  return sanityFetch({
    query: PAGE_QUERY,
    params: {
      slug: resolvedParams.slug,
      pageTypes: PAGE_TYPES,
    },
  });
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { data: page } = await getPage(params);

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

export default async function Page({ params }: RouteProps) {
  const { data: page } = await getPage(params);

  if (!page) {
    notFound();
  }

  return (
    <>
      <title>{page.seo.title}</title>
      {page.pageBuilder ? <PageBuilderWrapper modules={page.pageBuilder} documentId={page._id} documentType={PAGE_TYPES[0]} /> : null}
    </>
  );
}
