import type Stripe from "stripe";
import {
  planStripeLookupKey,
  subscriptionStripePriceData,
  type SubscriptionPlan,
} from "@/lib/payments/subscription-plans";

function isLookupKeyCollision(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /lookup[_ ]key/i.test(message);
}

async function findPriceByLookupKey(
  stripe: Stripe,
  lookupKey: string
): Promise<Stripe.Price | null> {
  const listed = await stripe.prices.list({
    lookup_keys: [lookupKey],
    limit: 1,
  });
  if (listed.data[0]) return listed.data[0];

  try {
    const searched = await stripe.prices.search({
      query: `lookup_key:'${lookupKey}'`,
      limit: 1,
    });
    return searched.data[0] ?? null;
  } catch {
    return null;
  }
}

/** Reuse an existing Stripe recurring price instead of creating duplicates. */
export async function resolveRecurringPriceId(
  stripe: Stripe,
  plan: SubscriptionPlan
): Promise<string> {
  const lookupKey = planStripeLookupKey(plan);
  const existing = await findPriceByLookupKey(stripe, lookupKey);

  if (
    existing?.type === "recurring" &&
    existing.unit_amount === plan.amountCents
  ) {
    if (!existing.active) {
      await stripe.prices.update(existing.id, { active: true });
    }
    return existing.id;
  }

  if (existing?.lookup_key === lookupKey) {
    await stripe.prices.update(existing.id, {
      lookup_key: "",
      active: false,
    });
  }

  try {
    const price = await stripe.prices.create({
      ...subscriptionStripePriceData(plan),
      active: true,
    });

    if (price.type !== "recurring" || !price.recurring) {
      throw new Error("Could not create recurring subscription price");
    }

    return price.id;
  } catch (err) {
    if (isLookupKeyCollision(err)) {
      const retry = await findPriceByLookupKey(stripe, lookupKey);
      if (retry?.type === "recurring") {
        return retry.id;
      }
    }
    throw err;
  }
}
