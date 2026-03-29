import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import createImageUrlBuilder from "@sanity/image-url";

import { dataset, projectId } from "../env";

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
