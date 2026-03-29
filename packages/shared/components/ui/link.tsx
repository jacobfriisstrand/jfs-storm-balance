import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";
import NextLink from "next/link";

type LinkProps = ComponentPropsWithRef<typeof NextLink> & {
};

function Link({ className, children, ref, ...props }: LinkProps) {
  return (
    <NextLink
      ref={ref}
      className={cn(
        className,
        "focus-visible:focus-outline relative before:absolute before:-bottom-4 before:left-0 before:content-[''] before:h-px before:w-full before:bg-current before:transition-[scale] before:duration-normal before:scale-x-0 before:origin-bottom-left hover:before:scale-x-100",
      )}
      {...props}
    >
      {children}
    </NextLink>
  );
}

Link.displayName = "Link";

export { Link };
