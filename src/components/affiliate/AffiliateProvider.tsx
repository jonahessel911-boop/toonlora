"use client";

import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";
import {
  appendAffiliateToHref,
  getStoredAffiliateSlug,
  syncAffiliateFromSearchParams,
} from "@/lib/affiliate/client-tracking";
import { AFFILIATE_QUERY_PARAM } from "@/lib/affiliate/links";

function AffiliateSync() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = syncAffiliateFromSearchParams(params);

    if (params.has(AFFILIATE_QUERY_PARAM)) {
      return;
    }

    const stored = slug ?? getStoredAffiliateSlug();
    if (!stored) return;

    const search = window.location.search;
    const current = `${pathname}${search && search !== "?" ? search : ""}`;
    const withAff = appendAffiliateToHref(current, stored);
    if (withAff === current) return;

    router.replace(withAff, { scroll: false });
  }, [pathname, router]);

  return null;
}

/** Keeps affiliate slug in sync with URL + localStorage on every navigation. */
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
