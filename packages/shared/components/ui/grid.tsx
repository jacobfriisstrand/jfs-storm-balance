import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

type GridProps = ComponentPropsWithRef<"div"> & {
  asChild?: boolean;
};

type GridItemProps = ComponentPropsWithRef<"div"> & {
  asChild?: boolean;
};

function GridItem({ className, asChild = false, ref, ...props }: GridItemProps) {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      ref={ref}
      className={cn("component-grid-item col-span-full", className)}
      {...props}
    />
  );
}

function Grid({ className, asChild = false, ...props }: GridProps) {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      className={cn(
        `component-grid tablet:grid-cols-12 tablet:gap-x-8 desktop:gap-x-12 mx-20 grid grid-cols-4 gap-x-4`,
        className,
      )}
      {...props}
    />
  );
}

export { Grid, GridItem };
