import type { Metadata } from "next";
import { Suspense } from "react";
import RequireAuthGate from "@/components/auth/RequireAuthGate";
import BrowseHome from "@/components/home/BrowseHome";
import { BRAND_SUBHEADLINE } from "@/lib/brand";
import { PLATFORM_FULL_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: PLATFORM_FULL_NAME,
  description: BRAND_SUBHEADLINE,
};

function HomeLoading() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#07111F]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-[#2F80ED]" />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <RequireAuthGate returnTo="/">
        <BrowseHome />
      </RequireAuthGate>
    </Suspense>
  );
}
