import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { isValidAffiliateSlug, normalizeAffiliateSlug } from "@/lib/affiliate/slug";
import { isServerDatabaseConfigured } from "@/lib/config";
import { sendSignupWelcomeEmail } from "@/lib/email/sendSignupWelcome";
import { isValidCountryCode } from "@/lib/countries";
import {
  getActiveAffiliateBySlug,
  recordAffiliateSignupConversion,
} from "@/lib/services/affiliate-repository";
import { registerProfileInDb } from "@/lib/services/profile-repository";
import { recordLoginEvent } from "@/lib/services/analytics-repository";

export async function POST(request: Request) {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            "Database not configured. Add Supabase env vars and set NEXT_PUBLIC_USE_DATABASE=true.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();

    const countryCode = String(body.countryCode ?? "").trim().toUpperCase();

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      );
    }

    if (!countryCode || !isValidCountryCode(countryCode)) {
      return NextResponse.json(
        { error: "Please select a valid country." },
        { status: 400 }
      );
    }

    const sessionId = getSessionFromRequest(request);
    const { profile, isNew } = await registerProfileInDb(sessionId, {
      fullName,
      email,
      countryCode,
      wantsRecommendations: body.wantsRecommendations !== false,
      wantsWeeklyNewsletter: Boolean(body.wantsWeeklyNewsletter),
      newsletterTopics: Array.isArray(body.newsletterTopics)
        ? body.newsletterTopics.filter(
            (topic: unknown): topic is string => typeof topic === "string"
          )
        : [],
    });

    await recordLoginEvent(profile.id, "signup");

    if (isNew) {
      const affiliateSlug = normalizeAffiliateSlug(
        String(body.affiliateSlug ?? "")
      );
      if (isValidAffiliateSlug(affiliateSlug)) {
        const affiliate = await getActiveAffiliateBySlug(affiliateSlug);
        if (affiliate) {
          try {
            await recordAffiliateSignupConversion({
              affiliateId: affiliate.id,
              profileId: profile.id,
              countryCode,
            });
          } catch (err) {
            console.error(
              "[toonlora] Affiliate signup conversion failed:",
              err instanceof Error ? err.message : err
            );
          }
        }
      }

      try {
        await sendSignupWelcomeEmail(email);
      } catch (err) {
        console.error(
          "[toonlora] Welcome email failed:",
          err instanceof Error ? err.message : err
        );
      }
    }

    return NextResponse.json({ profile, source: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    const friendly = message.includes("profiles_email_key")
      ? "This email is already registered. Sign in instead."
      : message.includes("profiles_session_id_key")
        ? "Could not create account for this browser session. Try again."
        : message;

    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
