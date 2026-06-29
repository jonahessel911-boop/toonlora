"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  appendAffiliateToHref,
  getAffiliateSlugForLinks,
} from "@/lib/affiliate/client-tracking";
import { buildAuthHref } from "@/lib/reader/nextEpisodeGate";
import { useUserStore } from "@/store/useUserStore";

interface RequireAuthGateProps {
  children: React.ReactNode;
  returnTo?: string;
}

export default function RequireAuthGate({
  children,
  returnTo = "/",
}: RequireAuthGateProps) {
  const router = useRouter();
  const email = useUserStore((state) => state.email);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finish = () => setReady(true);

    if (useUserStore.persist.hasHydrated()) {
      finish();
      return;
    }

    const unsub = useUserStore.persist.onFinishHydration(finish);
    return unsub;
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (email) return;

    const affiliate = getAffiliateSlugForLinks();
    const href = appendAffiliateToHref(
      buildAuthHref("/signin", returnTo, affiliate),
      affiliate
    );
    router.replace(href);
  }, [ready, email, returnTo, router]);

  if (!ready || !email) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#07111F]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-[#2F80ED]" />
      </div>
    );
  }

  return children;
}
