/** Display name per `/lp/{n}` lander (editable in admin). */
export interface LpLanderAngle {
  id: string;
  label: string;
}

/** One lander per path — no sub-angles by cover_title or URL params. */
export const LP_LANDER_ANGLES: Record<string, LpLanderAngle[]> = {
  "3": [{ id: "default", label: "Quiz funnel" }],
  "4": [{ id: "default", label: "LP4 hero" }],
  "5": [{ id: "default", label: "UGC lander" }],
};

export interface LpLanderContext {
  lpId: string;
  angleId: string;
  angleLabel: string;
  reportKey: string;
}

function defaultAngle(lpId: string): LpLanderAngle {
  const angles = LP_LANDER_ANGLES[lpId] ?? [];
  return (
    angles[0] ?? {
      id: "default",
      label: `LP ${lpId}`,
    }
  );
}

/** Resolve lander context — always one report bucket per `/lp/{n}`. */
export function resolveLpLanderContext(lpId: string): LpLanderContext {
  const angle = defaultAngle(lpId);
  return {
    lpId,
    angleId: angle.id,
    angleLabel: angle.label,
    reportKey: lpId,
  };
}

export function buildLpReportKey(lpId: string): string {
  return lpId;
}

export function getConfiguredAngleLabel(
  lpId: string,
  _angleId?: string
): string | undefined {
  return defaultAngle(lpId).label;
}
