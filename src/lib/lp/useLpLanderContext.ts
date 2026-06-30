"use client";

import { useMemo } from "react";
import {
  resolveLpLanderContext,
  type LpLanderContext,
} from "@/lib/lp/landerAngles";

export function useLpLanderContext(lpId: string): LpLanderContext {
  return useMemo(() => resolveLpLanderContext(lpId), [lpId]);
}
