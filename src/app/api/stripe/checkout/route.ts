import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { getCoinPackage } from "@/lib/payments/coin-packages";
import { getSiteUrl, getStripe, isStripeConfigured } from "@/lib/services/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY to your environment." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const packageId = body.packageId as string | undefined;
    const pkg = packageId ? getCoinPackage(packageId) : undefined;

    if (!pkg) {
      return NextResponse.json({ error: "Invalid coin package" }, { status: 400 });
    }

    const sessionId = getSessionFromRequest(request);
    const stripe = getStripe();
    const siteUrl = getSiteUrl();

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "ideal", "klarna"],
      billing_address_collection: "auto",
      locale: "nl",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: pkg.amountCents,
            product_data: {
              name: `${pkg.coins} Toonlora Coins`,
              description: "Coins for Lora Studio — generate characters, panels, and covers.",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        sessionId,
        coins: String(pkg.coins),
        packageId: pkg.id,
      },
      success_url: `${siteUrl}/creator?section=settings&purchase=success`,
      cancel_url: `${siteUrl}/creator?section=settings&purchase=cancelled`,
    });

    if (!checkout.url) {
      return NextResponse.json(
        { error: "Could not create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Checkout session failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
