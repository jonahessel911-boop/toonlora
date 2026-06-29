"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getStoredAffiliateSlug,
  syncAffiliateFromSearchParams,
} from "@/lib/affiliate/client-tracking";

/** Stored affiliate slug for signup attribution (not for URL decoration). */
export function useAffiliateSlug(): string | null {
  const pathname = usePathname();
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    syncAffiliateFromSearchParams(new URLSearchParams(window.location.search));
    setSlug(getStoredAffiliateSlug());
  }, [pathname]);

  return slug;
}

export function useAffiliateHref(href: string): string {
  return href;
}
