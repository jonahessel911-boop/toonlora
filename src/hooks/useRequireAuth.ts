"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  appendAffiliateToHref,
  getStoredAffiliateSlug,
} from "@/lib/affiliate/client-tracking";
import { buildAuthHref } from "@/lib/reader/nextEpisodeGate";
import { useUserStore } from "@/store/useUserStore";

type AuthPath = "/signin" | "/signup/register";

/** Redirect guests to sign-in before account-backed actions (My List, reactions, etc.). */
export function useRequireAuth() {
  const { email } = useUserStore();
  const router = useRouter();
  const loggedIn = Boolean(email);

  const requireAuth = useCallback(
    (returnTo?: string, authPath: AuthPath = "/signin") => {
      if (loggedIn) return true;

      const fallback =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/";
      const target = returnTo ?? fallback;
      const affiliate = getStoredAffiliateSlug();
      const href = appendAffiliateToHref(
        buildAuthHref(authPath, target, affiliate),
        affiliate
      );
      router.push(href);
      return false;
    },
    [loggedIn, router]
  );

  return { loggedIn, requireAuth };
}
