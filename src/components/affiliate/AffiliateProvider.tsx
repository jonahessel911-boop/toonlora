"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";
import { syncAffiliateFromSearchParams } from "@/lib/affiliate/client-tracking";

function AffiliateSync() {
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    syncAffiliateFromSearchParams(params);
  }, [pathname]);

  return null;
}

/** Captures ?aff= from the URL for attribution — does not inject affiliate params on its own. */
export default function AffiliateProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AffiliateSync />
      </Suspense>
      {children}
    </>
  );
}
