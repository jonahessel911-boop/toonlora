"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getPlanTier,
  isPaidTier,
  type SubscriptionTierId,
} from "@/lib/payments/subscription-plans";
import { apiFetch } from "@/lib/session";

interface SubscriptionState {
  status: "none" | "active" | "cancelled" | "past_due" | "paused";
  planId: string | null;
  periodEnd: string | null;
  hydrated: boolean;
  setSubscription: (data: {
    status: SubscriptionState["status"];
    planId?: string | null;
    periodEnd?: string | null;
  }) => void;
  hydrate: () => Promise<void>;
  getTier: () => SubscriptionTierId;
  isSubscriber: () => boolean;
  isAchiever: () => boolean;
  isEntrepreneur: () => boolean;
  hasPaidAccess: () => boolean;
  clear: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      status: "none",
      planId: null,
      periodEnd: null,
      hydrated: false,
      setSubscription: (data) =>
        set({
          status: data.status,
          planId: data.planId ?? null,
          periodEnd: data.periodEnd ?? null,
          hydrated: true,
        }),
      hydrate: async () => {
        try {
          const res = await apiFetch("/api/subscription/status");
          if (!res.ok) return;
          const data = (await res.json()) as {
            active: boolean;
            planId: string | null;
            periodEnd: string | null;
            status: string | null;
            tier?: SubscriptionTierId;
          };
          set({
            status: data.active
              ? "active"
              : data.status === "cancelled"
                ? "cancelled"
                : data.status === "paused"
                  ? "paused"
                  : "none",
            planId: data.planId,
            periodEnd: data.periodEnd,
            hydrated: true,
          });
        } catch {
          set({ hydrated: true });
        }
      },
      getTier: () => {
        const { status, planId, periodEnd } = get();
        if (status !== "active") return "free";
        if (periodEnd && new Date(periodEnd).getTime() <= Date.now()) {
          return "free";
        }
        return getPlanTier(planId);
      },
      isSubscriber: () => get().hasPaidAccess(),
      isAchiever: () => {
        const tier = get().getTier();
        return tier === "achiever" || tier === "entrepreneur";
      },
      isEntrepreneur: () => get().getTier() === "entrepreneur",
      hasPaidAccess: () => isPaidTier(get().getTier()),
      clear: () =>
        set({
          status: "none",
          planId: null,
          periodEnd: null,
          hydrated: true,
        }),
    }),
    { name: "toonlora-subscription" }
  )
);
