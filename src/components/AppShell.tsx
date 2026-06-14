"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";

const AUTH_ROUTES = ["/signup", "/signin"];
const MINIMAL_ROUTES = ["/lp", "/admin"];

function isReaderRoute(pathname: string) {
  return pathname.includes("/story/") && pathname.endsWith("/read");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isMinimal = MINIMAL_ROUTES.some((route) => pathname.startsWith(route));
  const isReader = isReaderRoute(pathname);
  const isCreate = pathname.startsWith("/create");
  const hideNav = isAuth || isMinimal || isReader;

  return (
    <AnalyticsProvider>
      <div className={`flex flex-col ${isCreate ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"}`}>
        {!hideNav && <Navbar />}
        <main
          className={`flex min-h-0 min-w-0 flex-1 flex-col ${isCreate ? "overflow-hidden" : ""}`}
        >
          {children}
        </main>
      </div>
    </AnalyticsProvider>
  );
}
