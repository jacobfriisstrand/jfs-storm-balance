import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

const containerVariants = cva(
  "mx-auto",
  {
    variants: {
      size: {
        default: "max-w-container",
        fluid: "max-w-full",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type ContainerProps = ComponentPropsWithoutRef<"section"> &
  VariantProps<typeof containerVariants> & {
    asChild?: boolean;
    fluid?: boolean;
  };

function Container({
  className,
  size,
  asChild = false,
  ...props
}: ContainerProps) {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      className={cn(
        "component-container",
        "w-full",
        containerVariants({ size }),
        className,
      )}
      {...props}
    />
  );
}

export { Container };
