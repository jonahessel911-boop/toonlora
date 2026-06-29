import type Stripe from "stripe";
import type { SubscriptionPlan } from "@/lib/payments/subscription-plans";
import { resolveRecurringPriceId } from "@/lib/payments/stripe-subscription-price";

export async function createSubscriptionPaymentIntent(
  stripe: Stripe,
  params: {
    sessionId: string;
    plan: SubscriptionPlan;
    customerId: string;
  }
): Promise<{ clientSecret: string; subscriptionId: string }> {
  const priceId = await resolveRecurringPriceId(stripe, params.plan);

  const subscription = await stripe.subscriptions.create({
    customer: params.customerId,
    items: [{ price: priceId }],
    collection_method: "charge_automatically",
    payment_behavior: "default_incomplete",
    billing_mode: { type: "flexible" },
    payment_settings: {
      save_default_payment_method: "on_subscription",
      payment_method_types: ["card"],
    },
    expand: ["latest_invoice.confirmation_secret"],
    metadata: {
      sessionId: params.sessionId,
      planId: params.plan.id,
    },
  });

  const invoice = subscription.latest_invoice;
  if (!invoice || typeof invoice === "string") {
    throw new Error("Could not create subscription invoice");
  }

  let clientSecret = invoice.confirmation_secret?.client_secret;

  if (!clientSecret) {
    const refreshed = await stripe.invoices.retrieve(invoice.id, {
      expand: ["confirmation_secret"],
    });
    clientSecret = refreshed.confirmation_secret?.client_secret;
  }

  if (!clientSecret) {
    const payments = await stripe.invoicePayments.list({
      invoice: invoice.id,
      expand: ["data.payment.payment_intent"],
    });
    const paymentIntent = payments.data[0]?.payment?.payment_intent;
    if (paymentIntent && typeof paymentIntent !== "string") {
      clientSecret = paymentIntent.client_secret ?? undefined;
    }
  }

  if (!clientSecret) {
    throw new Error("Missing payment client secret");
  }

  return { clientSecret, subscriptionId: subscription.id };
}

export async function resolveOrCreateStripeCustomer(
  stripe: Stripe,
  params: {
    sessionId: string;
    email?: string;
    fullName?: string;
    existingCustomerId?: string;
  }
): Promise<string> {
  if (params.existingCustomerId) {
    return params.existingCustomerId;
  }

  const email = params.email?.trim().toLowerCase();
  const fullName = params.fullName?.trim() || undefined;

  if (email) {
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer = existing.data[0];
    if (customer) {
      await stripe.customers.update(customer.id, {
        ...(fullName ? { name: fullName } : {}),
        metadata: { ...customer.metadata, sessionId: params.sessionId },
      });
      return customer.id;
    }
  }

  const created = await stripe.customers.create({
    email: email || undefined,
    name: fullName,
    metadata: { sessionId: params.sessionId },
  });
  return created.id;
}
