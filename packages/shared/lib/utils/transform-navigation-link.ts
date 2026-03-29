import type { NavigationLink } from "@/sanity/types";

type SanityNavigationLink = {
  _type: "navigationLink";
  label: string | null | undefined;
  linkType: "internal" | "external" | null | undefined;
  url: string | null | undefined;
  page: {
    _id: string;
    _type: string;
    slug: string | null;
  } | null | undefined;
};

export type ExtendedNavigationLink = NavigationLink & {
  page?: {
    _ref: string;
    _type: "reference";
    _weak: boolean;
    slug?: string;
  };
};

export function getNavigationHref(link: ExtendedNavigationLink): string {
  if (link.linkType === "internal" && link.page?.slug) {
    return `/${link.page.slug}`;
  }
  return link.url || "/";
}

export type InputLink = NavigationLink | SanityNavigationLink;

export function transformNavigationLinks(links: InputLink[] | null | undefined): ExtendedNavigationLink[] {
  if (!links)
    return [];

  return links
    .filter((link): link is NonNullable<typeof link> => link != null)
    .map((link) => {
      const base = {
        label: (link as any).label ?? undefined,
        linkType: (link as any).linkType ?? undefined,
        url: (link as any).url ?? undefined,
      } as Pick<ExtendedNavigationLink, "label" | "linkType" | "url">;

      const page = (link as any).page;

      // Case 1: Expanded page object with `_id` and `slug` (from GROQ projection)
      if (page && typeof page === "object" && "_id" in page) {
        return {
          ...(link as any),
          ...base,
          page: {
            _ref: (page as { _id: string })._id,
            _type: "reference" as const,
            _weak: false,
            slug: (page as { slug: string | null | undefined }).slug ?? undefined,
          },
        } as ExtendedNavigationLink;
      }

      // Case 2: Reference already (from generated types)
      if (page && typeof page === "object" && "_ref" in page) {
        return {
          ...(link as any),
          ...base,
          page: {
            _ref: (page as { _ref: string })._ref,
            _type: "reference" as const,
            _weak: Boolean((page as { _weak?: boolean })._weak),
            // slug unknown in this shape
          },
        } as ExtendedNavigationLink;
      }

      // No page
      return {
        ...(link as any),
        ...base,
        page: undefined,
      } as ExtendedNavigationLink;
    });
}
