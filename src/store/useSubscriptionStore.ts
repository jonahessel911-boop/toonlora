"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/lib/session";

interface SubscriptionState {
  status: "none" | "active" | "cancelled" | "past_due";
  planId: string | null;
  periodEnd: string | null;
  hydrated: boolean;
  setSubscription: (data: {
    status: SubscriptionState["status"];
    planId?: string | null;
    periodEnd?: string | null;
  }) => void;
  hydrate: () => Promise<void>;
  isSubscriber: () => boolean;
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
          };
          set({
            status: data.active
              ? "active"
              : data.status === "cancelled"
                ? "cancelled"
                : "none",
            planId: data.planId,
            periodEnd: data.periodEnd,
            hydrated: true,
          });
        } catch {
          set({ hydrated: true });
        }
      },
      isSubscriber: () => {
        const { status, periodEnd } = get();
        if (status !== "active") return false;
        if (!periodEnd) return true;
        return new Date(periodEnd).getTime() > Date.now();
      },
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
