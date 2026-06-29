"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  Stripe,
  StripeElements,
  StripeExpressCheckoutElement,
  StripePaymentElement,
} from "@stripe/stripe-js";
import { trackPaywallCheckoutClick } from "@/lib/analytics/gtag";
import { getStripeBrowser, isStripeBrowserConfigured } from "@/lib/payments/stripe-browser";
import { formatEur, planApplePayRecurringBilling, type SubscriptionPlan } from "@/lib/payments/subscription-plans";
import { apiFetch } from "@/lib/session";

type PaymentMethodId = "apple_pay" | "google_pay" | "card";

const RETURN_URL_BASE = "/subscribe/welcome";

function buildWelcomeUrl(subscriptionId?: string | null) {
  if (!subscriptionId) return RETURN_URL_BASE;
  return `${RETURN_URL_BASE}?subscriptionId=${encodeURIComponent(subscriptionId)}`;
}

function safeDestroyStripeElement(
  element: StripePaymentElement | StripeExpressCheckoutElement | null | undefined
) {
  if (!element) return;
  try {
    element.destroy();
  } catch {
    // Switching plans can trigger overlapping cleanups; Stripe throws if already destroyed.
  }
}

const ELEMENTS_APPEARANCE = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#2F80ED",
    borderRadius: "12px",
    fontFamily: "system-ui, sans-serif",
  },
};

function CardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.417 2.063-1.248 2.769-.885.748-1.944 1.117-3.045 1.053-.127-1.098.402-2.124 1.11-2.848.831-.872 2.183-1.508 3.183-1.574zM20.64 17.193c-.585 1.335-.865 1.932-1.618 3.115-1.049 1.623-2.527 3.646-4.365 3.662-1.032.012-1.637-.675-3.408-.675-1.772 0-2.428.662-3.434.687-2.182.045-3.845-2.222-4.894-3.838-2.665-4.172-2.952-9.075-1.301-11.676 1.17-1.785 3.022-2.882 4.768-2.882 1.112 0 2.158.742 3.255.742 1.063 0 2.401-.808 4.052-.69.69.03 2.627.278 3.867 2.093-.098.06-2.311 1.351-2.285 4.026.028 3.192 2.792 4.255 2.828 4.271z" />
    </svg>
  );
}

function GooglePayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

interface LP3CheckoutPaymentsProps {
  plan: SubscriptionPlan;
  email?: string;
  fullName?: string;
  checkoutError: string;
  onError: (message: string) => void;
  continueButton: React.ComponentType<{
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
  }>;
  legalFooter?: React.ReactNode;
}

