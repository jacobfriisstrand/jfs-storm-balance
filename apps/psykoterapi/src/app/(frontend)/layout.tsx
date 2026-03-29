import { DisableDraftMode } from "@/components/core/disable-draft-mode";
import { ScrollToTop } from "@/components/core/scroll-to-top";
import Footer from "@/components/modules/footer";
import Navigation from "@/components/modules/navigation";
import { TouchProvider } from "@/contexts/touch-context";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { CONTACT_BUTTONS_QUERY, FOOTER_INFO_QUERY, FOOTER_QUERY, LOGO_QUERY, NAVIGATION_QUERY } from "@/sanity/lib/queries";
import { VisualEditing } from "next-sanity/visual-editing";
import { draftMode } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: navigationData } = await sanityFetch({
    query: NAVIGATION_QUERY,
  });

  const { data: logoData } = await sanityFetch<typeof LOGO_QUERY>({ query: LOGO_QUERY });

  const { data: contactButtonsData } = await sanityFetch<typeof CONTACT_BUTTONS_QUERY>({ query: CONTACT_BUTTONS_QUERY });

  const { data: footerData } = await sanityFetch<typeof FOOTER_QUERY>({ query: FOOTER_QUERY });

  const { data: footerInfoData } = await sanityFetch<typeof FOOTER_INFO_QUERY>({ query: FOOTER_INFO_QUERY });

  return (
    <TouchProvider>
      <ScrollToTop />
      <Navigation navigationData={navigationData} logoData={logoData} contactButtonsData={contactButtonsData} />
      {children}
      <Footer footerData={footerData} footerInfoData={footerInfoData} />
      <SanityLive />
      {(await draftMode()).isEnabled && (
        <>
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
    </TouchProvider>
  );
}
