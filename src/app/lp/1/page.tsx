import type { Metadata } from "next";
import LandingPageClient from "@/components/lp/LandingPageClient";
import { BRAND_SUBHEADLINE } from "@/lib/brand";
import { PLATFORM_FULL_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: PLATFORM_FULL_NAME,
  description: BRAND_SUBHEADLINE,
};

export default function LandingPage1() {
  return <LandingPageClient />;
}
