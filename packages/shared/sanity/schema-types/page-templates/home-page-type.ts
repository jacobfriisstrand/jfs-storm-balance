import { apiVersion } from "@/sanity/env";
import { client } from "@/sanity/lib/client";
import { basePageBuilder } from "@/sanity/schema-types/page-templates/base-page-builder";
import { basePageType } from "@/sanity/schema-types/page-templates/base-page-type";
import { defineField, defineType } from "sanity";

export const studioClient = client.withConfig({ apiVersion });

const homePageModules = ["textAndImage", "homepageHero", "textAndLinkBlock", "listModule", "featureList", "quoteModule", "ctaBlock", "contactModule", "richTextModule", "gridModule", "imageGrid", "priceListModule"];

export const homePageType = defineType({
  name: "homePage",
  title: "Forside",
  type: "document",
  icon: () => "🏡",
  fields: [
    ...basePageType.fields,
    defineField({
      ...basePageBuilder(homePageModules, "homepageHero"),
    }),
  ],
  preview: basePageType.preview,
});
