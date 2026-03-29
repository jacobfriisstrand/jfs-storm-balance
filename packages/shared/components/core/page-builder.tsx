"use client";

import type { CONTACT_BUTTONS_QUERYResult, PAGE_QUERYResult } from "@/sanity/types";

import { ContactModule } from "@/components/modules/contact-module";
import { CtaBlock } from "@/components/modules/cta-block";
import { FeatureList } from "@/components/modules/feature-list";
import { GenericHero } from "@/components/modules/generic-hero";
import { GridModule } from "@/components/modules/grid-module";
import { HomepageHero } from "@/components/modules/homepage-hero";
import { ImageGrid } from "@/components/modules/image-grid";
import { ListModule } from "@/components/modules/list-module";
import { PriceListModule } from "@/components/modules/price-list-module";
import { QuoteModule } from "@/components/modules/quote-module";
import { RichTextModule } from "@/components/modules/rich-text-module";
import { TextAndImage } from "@/components/modules/text-and-image";
import { TextAndLinkBlock } from "@/components/modules/text-and-link-block";
import { createDataAttributeConfig } from "@/sanity/lib/data-attribute-config";
import { createDataAttribute } from "next-sanity";

type PageBuilderProps = {
  modules: NonNullable<PAGE_QUERYResult>["pageBuilder"];
  documentId: string;
  documentType: string;
  contactButtonsData?: CONTACT_BUTTONS_QUERYResult;
};

function DragHandle({
  children,
  blockKey,
  documentId,
  documentType,
}: {
  children: React.ReactNode;
  blockKey: string;
  documentId: string;
  documentType: string;
}) {
  return (
    <div
      data-sanity={createDataAttribute({
        ...createDataAttributeConfig,
        id: documentId,
        type: documentType,
        path: `content[_key=="${blockKey}"]`,
      }).toString()}
    >
      {children}
    </div>
  );
}

export function PageBuilder({
  modules,
  documentId,
  documentType,
  contactButtonsData,
}: PageBuilderProps) {
  // Ensure content is an array
  const blocks = Array.isArray(modules) ? modules : [];

  return (
    <main
      className="space-y-80 tablet:space-y-180"
      data-sanity={createDataAttribute({
        ...createDataAttributeConfig,
        id: documentId,
        type: documentType,
        path: "pageBuilder",
      }).toString()}
    >
      {blocks.map((block) => {
        switch (block._type) {
          case "textAndImage":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <TextAndImage {...block} />
              </DragHandle>
            );
          case "homepageHero":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <HomepageHero {...block} />
              </DragHandle>
            );
          case "genericHero":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <GenericHero {...block} />
              </DragHandle>
            );
          case "textAndLinkBlock":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <TextAndLinkBlock {...block} />
              </DragHandle>
            );
          case "listModule":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <ListModule {...block} />
              </DragHandle>
            );
          case "featureList":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <FeatureList {...block} />
              </DragHandle>
            );
          case "quoteModule":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <QuoteModule {...block} />
              </DragHandle>
            );
          case "ctaBlock":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <CtaBlock {...block} />
              </DragHandle>
            );
          case "contactModule":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <ContactModule {...block} contactButtonsData={contactButtonsData} />
              </DragHandle>
            );
          case "richTextModule":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <RichTextModule {...block} />
              </DragHandle>
            );
          case "gridModule":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <GridModule {...block} />
              </DragHandle>
            );
          case "imageGrid":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <ImageGrid {...block} />
              </DragHandle>
            );
          case "priceListModule":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <PriceListModule {...block} />
              </DragHandle>
            );
          default:
            // This is a fallback for when we don't have a block type
            return (
              <div key={(block as { _key: string; _type: string })._key}>
                Block not found:
                {(block as { _key: string; _type: string })._type}
              </div>
            );
        }
      })}
    </main>
  );
}
