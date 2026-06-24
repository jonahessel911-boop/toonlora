/** Dynamic story phase allocation for any episode length (3–25+). */

export const EPISODE_LENGTH_MIN = 3;
export const EPISODE_LENGTH_MAX = 25;

export const STORY_PHASES = [
  { id: "hook", label: "Hook", weight: 0.12 },
  { id: "personal_stakes", label: "Personal stakes", weight: 0.17 },
  { id: "pressure", label: "Pressure / complication", weight: 0.14 },
  { id: "choice_consequence", label: "Choice & consequence", weight: 0.22 },
  { id: "relationship_conflict", label: "Relationship conflict", weight: 0.1 },
  { id: "escalation_reveal", label: "Escalation / reveal", weight: 0.1 },
  { id: "emotional_low_point", label: "Emotional low point", weight: 0.08 },
  { id: "cliffhanger_payoff", label: "Cliffhanger / payoff", weight: 0.07 },
] as const;

export const SCENE_TYPE_OPTIONS = [
  "establishing scene",
  "close-up object scene",
  "conversation/conflict scene",
  "action or movement scene",
  "private emotional scene",
  "public pressure scene",
  "discovery scene",
  "decision scene",
  "consequence scene",
  "reveal scene",
  "cliffhanger scene",
] as const;

export function clampEpisodeLength(length: number): number {
  return Math.min(
    EPISODE_LENGTH_MAX,
    Math.max(EPISODE_LENGTH_MIN, Math.round(length) || 10)
  );
}

/** Assign one story phase per image slot for the requested episode length. */
export function allocatePhasesForLength(episodeLength: number): string[] {
  const n = clampEpisodeLength(episodeLength);

  if (n <= 4) {
    if (n === 1) return ["cliffhanger_payoff"];
    if (n === 2) return ["hook", "cliffhanger_payoff"];
    if (n === 3) return ["hook", "choice_consequence", "cliffhanger_payoff"];
    return ["hook", "personal_stakes", "choice_consequence", "cliffhanger_payoff"];
  }

  const phases: string[] = [];

  for (const phase of STORY_PHASES) {
    const count =
      phase.id === "cliffhanger_payoff"
        ? Math.max(1, Math.round(n * phase.weight))
        : Math.max(phase.id === "hook" ? 1 : 0, Math.round(n * phase.weight));
    for (let i = 0; i < count; i++) phases.push(phase.id);
  }

  while (phases.length < n) {
    phases.splice(Math.max(1, phases.length - 2), 0, "choice_consequence");
  }
  while (phases.length > n) {
    const idx = phases.findIndex(
      (p, i) => i > 0 && i < phases.length - 1 && p === "choice_consequence"
    );
    if (idx === -1) phases.pop();
    else phases.splice(idx, 1);
  }

  phases[0] = "hook";
  phases[phases.length - 1] = "cliffhanger_payoff";
  return phases;
}

export function buildPhaseAllocationGuide(episodeLength: number): string {
  const n = clampEpisodeLength(episodeLength);
  const assigned = allocatePhasesForLength(n);
  const phaseLines = assigned.map(
    (phase, i) => `  Image ${i + 1}: ${phase.replace(/_/g, " ")}`
  );

  let pacingNote: string;
  if (n <= 4) {
    pacingNote =
      "VERY SHORT EPISODE (3–4): Each image is one sharp story beat. Hook → pressure/choice → cliffhanger. Zero filler.";
  } else if (n <= 7) {
    pacingNote =
      "SHORT EPISODE (5–7): Every image must be extremely direct. One concrete event per image. No filler.";
  } else if (n <= 12) {
    pacingNote =
      "MEDIUM EPISODE (8–12): Balance hook, stakes, pressure, choices, reveal, low point, and cliffhanger.";
  } else {
    pacingNote =
      "LONG EPISODE (13–25): Add side-character beats, midpoint reversal, meaningful object callbacks, and escalating pressure — never mood filler.";
  }

  return `${pacingNote}

Required phase per image (${n} total):
${phaseLines.join("\n")}

Never use filler to match length. Deepen plot with concrete conflicts, objects, deadlines, and decisions.`;
}

export function narrationBoxCountForLength(episodeLength: number): string {
  const n = clampEpisodeLength(episodeLength);
  if (n <= 7) return "2–3 suggested copy lines per scene (5–14 words each, for draft notes only)";
  return "2–4 suggested copy lines per scene (5–14 words each, for draft notes only)";
}

export function maxRhetoricalQuestions(episodeLength: number): number {
  return Math.max(1, Math.ceil(clampEpisodeLength(episodeLength) / 5));
}
