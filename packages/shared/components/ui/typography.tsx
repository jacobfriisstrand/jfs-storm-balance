import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

export const headingVariants = cva("tracking-tight", {
  variants: {
    size: {
      h1: "text-5xl tablet:text-6xl leading-none",
      h2: "text-3xl tablet:text-4xl leading-none",
      h3: "text-xl tablet:text-2xl leading-none",
      h4: "text-md tablet:text-lg leading-none",
    },
    colorScheme: {
      light: "text-light",
      dark: "text-dark",
    },
    font: {
      sans: "font-sans",
      serif: "font-serif",
    },
  },
  defaultVariants: {
    size: "h1",
    colorScheme: "light",
    font: "serif",
  },
});

type HeadingProps = ComponentPropsWithRef<"h1"> &
  VariantProps<typeof headingVariants> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  };

function Heading({
  className,
  children,
  size,
  colorScheme,
  font,
  ref,
  as = "h2",
  ...props
}: HeadingProps) {
  const Component = as;

  return (
    <Component
      className={cn(headingVariants({ size, colorScheme, font }), className)}
      ref={ref}
      {...props}
    >
      {children}
    </Component>
  );
}

export const paragraphVariants = cva("leading-24 text-balance", {
  variants: {
    size: {
      default: "text-xs tablet:text-sm",
    },
    colorScheme: {
      light: "text-light",
      dark: "text-dark",
    },
  },
  defaultVariants: {
    size: "default",
    colorScheme: "dark",
  },
});

type ParagraphProps = ComponentPropsWithRef<"p"> &
  VariantProps<typeof paragraphVariants> & {
    as?: "p" | "span" | "small";
  };

function Paragraph({
  className,
  children,
  size,
  colorScheme,
  ref,
  as = "p",
  ...props
}: ParagraphProps) {
  const Component = as;

  return (
    <Component
      className={cn(paragraphVariants({ size, colorScheme }), className)}
      ref={ref}
      {...props}
    >
      {children}
    </Component>
  );
}

export { Heading, Paragraph };
