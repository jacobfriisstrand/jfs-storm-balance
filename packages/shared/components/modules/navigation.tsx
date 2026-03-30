"use client";

import type { CONTACT_BUTTONS_QUERYResult, LOGO_QUERYResult, NAVIGATION_QUERYResult } from "@/sanity/types";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import ContactButtons from "@/components/ui/contact-buttons";
import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { Link } from "@/components/ui/link";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Paragraph } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { getNavigationHref, transformNavigationLinks } from "@/lib/utils/transform-navigation-link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import NextImage from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useReducer, useRef } from "react";

type NavVisibility = {
  isVisible: boolean;
  isNavigating: boolean;
  hiddenAtPosition: number | null;
  isMenuOpen: boolean;
};

type NavAction =
  | { type: "ROUTE_CHANGE" }
  | { type: "NAVIGATION_COMPLETE" }
  | { type: "SCROLL_UPDATE"; latest: number; previous: number }
  | { type: "SET_MENU"; open: boolean };

const HIDE_THRESHOLD = 200;
const SHOW_THRESHOLD = 20;
const SCROLL_UP_OFFSET = 200;

function navReducer(state: NavVisibility, action: NavAction): NavVisibility {
  switch (action.type) {
    case "ROUTE_CHANGE":
      return { ...state, isVisible: true, isNavigating: true, hiddenAtPosition: null, isMenuOpen: false };
    case "NAVIGATION_COMPLETE":
      return { ...state, isNavigating: false };
    case "SET_MENU":
      return { ...state, isMenuOpen: action.open };
    case "SCROLL_UPDATE": {
      const { latest, previous } = action;
      if (latest <= SHOW_THRESHOLD) {
        return { ...state, isVisible: true, hiddenAtPosition: null };
      }
      const isScrollingDown = latest > previous;
      const isScrollingUp = latest < previous;
      if (isScrollingDown && latest > HIDE_THRESHOLD) {
        return { ...state, isVisible: false, hiddenAtPosition: latest };
      }
      if (isScrollingUp && state.hiddenAtPosition !== null) {
        const scrollUpDistance = state.hiddenAtPosition - latest;
        if (scrollUpDistance >= SCROLL_UP_OFFSET) {
          return { ...state, isVisible: true, hiddenAtPosition: null };
        }
      }
      else if (isScrollingUp && state.hiddenAtPosition === null) {
        return { ...state, isVisible: true };
      }
      return state;
    }
    default:
      return state;
  }
}

