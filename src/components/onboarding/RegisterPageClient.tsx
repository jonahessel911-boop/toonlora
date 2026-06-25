"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SignupOnboardingFlow from "@/components/signup/SignupOnboardingFlow";
import { buildAuthHref, sanitizeReturnTo } from "@/lib/reader/nextEpisodeGate";
import { useUserStore } from "@/store/useUserStore";

export default function RegisterPageClient() {
  const searchParams = useSearchParams();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));
  const signinHref = returnTo ? buildAuthHref("/signin", returnTo) : "/signin";
  const setProfile = useUserStore((s) => s.setProfile);

  useEffect(() => {
    const emailParam = searchParams.get("email")?.trim();
    if (emailParam) setProfile({ email: emailParam });
  }, [searchParams, setProfile]);

  return (
    <SignupOnboardingFlow
      formType="register"
      returnTo={returnTo}
      signinHref={signinHref}
      backHref="/"
    />
  );
}
