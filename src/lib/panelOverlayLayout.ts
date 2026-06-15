import type { TextBubble } from "@/types/pipeline";

export type OverlayTail =
  | "left"
  | "right"
  | "bottom-left"
  | "bottom-right"
  | "none";

export type OverlayType = "speech" | "narration" | "sfx" | "thought";

export interface AvoidRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  reason?: string;
}

export interface PanelTextOverlay {
  id: string;
  type: OverlayType;
  speaker?: string;
  text: string;
  position: { x: number; y: number; width: number };
  tail?: OverlayTail;
  /** Estimated height as % of panel — used for overlap resolution */
  heightPct?: number;
}

interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_X = 4;
const MIN_Y = 4;
const MAX_Y = 92;
const MAX_WIDTH_SPEECH = 70;
const MAX_WIDTH_NARRATION = 78;
const MIN_WIDTH = 18;

const DEFAULT_AVOID: AvoidRegion[] = [
  { x: 20, y: 22, width: 60, height: 48, reason: "face-action" },
];

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function estimateHeightPct(type: OverlayType, text: string, width: number): number {
  const charsPerLine = Math.max(12, Math.floor(width * 0.55));
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  if (type === "sfx") return 7;
  if (type === "narration") return Math.min(22, 8 + lines * 4.5);
  return Math.min(28, 10 + lines * 5 + (type === "speech" ? 4 : 0));
}

function clampWidth(type: OverlayType, width: number): number {
  const max = type === "narration" ? MAX_WIDTH_NARRATION : MAX_WIDTH_SPEECH;
  return Math.min(max, Math.max(MIN_WIDTH, width));
}

function clampRect(rect: LayoutRect, type: OverlayType = "speech"): LayoutRect {
  const width = clampWidth(type, rect.width);
  let x = Math.max(MIN_X, Math.min(rect.x, 96 - width));
  let y = Math.max(MIN_Y, rect.y);
  const height = rect.height;
  if (y + height > MAX_Y) y = Math.max(MIN_Y, MAX_Y - height);
  return { x, y, width, height };
}

function rectsOverlap(a: LayoutRect, b: LayoutRect): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

function intersectsAvoid(rect: LayoutRect, regions: AvoidRegion[]): boolean {
  return regions.some((r) =>
    rectsOverlap(rect, { x: r.x, y: r.y, width: r.width, height: r.height })
  );
}

function tailFromSide(side: "left" | "right"): OverlayTail {
  return side === "right" ? "bottom-right" : "bottom-left";
}

function bubbleToType(b: TextBubble): OverlayType {
  if (b.type === "narration") return "narration";
  if (b.type === "sfx") return "sfx";
  return "speech";
}

function tailFromBubble(b: TextBubble): OverlayTail {
  const d = b.tail_direction;
  if (d === "bottom-right") return "bottom-right";
  if (d === "bottom-left") return "bottom-left";
  if (d === "top-right") return "right";
  if (d === "top-left") return "left";
  return "none";
}