export default function LP3CheckoutPayments({
  plan,
  email,
  fullName,
  checkoutError,
  onError,
  continueButton: ContinueButton,
  legalFooter,
}: LP3CheckoutPaymentsProps) {
  const t = useTranslations("paywall");
  const tCommon = useTranslations("common");

  const METHODS = [
    { id: "apple_pay" as const, label: t("applePay"), icon: <AppleIcon /> },
    { id: "google_pay" as const, label: t("googlePay"), icon: <GooglePayIcon /> },
    { id: "card" as const, label: t("creditCard"), icon: <CardIcon /> },
  ];

  const [method, setMethod] = useState<PaymentMethodId>("card");
  const [menuOpen, setMenuOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [intentLoading, setIntentLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [walletReady, setWalletReady] = useState(false);
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [stripeElements, setStripeElements] = useState<StripeElements | null>(null);

  const paymentElementRef = useRef<StripePaymentElement | null>(null);
  const expressCheckoutRef = useRef<StripeExpressCheckoutElement | null>(null);
  const cardMountRef = useRef<HTMLDivElement>(null);
  const walletMountRef = useRef<HTMLDivElement>(null);
  const stripeInstanceRef = useRef<Stripe | null>(null);
  const stripeElementsRef = useRef<StripeElements | null>(null);
  const clientSecretRef = useRef<string | null>(null);
  const subscriptionIdRef = useRef<string | null>(null);
  const planIdRef = useRef(plan.id);

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  planIdRef.current = plan.id;

  const selected = METHODS.find((m) => m.id === method) ?? METHODS[2]!;

  useEffect(() => {
    clientSecretRef.current = clientSecret;
  }, [clientSecret]);

  useEffect(() => {
    subscriptionIdRef.current = subscriptionId;
  }, [subscriptionId]);

  useEffect(() => {
    stripeInstanceRef.current = stripeInstance;
    stripeElementsRef.current = stripeElements;
  }, [stripeInstance, stripeElements]);

  useEffect(() => {
    if (!isStripeBrowserConfigured()) return;

    let cancelled = false;
    setIntentLoading(true);
    setClientSecret(null);
    setSubscriptionId(null);
    setStripeInstance(null);
    setStripeElements(null);
    setPaymentReady(false);
    setWalletReady(false);
    setPaying(false);
    onErrorRef.current("");

    void (async () => {
      try {
        const res = await apiFetch("/api/stripe/subscription-payment-intent", {
          method: "POST",
          body: JSON.stringify({
            planId: plan.id,
            email: email || undefined,
            fullName: fullName || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Could not start checkout"
          );
        }
        if (!cancelled) {
          setClientSecret(data.clientSecret as string);
          setSubscriptionId(
            typeof data.subscriptionId === "string" ? data.subscriptionId : null
          );
        }
      } catch (err) {
        if (!cancelled) {
          onErrorRef.current(
            err instanceof Error ? err.message : "Could not start checkout"
          );
        }
      } finally {
        if (!cancelled) setIntentLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [plan.id, email, fullName]);

  const confirmSubscriptionPayment = useCallback(async () => {
    const stripe = stripeInstanceRef.current;
    const elements = stripeElementsRef.current;
    const secret = clientSecretRef.current;
    if (!stripe || !elements || !secret) {
      throw new Error("Payment is not ready yet");
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      throw new Error(submitError.message ?? "Please check your payment details");
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret: secret,
      confirmParams: {
        return_url: `${window.location.origin}${buildWelcomeUrl(subscriptionIdRef.current)}`,
        payment_method_data: {
          billing_details: {
            email: email || undefined,
            name: fullName || undefined,
          },
        },
      },
      redirect: "if_required",
    });

    if (error) {
      throw new Error(error.message ?? "Payment failed");
    }

    const activeSubscriptionId = subscriptionIdRef.current;
    if (activeSubscriptionId) {
      const res = await apiFetch("/api/stripe/subscription-activate", {
        method: "POST",
        body: JSON.stringify({ subscriptionId: activeSubscriptionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Could not activate subscription"
        );
      }
      if (data.status !== "active" && data.status !== "trialing") {
        throw new Error("Subscription payment is still processing. Please wait.");
      }
    }

    window.location.href = buildWelcomeUrl(activeSubscriptionId);
  }, [email, fullName]);

  useEffect(() => {
    if (!clientSecret || !isStripeBrowserConfigured()) return;

    let cancelled = false;

    void (async () => {
      const stripe = await getStripeBrowser();
      if (!stripe || cancelled) return;

      const elements = stripe.elements({
        clientSecret,
        appearance: ELEMENTS_APPEARANCE,
      });

      if (!cancelled) {
        setStripeInstance(stripe);
        setStripeElements(elements);
      }
    })();

    return () => {
      cancelled = true;
      setStripeInstance(null);
      setStripeElements(null);
      setPaymentReady(false);
      setWalletReady(false);
    };
  }, [clientSecret]);

  const handleWalletConfirm = useCallback(async () => {
    trackPaywallCheckoutClick({ planId: planIdRef.current });
    setPaying(true);
    onErrorRef.current("");

    try {
      await confirmSubscriptionPayment();
    } catch (err) {
      setPaying(false);
      onErrorRef.current(
        err instanceof Error ? err.message : "Payment failed"
      );
    }
  }, [confirmSubscriptionPayment]);

  useEffect(() => {
    if (method !== "card") {
      safeDestroyStripeElement(paymentElementRef.current);
      paymentElementRef.current = null;
      setPaymentReady(false);
      return;
    }

    const elements = stripeElements;
    const cardNode = cardMountRef.current;
    if (!elements || !clientSecret || !cardNode) return;

    setPaymentReady(false);

    const paymentElement = elements.create("payment", {
      layout: "tabs",
      fields: {
        billingDetails: {
          email: "auto",
          name: "auto",
        },
      },
      wallets: {
        applePay: "never",
        googlePay: "never",
        link: "never",
      },
    });
    paymentElement.mount(cardNode);
    paymentElementRef.current = paymentElement;
    setPaymentReady(true);

    return () => {
      safeDestroyStripeElement(paymentElement);
      paymentElementRef.current = null;
      setPaymentReady(false);
    };
  }, [method, clientSecret, stripeElements]);

  useEffect(() => {
    const walletMethod =
      method === "apple_pay" || method === "google_pay" ? method : null;
    if (!walletMethod) {
      safeDestroyStripeElement(expressCheckoutRef.current);
      expressCheckoutRef.current = null;
      setWalletReady(false);
      return;
    }

    const elements = stripeElements;
    if (!elements || !clientSecret) return;

    let cancelled = false;
    let expressCheckout: StripeExpressCheckoutElement | null = null;

    const mountWallet = () => {
      const walletNode = walletMountRef.current;
      if (cancelled || !walletNode) return;

      setWalletReady(false);

      const expressBase = {
        buttonHeight: 48,
        emailRequired: true,
        layout: {
          maxColumns: 1,
          maxRows: 1,
        },
        link: "never",
        paypal: "never",
        amazonPay: "never",
      } as const;

      const isApplePay = walletMethod === "apple_pay";
      expressCheckout = elements.create("expressCheckout", {
        ...expressBase,
        buttonTheme: isApplePay
          ? { applePay: "black" }
          : { googlePay: "black" },
        ...(isApplePay
          ? {
              applePay: {
                recurringPaymentRequest: {
                  paymentDescription: `Toonlora ${plan.name} membership`,
                  managementURL: `${window.location.origin}/profile`,
                  regularBilling: planApplePayRecurringBilling(plan),
                },
              },
            }
          : {}),
        paymentMethods: {
          applePay: isApplePay ? "always" : "never",
          googlePay: isApplePay ? "never" : "always",
          link: "never",
          paypal: "never",
          amazonPay: "never",
        },
      });

      expressCheckout.on("ready", () => {
        setWalletReady(true);
      });

      expressCheckout.on("confirm", () => void handleWalletConfirm());
      expressCheckout.mount(walletNode);
      expressCheckoutRef.current = expressCheckout;
    };

    // Mount after the wallet container is visible in layout — hidden/off-screen
    // mounts prevent Google Pay from initializing in Chrome.
    requestAnimationFrame(() => {
      requestAnimationFrame(mountWallet);
    });

    return () => {
      cancelled = true;
      safeDestroyStripeElement(expressCheckout);
      expressCheckoutRef.current = null;
      setWalletReady(false);
    };
  }, [method, clientSecret, stripeElements, handleWalletConfirm, plan]);

  const confirmCardPayment = useCallback(async () => {
    if (!stripeInstance || !stripeElements || !clientSecret) return;

    trackPaywallCheckoutClick({ planId: plan.id });
    setPaying(true);
    onErrorRef.current("");

    try {
      await confirmSubscriptionPayment();
    } catch (err) {
      setPaying(false);
      onErrorRef.current(err instanceof Error ? err.message : "Payment failed");
    }
  }, [
    stripeInstance,
    stripeElements,
    clientSecret,
    plan.id,
    confirmSubscriptionPayment,
  ]);

  const checkoutReady = method === "card" ? paymentReady : walletReady;
  const formDisabled = paying || intentLoading || !clientSecret || !checkoutReady;
  const isWalletMethod = method === "apple_pay" || method === "google_pay";

  return (
    <div className="mt-4 space-y-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl border border-[#E7DDCC] bg-white px-4 py-3.5 text-left shadow-sm"
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
        >
          <span className="flex items-center gap-3 text-sm font-semibold text-[#0A1628]">
            <span className="text-[#475569]">{selected.icon}</span>
            {selected.label}
          </span>
          <span
            className={`text-[#64748B] transition ${menuOpen ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {menuOpen ? (
          <div
            className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-[#E7DDCC] bg-white shadow-lg"
            role="listbox"
          >
            {METHODS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={method === item.id}
                onClick={() => {
                  setMethod(item.id);
                  setMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-semibold transition hover:bg-[#F6F1E7] ${
                  method === item.id ? "bg-[#F6F1E7]/80" : ""
                }`}
              >
                <span className="flex items-center gap-3 text-[#0A1628]">
                  <span className="text-[#475569]">{item.icon}</span>
                  {item.label}
                </span>
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                    method === item.id
                      ? "border-[#0A1628] bg-[#0A1628]"
                      : "border-[#CBD5E1]"
                  }`}
                >
                  {method === item.id ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-[#E7DDCC] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E7DDCC] pb-3">
          <span className="text-sm font-bold text-[#0A1628]">{t("totalToday")}</span>
          <span className="font-heading text-lg font-extrabold text-[#2F80ED]">
            {formatEur(plan.amountCents)}
          </span>
        </div>

        {intentLoading || !checkoutReady ? (
          <p className="py-8 text-center text-sm text-[#64748B]">
            {method === "card"
              ? t("loadingPayment")
              : method === "google_pay"
                ? t("loadingGooglePay")
                : t("loadingApplePay")}
          </p>
        ) : null}

        {/* Off-screen mounts let Stripe measure buttons; active panel is shown below. */}
        <div
          className={method === "card" ? "mt-4 min-h-[200px]" : "hidden"}
          aria-hidden={method !== "card"}
        >
          <div ref={cardMountRef} className="min-h-[200px]" />
        </div>

        <div
          className={isWalletMethod ? "mt-4 min-h-[52px] w-full" : "hidden"}
          aria-hidden={!isWalletMethod}
        >
          <div ref={walletMountRef} className="min-h-[52px] w-full" />
        </div>

        {method === "card" ? (
          <div className="mt-4 space-y-3">
            <ContinueButton
              onClick={() => void confirmCardPayment()}
              disabled={formDisabled}
            >
                {paying ? tCommon("processing") : t("startReadingToday")}
            </ContinueButton>
            {legalFooter}
          </div>
        ) : null}

      </div>

      {!isStripeBrowserConfigured() ? (
        <p className="text-center text-xs text-amber-700">
          Stripe is not configured — add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
        </p>
      ) : null}

      {checkoutError ? (
        <p className="text-center text-sm text-rose-600">{checkoutError}</p>
      ) : null}
    </div>
  );
}
