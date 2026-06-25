"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import AffiliateProvider from "@/components/affiliate/AffiliateProvider";

const AUTH_ROUTES = ["/signup", "/signin", "/subscribe", "/partners"];
const MINIMAL_ROUTES = ["/lp", "/admin", "/home"];

function isReaderRoute(pathname: string) {
  return (
    (pathname.includes("/story/") && pathname.endsWith("/read")) ||
    pathname.includes("/creator/episode-builder/draft/")
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isMinimal = MINIMAL_ROUTES.some((route) => pathname.startsWith(route));
  const isReader = isReaderRoute(pathname);
  const isCreate = pathname.startsWith("/create");
  const isCreator = pathname.startsWith("/creator");
  const isDraftReader = pathname.includes("/creator/episode-builder/draft/");
  const hideNav = isAuth || isMinimal || isReader || isCreator;
  const hideFooter = pathname === "/" || hideNav;
  const fixedViewport = isCreate || (isCreator && !isDraftReader);
  const isHome = pathname === "/";
  const showNav = !hideNav;
  /** Fixed navbar does not reserve layout space — offset content on non-home routes. */
  const navLayoutOffset = showNav && !isHome;

  return (
    <AnalyticsProvider>
      <AffiliateProvider>
      <div
        className={`flex flex-col ${
          fixedViewport ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"
        }`}
      >
        {showNav && <Navbar />}
        {navLayoutOffset ? (
          <div
            className="pointer-events-none shrink-0 h-16 md:h-[7.25rem] xl:h-16"
            aria-hidden
          />
        ) : null}
        <main
          className={`flex min-h-0 min-w-0 flex-1 flex-col ${
            fixedViewport ? "overflow-hidden" : ""
          }`}
        >
          {children}
        </main>
        {!hideFooter && !fixedViewport && <SiteFooter />}
      </div>
      </AffiliateProvider>
    </AnalyticsProvider>
  );
}
