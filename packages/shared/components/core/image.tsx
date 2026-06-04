import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { ImageProps as NextImageProps } from "next/image";

import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import { stegaClean } from "@sanity/client/stega";
import NextImage from "next/image";

type ImageWithAsset = {
  asset?: {
    url?: string | null;
    _ref?: string | null;
  } | null;
  alt?: string | null;
  crop?: {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
  } | null;
  hotspot?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  } | null;
};

type Props = Omit<NextImageProps, "src" | "alt"> & {
  image: ImageWithAsset;
};

function Image({
  image,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  ...props
}: Props) {
  // stegaClean unwraps visual editing proxy objects so crop/hotspot are real objects
  const cleanImage = stegaClean(image);

  if ((!cleanImage?.asset?.url && !cleanImage?.asset?._ref) || !cleanImage.alt)
    return null;

  // urlFor automatically applies crop and hotspot when present in the image object
  // Filter out null values to match SanityImageSource type
  const imageForUrl: SanityImageSource = {
    ...cleanImage,
    asset: cleanImage.asset || undefined,
    crop: cleanImage.crop || undefined,
    hotspot: cleanImage.hotspot || undefined,
  };

  const imageUrl = urlFor(imageForUrl)
    .auto("format")
    .url();

  // When hotspot is set but no crop is applied (user set focal point in Sanity
  // without a manual crop), use CSS object-position to center the hotspot area.
  // When crop IS set, the CDN already applies ?rect= — no CSS override needed.
  const hasCrop = !!cleanImage.crop
    && (cleanImage.crop.top !== 0
      || cleanImage.crop.left !== 0
      || cleanImage.crop.bottom !== 0
      || cleanImage.crop.right !== 0);

  const hotspotStyle
    = !hasCrop && cleanImage.hotspot?.x != null && cleanImage.hotspot?.y != null
      ? {
          objectPosition: `${cleanImage.hotspot.x * 100}% ${cleanImage.hotspot.y * 100}%`,
        }
      : undefined;

  return (
    <div className={cn("relative w-full h-full", className)}>
      <NextImage
        src={imageUrl}
        alt={cleanImage.alt}
        fill
        quality={80}
        sizes={sizes}
        style={hotspotStyle}
        {...props}
        className="object-cover"
      />
    </div>
  );
}

Image.displayName = "Image";

export { Image };