export default function Navigation({ navigationData, logoData, contactButtonsData }: { navigationData: NAVIGATION_QUERYResult; logoData: LOGO_QUERYResult; contactButtonsData: CONTACT_BUTTONS_QUERYResult }) {
  const [{ isVisible, isNavigating, isMenuOpen }, dispatch] = useReducer(navReducer, {
    isVisible: true,
    isNavigating: false,
    hiddenAtPosition: null,
    isMenuOpen: false,
  });
  const isNavigatingRef = useRef(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  // Reset nav visibility on route change
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      isNavigatingRef.current = true;
      dispatch({ type: "ROUTE_CHANGE" });
    }
  }, [pathname]);

  useEffect(() => {
    if (isNavigating) {
      const timeout = setTimeout(() => {
        dispatch({ type: "NAVIGATION_COMPLETE" });
        isNavigatingRef.current = false;
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isNavigating]);

  // Handle scroll-based visibility
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (isNavigatingRef.current)
      return;
    const previous = scrollY.getPrevious() ?? 0;
    dispatch({ type: "SCROLL_UPDATE", latest, previous });
  });

  const transformedLinks = transformNavigationLinks(navigationData?.menu);

  const handleLinkClick = () => {
    dispatch({ type: "SET_MENU", open: false });
  };

  const navLinks = (
    <ul id="navigation-menu" className="w-full flex flex-col tablet:flex-row tablet:items-center justify-center max-tablet:gap-40 gap-20 desktop:gap-40 max-tablet:text-right max-tablet:px-16">
      {transformedLinks
        .filter(item => item.label)
        .map((item) => {
          const href = getNavigationHref(item);
          return (
            <li className="tablet:text-center" key={item.page?._ref ?? item.url}>
              <Link href={href} onClick={handleLinkClick}>{item.label}</Link>
            </li>
          );
        })}
      {navigationData?.contactButtonText && (
        <li className="max-tablet:w-full max-tablet:flex flex-1 [&>div]:max-tablet:w-full">
          {contactButtonsData?.email && contactButtonsData.copyEmailTooltipText && (
            <ContactButtons className="max-tablet:w-full" copyEmailTooltipText={contactButtonsData.copyEmailTooltipText} contactEmail={contactButtonsData.email} contactButtonText={navigationData?.contactButtonText} />
          )}
        </li>
      )}
    </ul>
  );

  return (
    <motion.div
      initial={false}
      animate={{ y: isVisible ? 0 : "-100%" }}
      transition={isNavigating
        ? { duration: 0 }
        : {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
            type: "tween",
          }}
      style={{ willChange: "transform" }}
      className="fixed top-0 left-0 right-0 z-60 pointer-events-auto"
    >
      <Container size="fluid" className="bg-dark tablet:flex tablet:items-center text-light max-tablet:h-(--navigation-height-mobile) tablet:h-(--navigation-height-desktop)">
        <Container className="max-tablet:contents">
          <Grid className="max-tablet:contents">
            <GridItem className="max-tablet:contents tablet:col-span-full">
              <header>
                <nav>
                  <div className="flex items-center justify-between relative py-8 tablet:py-16 gap-20">
                    <NextLink href="/" onClick={handleLinkClick} className="focus-visible:focus-outline flex items-center gap-8 tablet:text-center max-tablet:pl-16">
                      {logoData?.logo?.asset?.url && (
                        <NextImage src={logoData.logo.asset.url} alt="Logo" width={50} height={50} priority />
                      )}
                      {navigationData?.logoText && <Paragraph as="span" colorScheme="light" className="hidden desktop:block">{navigationData.logoText}</Paragraph>}
                    </NextLink>

                    {/* Desktop nav — inline links */}
                    <div className="hidden tablet:block">
                      {navLinks}
                    </div>

                    {/* Mobile nav — Sheet */}
                    <div className="tablet:hidden">
                      <HamburgerMenuButton onClick={() => dispatch({ type: "SET_MENU", open: !isMenuOpen })} className="px-16" isHamburgerMenuOpen={isMenuOpen} />
                      <Sheet open={isMenuOpen} onOpenChange={open => dispatch({ type: "SET_MENU", open })}>
                        <SheetContent
                          side="right"
                          showCloseButton={false}
                          onInteractOutside={e => e.preventDefault()}
                          className="bg-dark text-light w-full border-none grid place-items-end pb-32 pt-(--navigation-height-mobile)"
                        >
                          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                          {navLinks}
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                </nav>
              </header>
            </GridItem>
          </Grid>
        </Container>
      </Container>
    </motion.div>
  );
}

function HamburgerMenuButton({ onClick, className, isHamburgerMenuOpen }: ComponentProps<"button"> & { isHamburgerMenuOpen: boolean }) {
  return (
    <Button variant="hamburger" aria-controls="navigation-menu" aria-expanded={isHamburgerMenuOpen} className={cn("flex flex-col gap-4 py-12", className)} onClick={onClick}>
      <div className={cn("w-16 h-px bg-light transition-transform duration-640 ease-navigation", isHamburgerMenuOpen ? "rotate-45 translate-y-[5px]" : "rotate-0 translate-y-0")} />
      <div className={cn("w-16 h-px bg-light transition-[transform,opacity] duration-640 ease-navigation", isHamburgerMenuOpen ? "opacity-0" : "opacity-100")} />
      <div className={cn("w-16 h-px bg-light transition-transform duration-640 ease-navigation", isHamburgerMenuOpen ? "-rotate-45 -translate-y-[5px]" : "rotate-0 translate-y-0")} />
    </Button>
  );
}
