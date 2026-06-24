"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import AffiliateCapture from "@/components/affiliate/AffiliateCapture";

const AUTH_ROUTES = ["/signup", "/signin", "/subscribe", "/partners"];
const MINIMAL_ROUTES = ["/lp", "/admin"];

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
  const fixedViewport = isCreate || (isCreator && !isDraftReader);

  return (
    <AnalyticsProvider>
      <AffiliateCapture />
      <div
        className={`flex flex-col ${
          fixedViewport ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"
        }`}
      >
        {!hideNav && <Navbar />}
        <main
          className={`flex min-h-0 min-w-0 flex-1 flex-col ${
            fixedViewport ? "overflow-hidden" : ""
          }`}
        >
          {children}
        </main>
        {!hideNav && !fixedViewport && <SiteFooter />}
      </div>
    </AnalyticsProvider>
  );
}
