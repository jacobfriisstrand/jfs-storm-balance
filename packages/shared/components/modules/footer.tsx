"use client";

import type { FOOTER_INFO_QUERYResult, FOOTER_QUERYResult } from "@/sanity/types";

import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { Link } from "@/components/ui/link";
import { getNavigationHref, transformNavigationLinks } from "@/lib/utils/transform-navigation-link";
import FooterCorner from "@shared/assets/footer-corners.svg";
import { Phone, Send } from "lucide-react";

export default function Footer({ footerData, footerInfoData }: { footerData: FOOTER_QUERYResult; footerInfoData: FOOTER_INFO_QUERYResult }) {
  const transformedLinks = transformNavigationLinks(footerData?.menu);

  return (
    <Container className="py-20 mt-80 tablet:mt-180">
      <footer>
        <Grid className="gap-y-32 tablet:gap-y-60">
          <GridItem className="flex justify-between *:w-44">
            <FooterCorner aria-hidden="true" />
            <FooterCorner aria-hidden="true" className="scale-x-[-1]" />
          </GridItem>
          <GridItem className="tablet:col-span-6">
            <ul className="space-y-24">
              {transformedLinks
                .filter(link => link.label)
                .map((link) => {
                  const href = getNavigationHref(link);
                  return (
                    <li key={link.page?._ref ?? link.url}>
                      <Link key={link.page?._ref ?? link.url} href={href}>
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </GridItem>
          <GridItem className="col-span-1 row-start-3 tablet:hidden">
            <div className="h-px w-full bg-dark"></div>
          </GridItem>
          <GridItem className="space-y-24 tablet:space-y-0 tablet:flex tablet:justify-between tablet:items-end">
            <div className="space-y-8">
              {footerInfoData?.addresses?.map(addr => (
                <address key={addr._key} className="not-italic">
                  {addr?.streetName && (
                    <span>
                      {addr.streetName}
                      {" "}
                    </span>
                  )}
                  {addr?.streetNumber && (
                    <span>
                      {addr.streetNumber}
                      {", "}
                    </span>
                  )}
                  {addr?.floor && (
                    <span>
                      {addr.floor}
                      {" "}
                    </span>
                  )}
                  {addr?.zipCode && (
                    <span>
                      {addr.zipCode}
                      {" "}
                    </span>
                  )}
                  {addr?.city && <span>{addr.city}</span>}
                </address>
              ))}
            </div>
            <div className="flex items-center gap-8">
              <Send strokeWidth={1.5} className="w-16 h-16 text-dark" />
              <p>{footerInfoData?.email}</p>
            </div>
            <div className="flex items-center gap-8">
              <Phone strokeWidth={1.5} className="w-16 h-16 text-dark" />
              <p>{footerInfoData?.phone}</p>
            </div>
            <p>
              <span>{footerInfoData?.vatNumber?.vatNumberHeading}</span>
              {" "}
              <span>{footerInfoData?.vatNumber?.vatNumber}</span>
            </p>
            <p>{footerInfoData?.copyright}</p>
          </GridItem>
        </Grid>
      </footer>
    </Container>
  );
}
