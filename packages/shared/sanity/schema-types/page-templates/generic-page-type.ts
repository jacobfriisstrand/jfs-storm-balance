import { apiVersion } from "@/sanity/env";
import { client } from "@/sanity/lib/client";
import { basePageBuilder } from "@/sanity/schema-types/page-templates/base-page-builder";
import { defineField, defineType } from "sanity";

import { basePageType } from "./base-page-type";

export const studioClient = client.withConfig({ apiVersion });

const genericPageModules = ["textAndImage", "genericHero", "textAndLinkBlock", "listModule", "featureList", "quoteModule", "ctaBlock", "contactModule", "richTextModule", "gridModule", "imageGrid", "priceListModule"];

export const genericPageType = defineType({
  name: "genericPage",
  title: "Generisk side",
  type: "document",
  icon: () => "📄",
  fields: [
    ...basePageType.fields,
    defineField({
      ...basePageBuilder(genericPageModules, "genericHero"),
    }),
  ],
  preview: basePageType.preview,
});
