import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import { resolveSignupCountryCode } from "@/lib/signup/country";
import { deriveDisplayNameFromEmail } from "@/lib/newsletter";
import {
  markSubscriptionWelcomeSent,
  sendSubscriptionWelcomeEmail,
  wasSubscriptionWelcomeSent,
} from "@/lib/email/sendSubscriptionWelcome";
import { getClientIp } from "@/lib/request/client-ip";
import { registerProfileInDb } from "@/lib/services/profile-repository";
import { recordLoginEvent } from "@/lib/services/analytics-repository";
import {
  getSubscriptionFromDb,
  isActiveSubscription,
  setSubscriptionInDb,
  transferSubscriptionBetweenSessions,
} from "@/lib/services/subscription-repository";
import { getSubscriptionPeriodEnd } from "@/lib/payments/stripe-subscription";
import { getStripe, isStripeConfigured } from "@/lib/services/stripe";

export async function POST(request: Request) {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured." }, { status: 503 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
    }

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const subscriptionId =
      typeof body.subscriptionId === "string" ? body.subscriptionId.trim() : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const sessionId = getSessionFromRequest(request);
    const stripe = getStripe();

    let subscription = subscriptionId
      ? await stripe.subscriptions.retrieve(subscriptionId, { expand: ["customer"] })
      : null;

    if (subscription && subscription.metadata?.sessionId !== sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const sessionSub = await getSubscriptionFromDb(sessionId);
    if (!subscription && sessionSub.stripeSubscriptionId) {
      subscription = await stripe.subscriptions.retrieve(
        sessionSub.stripeSubscriptionId,
        { expand: ["customer"] }
      );
    }

    if (
      !isActiveSubscription(sessionSub) &&
      subscription &&
      subscription.status !== "active" &&
      subscription.status !== "trialing"
    ) {
      return NextResponse.json(
        { error: "No active subscription found for this session." },
        { status: 400 }
      );
    }

    const planId =
      subscription?.metadata?.planId ??
      sessionSub.planId ??
      null;

    if (!planId) {
      return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
    }

    const countryCode = resolveSignupCountryCode(
      request,
      body.countryCode ? String(body.countryCode) : null
    );
    const signupIp = getClientIp(request);
    const fullName = deriveDisplayNameFromEmail(email);

    const { profile, isNew } = await registerProfileInDb(sessionId, {
      fullName,
      email,
      password,
      countryCode: countryCode ?? undefined,
      signupIp,
      wantsRecommendations: true,
      wantsWeeklyNewsletter: false,
    });

    if (!isNew && profile.session_id !== sessionId) {
      await transferSubscriptionBetweenSessions(profile.session_id, sessionId);
    }

    if (subscription) {
      const periodEnd = getSubscriptionPeriodEnd(subscription);
      await setSubscriptionInDb(sessionId, {
        status: subscription.status,
        planId,
        stripeSubscriptionId: subscription.id,
        periodEnd,
      });

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;

      if (customerId) {
        try {
          await stripe.customers.update(customerId, { email });
        } catch {
          /* non-blocking */
        }
      }

      try {
        await stripe.subscriptions.update(subscription.id, {
          metadata: {
            ...subscription.metadata,
            sessionId,
            planId,
            profileId: profile.id,
          },
        });
      } catch {
        /* non-blocking */
      }
    } else if (isActiveSubscription(sessionSub)) {
      await setSubscriptionInDb(sessionId, {
        status: sessionSub.status!,
        planId: sessionSub.planId!,
        stripeSubscriptionId: sessionSub.stripeSubscriptionId,
        periodEnd: sessionSub.periodEnd,
      });
    }

    await recordLoginEvent(profile.id, isNew ? "signup" : "email");

    const stripeSubscriptionId =
      subscription?.id ?? sessionSub.stripeSubscriptionId ?? "";

    if (!(await wasSubscriptionWelcomeSent(sessionId))) {
      try {
        await sendSubscriptionWelcomeEmail({
          to: email,
          subscriptionId: stripeSubscriptionId,
          planId,
        });
        await markSubscriptionWelcomeSent(sessionId);
      } catch (err) {
        console.error(
          "[toonlora] Subscription welcome email failed:",
          err instanceof Error ? err.message : err
        );
      }
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        countryCode: profile.country_code ?? "",
      },
      isNew,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    const friendly = message.includes("profiles_email_key")
      ? "This email is already registered. Sign in instead."
      : message;

    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