function defaultPosition(
  type: OverlayType,
  index: number,
  panelIndex: number,
  speaker?: string
): { x: number; y: number; width: number } {
  if (type === "narration") {
    const top = index === 0;
    return {
      x: (100 - MAX_WIDTH_NARRATION) / 2,
      y: top ? 5 : 82,
      width: MAX_WIDTH_NARRATION,
    };
  }
  if (type === "sfx") {
    return { x: 72, y: 8, width: 22 };
  }
  const hash = (speaker ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rightSide = (panelIndex + index + hash) % 2 === 1;
  const width = 52;
  return {
    x: rightSide ? 96 - width - 4 : 4,
    y: 10 + index * 16,
    width,
  };
}

function normalizeBubble(b: TextBubble, panelIndex: number, index: number): PanelTextOverlay {
  const type = bubbleToType(b);
  const width = clampWidth(
    type,
    b.position?.width ?? (type === "narration" ? MAX_WIDTH_NARRATION : 52)
  );
  const hasPos = b.position && (b.position.x > 0 || b.position.y > 0);
  const base = hasPos
    ? {
        x: b.position.x - width / 2,
        y: b.position.y,
        width,
      }
    : defaultPosition(type, index, panelIndex, b.speaker);

  const heightPct = estimateHeightPct(type, b.text, width);
  const rect = clampRect({ ...base, height: heightPct }, type);

  return {
    id: `overlay-${panelIndex}-${index}`,
    type,
    speaker: b.speaker?.trim() || undefined,
    text: truncate(
      b.text,
      type === "narration" ? 140 : type === "sfx" ? 12 : 120
    ),
    position: { x: rect.x, y: rect.y, width: rect.width },
    tail: tailFromBubble(b),
    heightPct,
  };
}

function resolveOverlaps(
  items: PanelTextOverlay[],
  avoidRegions: AvoidRegion[]
): PanelTextOverlay[] {
  const placed: LayoutRect[] = [];
  const result: PanelTextOverlay[] = [];

  const sorted = [...items].sort((a, b) => {
    const order = { narration: 0, speech: 1, thought: 2, sfx: 3 };
    const ta = order[a.type] ?? 2;
    const tb = order[b.type] ?? 2;
    if (ta !== tb) return ta - tb;
    return a.position.y - b.position.y;
  });

  for (const item of sorted) {
    let rect: LayoutRect = {
      x: item.position.x,
      y: item.position.y,
      width: item.position.width,
      height: item.heightPct ?? estimateHeightPct(item.type, item.text, item.position.width),
    };

    let attempts = 0;
    while (attempts < 12) {
      rect = clampRect(rect, item.type);
      const conflicts = placed.some((p) => rectsOverlap(p, rect));
      const avoid = intersectsAvoid(rect, avoidRegions);

      if (!conflicts && !avoid) break;

      if (conflicts) {
        rect.y = Math.min(rect.y + 8, MAX_Y - rect.height);
      }
      if (avoid && item.type !== "narration") {
        if (rect.x < 50) {
          rect.x = MIN_X;
          rect.y = Math.max(MIN_Y, rect.y - 6);
        } else {
          rect.x = 96 - rect.width - MIN_X;
          rect.y = Math.max(MIN_Y, rect.y - 6);
        }
      }
      if (item.type === "narration") {
        rect.x = (100 - rect.width) / 2;
        if (rect.y > 40) rect.y = 5;
        else rect.y = Math.min(82, rect.y + 8);
      }
      attempts++;
    }

    rect = clampRect(rect, item.type);

    let tail = item.tail;
    if (item.type === "speech" && (!tail || tail === "none")) {
      tail = tailFromSide(rect.x < 40 ? "left" : "right");
    }

    result.push({
      ...item,
      position: { x: rect.x, y: rect.y, width: rect.width },
      heightPct: rect.height,
      tail,
    });
  }

  return result;
}

/** Layout text overlays for one panel — positions are % inside the panel only. */
export function layoutPanelOverlays(
  bubbles: TextBubble[],
  panelIndex: number,
  avoidRegions: AvoidRegion[] = DEFAULT_AVOID
): PanelTextOverlay[] {
  if (!bubbles.length) return [];

  const normalized = bubbles
    .filter((b) => b.text?.trim())
    .map((b, i) => normalizeBubble(b, panelIndex, i));

  const narrations = normalized.filter((o) => o.type === "narration").slice(0, 2);
  const speeches = normalized.filter((o) => o.type === "speech").slice(0, 4);
  const sfx = normalized.filter((o) => o.type === "sfx").slice(0, 1);

  const limited = [...narrations, ...speeches, ...sfx];
  return resolveOverlaps(limited, avoidRegions);
}

export function defaultAvoidRegions(): AvoidRegion[] {
  return DEFAULT_AVOID.map((r) => ({ ...r }));
}
