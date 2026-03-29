import type { Thing, WithContext } from "schema-dts";

/**
 * This component provides a reusable way to add structured data (JSON-LD) to your pages.
 *
 * ## TypeScript Types from schema-dts
 *
 * The `schema-dts` package provides TypeScript definitions for all Schema.org structured data types.
 * These types ensure your structured data follows the correct schema and provides proper type checking.
 *
 * ### Common Types:
 * - `Article`: For blog posts, news articles, etc.
 * - `Product`: For e-commerce products
 * - `Organization`: For company/business information
 * - `Person`: For individual people
 * - `FAQPage`: For FAQ sections
 * - `BreadcrumbList`: For navigation breadcrumbs
 * - `WebSite`: For website information
 * - `LocalBusiness`: For business locations
 *
 * ### Usage with TypeScript:
 * ```tsx
 * import { Article, WithContext } from "schema-dts";
 *
 * // Define your data with proper typing
 * const articleData: WithContext<Article> = {
 *   "@context": "https://schema.org",
 *   "@type": "Article",
 *   "headline": "Article Title",
 *   "author": {
 *     "@type": "Person",
 *     "name": "Author Name"
 *   }
 * };
 *
 * // Use the component with typed data
 * <StructuredData data={articleData} />
 * ```
 *
 * See the faqs.tsx file for an example of how to use this component.
 *
 * For more information on available types and properties, visit:
 * - [Schema.org Documentation](https://schema.org/docs/schemas.html)
 * - [schema-dts GitHub Repository](https://github.com/google/schema-dts)
 */

type JSONLDProps<T extends Thing> = {
  data: WithContext<T>;
};

/**
 * A reusable component for adding structured data to pages
 * @example
 * <JSONLD
 *   data={{
 *     "@context": "https://schema.org",
 *     "@type": "FAQPage",
 *     "mainEntity": [...]
 *   }}
 * />
 */
export function JSONLD<T extends Thing>({ data }: JSONLDProps<T>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
