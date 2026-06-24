import type Stripe from "stripe";

/**
 * Stripe Checkout payment methods for recurring subscriptions.
 * Enable matching methods in Stripe Dashboard → Settings → Payment methods.
 * iDEAL / Bancontact collect the first payment and set up SEPA for renewals.
 */
export const STRIPE_SUBSCRIPTION_PAYMENT_METHODS: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
  ["card", "ideal", "bancontact", "sepa_debit", "link"];

/** One-time coin purchases — includes buy-now-pay-later where supported. */
export const STRIPE_ONE_TIME_PAYMENT_METHODS: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
  ["card", "ideal", "bancontact", "sepa_debit", "klarna", "link"];
