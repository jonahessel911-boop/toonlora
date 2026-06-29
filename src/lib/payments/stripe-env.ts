function readLiveModeFlag(): boolean | null {
  const flags = [
    process.env.NEXT_PUBLIC_STRIPE_USE_LIVE,
    process.env.STRIPE_USE_LIVE,
  ];

  for (const raw of flags) {
    const mode = raw?.trim().toLowerCase();
    if (mode === "true" || mode === "1" || mode === "live") return true;
    if (mode === "false" || mode === "0" || mode === "test") return false;
  }

  return null;
}

function shouldUseLiveStripe(): boolean {
  const explicit = readLiveModeFlag();
  if (explicit !== null) return explicit;

  const publishable =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE?.trim();
  if (publishable?.startsWith("pk_live_")) return true;
  if (publishable?.startsWith("pk_test_")) return false;

  return process.env.NODE_ENV === "production";
}

/** Stripe secret key — live in production (or when STRIPE_USE_LIVE=true). */
export function resolveStripeSecretKey(): string | undefined {
  if (shouldUseLiveStripe()) {
    return (
      process.env.STRIPE_SECRET_KEY_LIVE?.trim() ||
      process.env.STRIPE_SECRET_KEY?.trim()
    );
  }

  const test = process.env.STRIPE_SECRET_KEY_TEST?.trim();
  if (test) return test;
  return process.env.STRIPE_SECRET_KEY?.trim();
}

export function resolveStripePublishableKey(): string | undefined {
  if (shouldUseLiveStripe()) {
    return (
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE?.trim() ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
    );
  }

  const test = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST?.trim();
  if (test) return test;
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
}

export function isStripeLiveMode(): boolean {
  const secret = resolveStripeSecretKey();
  const publishable = resolveStripePublishableKey();
  if (secret?.startsWith("sk_live_") || publishable?.startsWith("pk_live_")) {
    return true;
  }
  return shouldUseLiveStripe();
}

export function assertStripeKeyModeMatch(): void {
  const secret = resolveStripeSecretKey();
  const publishable = resolveStripePublishableKey();
  if (!secret || !publishable) return;

  const secretLive = secret.startsWith("sk_live_");
  const publishableLive = publishable.startsWith("pk_live_");
  if (secretLive !== publishableLive) {
    throw new Error(
      "Stripe key mismatch: secret and publishable key must both be live or both be test."
    );
  }
}
