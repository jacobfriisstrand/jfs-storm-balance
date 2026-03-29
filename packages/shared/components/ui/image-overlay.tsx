import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

export const imageOverlayVariants = cva("absolute inset-0", {
  variants: {
    colorScheme: {
      light: "from-background",
      dark: "from-dark",
    },
    orientation: {
      fromBottom: "bg-linear-to-t to-75%",
      fromTop: "bg-linear-to-b to-75%",
      fromLeft: "bg-linear-to-l to-75%",
      fromRight: "bg-linear-to-r to-75%",
      none: "",
    },
  },
  defaultVariants: {
    colorScheme: "dark",
    orientation: "fromBottom",
  },
});

function ImageOverlay({
  className,
  colorScheme,
  orientation,
  ...props
}: VariantProps<typeof imageOverlayVariants> & ComponentProps<"div">) {
  return (
    <div className={cn(imageOverlayVariants({ colorScheme, orientation }), className)} {...props}>
    </div>
  );
}
ImageOverlay.displayName = "ImageOverlay";

export { ImageOverlay };
