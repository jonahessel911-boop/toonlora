"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ttqPageView } from "@/lib/analytics/ttq";

/** Sends SPA route changes to TikTok after the base pixel loads in layout.tsx. */
export default function TikTokPixel() {
  const pathname = usePathname();

  useEffect(() => {
    ttqPageView();
  }, [pathname]);

  return null;
}
