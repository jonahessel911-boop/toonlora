"use client";

import { useState } from "react";
import { COIN_PACKAGES } from "@/lib/payments/coin-packages";
import { apiFetch } from "@/lib/session";
import { useCreditsStore } from "@/store/useCreditsStore";

interface CoinsShopProps {
  purchaseStatus?: "success" | "cancelled" | null;
  onDismissStatus?: () => void;
  embedded?: boolean;
}

export default function CoinsShop({
  purchaseStatus,
  onDismissStatus,
  embedded = false,
}: CoinsShopProps) {
  const { credits, hydrate } = useCreditsStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleBuy = async (packageId: string) => {
    setLoadingId(packageId);
    setError("");
    try {
      const res = await apiFetch("/api/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Checkout failed");
      }
      if (data.url) {
        window.location.href = data.url as string;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoadingId(null);
    }
  };

  return (
    <div className={embedded ? "space-y-6" : "mx-auto max-w-3xl space-y-6"}>
      {purchaseStatus === "success" ? (
        <div className="flex items-start justify-between gap-4 rounded-[24px] border border-[#B8F5C8] bg-[#ECFDF3] px-5 py-4">
          <div>
            <p className="font-heading text-base font-extrabold text-[#027A48]">
              Payment successful
            </p>
            <p className="mt-1 text-sm text-[#027A48]/80">
              Your coins have been added to your balance.
            </p>
          </div>
          {onDismissStatus ? (
            <button
              type="button"
              onClick={onDismissStatus}
              className="shrink-0 text-sm font-semibold text-[#027A48]"
            >
              Dismiss
            </button>
          ) : null}
        </div>
      ) : null}

      {purchaseStatus === "cancelled" ? (
        <div className="flex items-start justify-between gap-4 rounded-[24px] border border-[#E7D8FF] bg-white px-5 py-4">
          <p className="text-sm text-[#667085]">Payment cancelled — no coins were charged.</p>
          {onDismissStatus ? (
            <button
              type="button"
              onClick={onDismissStatus}
              className="shrink-0 text-sm font-semibold text-[#5340FF]"
            >
              Dismiss
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-[32px] border border-[#E7D8FF] bg-gradient-to-br from-white via-[#F3ECFF]/40 to-[#E9D8FD]/30 p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#667085]">
              Your balance
            </p>
            <p className="mt-2 font-heading text-4xl font-extrabold text-[#5340FF]">
              {credits}{" "}
              <span className="text-2xl text-[#2A114B]">coins</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => void hydrate()}
            className="rounded-xl border border-[#E7D8FF] bg-white px-4 py-2 text-xs font-bold text-[#5340FF]"
          >
            Refresh balance
          </button>
        </div>
        <p className="mt-4 max-w-xl text-sm text-[#667085]">
          Use coins to generate characters, comic panels, and covers in Lora Studio.
          Payments are processed securely via Stripe.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {COIN_PACKAGES.map((pkg) => {
          const isLoading = loadingId === pkg.id;
          const perCoin = (pkg.amountCents / 100 / pkg.coins).toFixed(2).replace(".", ",");

          return (
            <button
              key={pkg.id}
              type="button"
              disabled={Boolean(loadingId)}
              onClick={() => void handleBuy(pkg.id)}
              className={`relative flex flex-col rounded-[28px] border-2 bg-white p-5 text-left transition hover:border-[#5340FF]/40 hover:shadow-[0_8px_24px_rgba(83,64,255,0.12)] disabled:opacity-60 ${
                pkg.popular
                  ? "border-[#5340FF] shadow-[0_8px_24px_rgba(83,64,255,0.15)]"
                  : "border-[#E7D8FF]"
              }`}
            >
              {pkg.popular ? (
                <span className="absolute -top-3 left-4 rounded-full bg-[#5340FF] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Best value
                </span>
              ) : null}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-3xl font-extrabold text-[#2A114B]">
                    {pkg.coins}
                  </p>
                  <p className="text-sm font-semibold text-[#667085]">coins</p>
                </div>
                <p className="font-heading text-2xl font-extrabold text-[#5340FF]">
                  {pkg.priceLabel}
                </p>
              </div>

              <p className="mt-4 text-xs text-[#667085]">≈ €{perCoin} per coin</p>

              <span className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#5340FF] py-3 text-sm font-bold text-white">
                {isLoading ? "Redirecting to Stripe…" : "Buy with Stripe"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-[#667085]">
        Secure checkout powered by Stripe. Coins are added automatically after payment.
      </p>
    </div>
  );
}
