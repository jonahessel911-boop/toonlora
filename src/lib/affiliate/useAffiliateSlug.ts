"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  appendAffiliateToHref,
  syncAffiliateFromSearchParams,
} from "@/lib/affiliate/client-tracking";

export function useAffiliateSlug(): string | null {
  const pathname = usePathname();
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSlug(syncAffiliateFromSearchParams(params));
  }, [pathname]);

  return slug;
}

export function useAffiliateHref(href: string): string {
  const slug = useAffiliateSlug();
  return useMemo(() => appendAffiliateToHref(href, slug), [href, slug]);
}
