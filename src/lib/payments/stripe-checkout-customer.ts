import type Stripe from "stripe";

export interface CheckoutCustomerInput {
  sessionId: string;
  email?: string;
  fullName?: string;
}

/** Reuse or create a Stripe Customer so Checkout can prefill email and name. */
export async function resolveStripeCustomerId(
  stripe: Stripe,
  input: CheckoutCustomerInput
): Promise<string | undefined> {
  const email = input.email?.trim().toLowerCase();
  if (!email) return undefined;

  const fullName = input.fullName?.trim() || undefined;
  const existing = await stripe.customers.list({ email, limit: 1 });
  const customer = existing.data[0];

  if (customer) {
    await stripe.customers.update(customer.id, {
      ...(fullName ? { name: fullName } : {}),
      metadata: { ...customer.metadata, sessionId: input.sessionId },
    });
    return customer.id;
  }

  const created = await stripe.customers.create({
    email,
    name: fullName,
    metadata: { sessionId: input.sessionId },
  });
  return created.id;
}
