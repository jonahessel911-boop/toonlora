"use client";

import { useEffect, useState } from "react";
import {
  formatWeeklyResetCountdown,
  msUntilWeeklyFreeReset,
} from "@/lib/payments/subscription-access";

export function useWeeklyResetCountdown(active: boolean): string {
  const [label, setLabel] = useState(() =>
    active ? formatWeeklyResetCountdown(msUntilWeeklyFreeReset()) : ""
  );

  useEffect(() => {
    if (!active) return;

    const tick = () => {
      setLabel(formatWeeklyResetCountdown(msUntilWeeklyFreeReset()));
    };

    tick();
    const intervalMs = msUntilWeeklyFreeReset() < 60 * 60 * 1000 ? 1000 : 60_000;
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [active]);

  return label;
}
