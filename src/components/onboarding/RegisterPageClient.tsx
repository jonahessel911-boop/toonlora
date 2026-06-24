"use client";

import { useSearchParams } from "next/navigation";
import SignupOnboardingFlow from "@/components/signup/SignupOnboardingFlow";
import { buildAuthHref, sanitizeReturnTo } from "@/lib/reader/nextEpisodeGate";

export default function RegisterPageClient() {
  const searchParams = useSearchParams();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));
  const signinHref = returnTo ? buildAuthHref("/signin", returnTo) : "/signin";

  return (
    <SignupOnboardingFlow
      formType="register"
      returnTo={returnTo}
      signinHref={signinHref}
      backHref="/"
    />
  );
}
