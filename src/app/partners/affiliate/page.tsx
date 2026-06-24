import type { Metadata } from "next";
import { Suspense } from "react";
import AffiliateSignupPageClient from "@/components/partners/AffiliateSignupPageClient";

export const metadata: Metadata = {
  title: "Affiliate Program — Toonlora",
  description: "Earn money for every signup you refer to Toonlora.",
};

export default function AffiliatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#667085]">
          Loading…
        </div>
      }
    >
      <AffiliateSignupPageClient />
    </Suspense>
  );
}
