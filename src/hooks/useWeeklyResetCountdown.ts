"use client";

import { useEffect, useState } from "react";
import {
  formatWeeklyResetCountdown,
  msUntilWeeklyFreeResetFromClaim,
} from "@/lib/payments/subscription-access";

function msUntilReset(resetsAt: string | null | undefined): number {
  if (!resetsAt) return 0;
  return Math.max(0, new Date(resetsAt).getTime() - Date.now());
}

/**
 * Countdown until the user's free extra-chapter read resets.
 * Pass `weeklyFreeResetsAt` from `/api/reader/episode-access`.
 */
export function useWeeklyResetCountdown(
  active: boolean,
  weeklyFreeResetsAt?: string | null
): string {
  const [label, setLabel] = useState(() =>
    active ? formatWeeklyResetCountdown(msUntilReset(weeklyFreeResetsAt)) : ""
  );

  useEffect(() => {
    if (!active) return;

    const tick = () => {
      setLabel(formatWeeklyResetCountdown(msUntilReset(weeklyFreeResetsAt)));
    };

    tick();
    const intervalMs = msUntilReset(weeklyFreeResetsAt) < 60 * 60 * 1000 ? 1000 : 60_000;
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [active, weeklyFreeResetsAt]);

  return label;
}

/** @deprecated Use msUntilReset with weeklyFreeResetsAt */
export { msUntilWeeklyFreeResetFromClaim };
