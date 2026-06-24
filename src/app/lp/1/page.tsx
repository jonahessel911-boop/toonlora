import type { Metadata } from "next";
import LandingPageClient from "@/components/lp/LandingPageClient";
import { BRAND_HEADLINE, BRAND_SUBHEADLINE } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Toonlora — ${BRAND_HEADLINE}`,
  description: BRAND_SUBHEADLINE,
};

export default function LandingPage1() {
  return <LandingPageClient />;
}
