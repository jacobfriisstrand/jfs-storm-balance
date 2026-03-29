import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import Link from "next/link";
import * as React from "react";

const buttonVariants = cva(
  "border px-24 text-center py-8 rounded-base focus-visible:focus-outline cursor-pointer active:scale-95 duration-normal",
  {
    variants: {
      variant: {
        primary: "bg-brand text-light border-light hover:bg-light hover:text-brand hover:border-brand",
        secondary: "bg-light text-brand border-brand hover:bg-brand hover:text-light",
        hamburger: "bg-transparent text-light border-transparent active:scale-none p-0",
        icon: "bg-transparent text-light border-transparent p-0",
      },
      size: {
        default: "text-xs tablet:text-sm",
        small: "text-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type BaseButtonProps = VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
  className?: string;
};

type ButtonProps = BaseButtonProps & {
  href?: never;
} & React.ComponentProps<"button">;

type LinkButtonProps = BaseButtonProps & {
  href: string;
} & Omit<React.ComponentProps<typeof Link>, "href">;

function Button({
  className,
  variant,
  size,
  asChild = false,
  href,
  ...props
}: ButtonProps | LinkButtonProps) {
  if (href) {
    return (
      <Link
        data-slot="button"
        className={cn(buttonVariants({ variant, size }), "grid place-items-center", className)}
        href={href}
        {...(props as Omit<React.ComponentProps<typeof Link>, "href">)}
      />
    );
  }

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...(props as React.ComponentProps<"button">)}
    />
  );
}

export { Button, buttonVariants };
