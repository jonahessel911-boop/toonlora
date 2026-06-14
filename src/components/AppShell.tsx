"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

const AUTH_ROUTES = ["/signup", "/signin"];
const MINIMAL_ROUTES = ["/lp"];

function isReaderRoute(pathname: string) {
  return pathname.includes("/story/") && pathname.endsWith("/read");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isMinimal = MINIMAL_ROUTES.some((route) => pathname.startsWith(route));
  const isReader = isReaderRoute(pathname);
  const hideNav = isAuth || isMinimal || isReader;

  return (
    <>
      {!hideNav && <Navbar />}
      <main
        className={
          hideNav
            ? "min-h-[100dvh]"
            : "min-h-[100dvh]"
        }
      >
        {children}
      </main>
    </>
  );
}
