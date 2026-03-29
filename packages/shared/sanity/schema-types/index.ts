import type { SchemaTypeDefinition } from "sanity";

import { globalSettingsType } from "@/sanity/schema-types/global-settings-type";
import { contactModuleType } from "@/sanity/schema-types/modules/contact-module-type";
import { ctaBlockType } from "@/sanity/schema-types/modules/cta-block-type";
import { featureListType } from "@/sanity/schema-types/modules/feature-list-type";
import { footerType } from "@/sanity/schema-types/modules/footer-type";
import { genericHeroType } from "@/sanity/schema-types/modules/generic-hero-type";
import { gridModuleType } from "@/sanity/schema-types/modules/grid-module-type";
import { homepageHeroType } from "@/sanity/schema-types/modules/homepage-hero-type";
import { imageGridType } from "@/sanity/schema-types/modules/image-grid-type";
import { listModuleType } from "@/sanity/schema-types/modules/list-module-type";
import { navigationType } from "@/sanity/schema-types/modules/navigation-type";
import { priceListModuleType } from "@/sanity/schema-types/modules/price-list-module-type";
import { quoteModuleType } from "@/sanity/schema-types/modules/quote-module-type";
import { richTextModuleType } from "@/sanity/schema-types/modules/rich-text-module-type";
import { textAndImageType } from "@/sanity/schema-types/modules/text-and-image-type";
import { textAndLinkBlockType } from "@/sanity/schema-types/modules/text-and-link-block-type";
import { basePageType } from "@/sanity/schema-types/page-templates/base-page-type";
import { genericPageType } from "@/sanity/schema-types/page-templates/generic-page-type";
import { homePageType } from "@/sanity/schema-types/page-templates/home-page-type";
import { notFoundPageType } from "@/sanity/schema-types/page-templates/not-found-page-type";
import { emailReferenceType, phoneReferenceType } from "@/sanity/schema-types/utilities/contact-reference-types";
import { imageFieldType } from "@/sanity/schema-types/utilities/image-field-type";
import { navigationLinkType } from "@/sanity/schema-types/utilities/navigation-link-type";
import { redirectType } from "@/sanity/schema-types/utilities/redirect-type";
import { richTextNoImagesType, richTextType } from "@/sanity/schema-types/utilities/rich-text-type";
import { seoType } from "@/sanity/schema-types/utilities/seo-type";

export const schema: SchemaTypeDefinition[] = [
  // Base types that other types depend on
  basePageType,
  seoType,
  imageFieldType,
  richTextType,
  richTextNoImagesType,
  emailReferenceType,
  phoneReferenceType,

  // Module types
  textAndImageType,
  navigationType,
  footerType,

  // Document types
  globalSettingsType,
  homePageType,
  notFoundPageType,

  // Utility types
  redirectType,
  navigationLinkType,
  genericPageType,
  homepageHeroType,
  genericHeroType,
  textAndLinkBlockType,
  listModuleType,
  featureListType,
  quoteModuleType,
  ctaBlockType,
  contactModuleType,
  richTextModuleType,
  gridModuleType,
  imageGridType,
  priceListModuleType,
];
