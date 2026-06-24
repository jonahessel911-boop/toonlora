"use client";

import { useEffect } from "react";
import {
  captureAffiliateFromUrl,
  persistAffiliateSlug,
} from "@/lib/affiliate/client-tracking";

/** Persists ?aff=slug from the URL for signup attribution (30-day window). */
export default function AffiliateCapture() {
  useEffect(() => {
    const slug = captureAffiliateFromUrl(
      new URLSearchParams(window.location.search)
    );
    if (slug) persistAffiliateSlug(slug);
  }, []);

  return null;
}
