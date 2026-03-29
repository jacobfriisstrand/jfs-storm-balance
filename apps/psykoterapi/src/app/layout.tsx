import "./styles/globals.css";

import type { Metadata } from "next";

import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { groq } from "next-sanity";

// TODO: Check if favicon and metadata should be here or in the (frontend) layout

async function getFavicon() {
  const globalSettings = await client.fetch(
    groq`*[_type == "globalSettings"][0]{
      favicon
    }`,
  );

  if (!globalSettings?.favicon) {
    return null;
  }

  return urlFor(globalSettings.favicon)
    .width(32)
    .height(32)
    .format("png")
    .url();
}

export async function generateMetadata(): Promise<Metadata> {
  const faviconUrl = await getFavicon();

  return {
    icons: faviconUrl
      ? {
          icon: faviconUrl,
          shortcut: faviconUrl,
          apple: faviconUrl,
        }
      : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-background grid min-h-dvh grid-rows-[auto_1fr_auto]"
      >
        {children}
      </body>
    </html>
  );
}
