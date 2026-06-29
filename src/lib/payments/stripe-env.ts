/** Prefer Stripe test keys in non-production so local dev never charges live cards. */
export function resolveStripeSecretKey(): string | undefined {
  if (process.env.NODE_ENV !== "production") {
    const test = process.env.STRIPE_SECRET_KEY_TEST?.trim();
    if (test) return test;
  }
  return process.env.STRIPE_SECRET_KEY?.trim();
}

export function resolveStripePublishableKey(): string | undefined {
  if (process.env.NODE_ENV !== "production") {
    const test = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST?.trim();
    if (test) return test;
  }
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
}
