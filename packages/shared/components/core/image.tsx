import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { ImageProps as NextImageProps } from "next/image";

import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import NextImage from "next/image";

type ImageWithAsset = {
  asset?: {
    url?: string | null;
    _ref?: string;
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
  if ((!image?.asset?.url && !image?.asset?._ref) || !image.alt)
    return null;

  // urlFor automatically applies crop and hotspot when present in the image object
  // Filter out null values to match SanityImageSource type
  const imageForUrl: SanityImageSource = {
    ...image,
    asset: image.asset || undefined,
    crop: image.crop || undefined,
    hotspot: image.hotspot || undefined,
  };

  const imageUrl = urlFor(imageForUrl)
    .auto("format")
    .url();

  return (
    <div className={cn("relative w-full h-full", className)}>
      <NextImage
        src={imageUrl}
        alt={image.alt}
        fill
        quality={80}
        sizes={sizes}
        {...props}
        className="object-cover"
      />
    </div>
  );
}

Image.displayName = "Image";

export { Image };
