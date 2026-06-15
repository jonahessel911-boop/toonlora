import type { CharacterAppearance } from "@/lib/creator/characterAppearance";

export interface StyleOption {
  id: string;
  label: string;
  prompt: string;
}

export const FACE_OPTIONS: StyleOption[] = [
  { id: "soft", label: "Soft", prompt: "soft rounded face, gentle features" },
  { id: "sharp", label: "Sharp", prompt: "defined jawline, sharp features" },
  { id: "cute", label: "Cute", prompt: "cute youthful face, big eyes" },
  { id: "mature", label: "Mature", prompt: "mature elegant facial structure" },
  { id: "anime", label: "Anime", prompt: "anime-style expressive face" },
];

export const HAIR_OPTIONS: StyleOption[] = [
  { id: "short", label: "Short", prompt: "short cropped hair" },
  { id: "messy", label: "Messy", prompt: "messy textured hair" },
  { id: "long-wavy", label: "Long wavy", prompt: "long wavy hair" },
  { id: "ponytail", label: "Ponytail", prompt: "high ponytail" },
  { id: "bob", label: "Bob", prompt: "chin-length bob cut" },
  { id: "spiky", label: "Spiky", prompt: "spiky stylized hair" },
];

export const EYE_OPTIONS: StyleOption[] = [
  { id: "expressive", label: "Expressive", prompt: "large expressive eyes" },
  { id: "focused", label: "Focused", prompt: "focused narrow eyes" },
  { id: "dreamy", label: "Dreamy", prompt: "dreamy soft eyes" },
  { id: "intense", label: "Intense", prompt: "intense dramatic eyes" },
];

export const TOP_OPTIONS: StyleOption[] = [
  { id: "hoodie", label: "Hoodie", prompt: "casual hoodie" },
  { id: "crop-hoodie", label: "Crop hoodie", prompt: "cropped hoodie" },
  { id: "blazer", label: "Blazer", prompt: "fitted blazer jacket" },
  { id: "tshirt", label: "T-shirt", prompt: "plain t-shirt" },
  { id: "armor", label: "Light armor", prompt: "fantasy light armor top" },
  { id: "dress", label: "Dress", prompt: "stylish dress top" },
  { id: "jacket", label: "Street jacket", prompt: "streetwear bomber jacket" },
];

export const BOTTOM_OPTIONS: StyleOption[] = [
  { id: "jeans", label: "Jeans", prompt: "blue jeans" },
  { id: "skirt", label: "Skirt", prompt: "pleated skirt" },
  { id: "shorts", label: "Shorts", prompt: "casual shorts" },
  { id: "cargo", label: "Cargo pants", prompt: "cargo utility pants" },
  { id: "fantasy", label: "Fantasy pants", prompt: "fantasy adventurer pants" },
];

export const SHOES_OPTIONS: StyleOption[] = [
  { id: "sneakers", label: "Sneakers", prompt: "white sneakers" },
  { id: "boots", label: "Boots", prompt: "leather boots" },
  { id: "heels", label: "Heels", prompt: "stylish heels" },
  { id: "sandals", label: "Sandals", prompt: "casual sandals" },
];

export const ACCESSORY_OPTIONS: StyleOption[] = [
  { id: "none", label: "None", prompt: "" },
  { id: "backpack", label: "Backpack", prompt: "brown backpack" },
  { id: "scarf", label: "Scarf", prompt: "flowing scarf" },
  { id: "glasses", label: "Glasses", prompt: "round glasses" },
  { id: "crown", label: "Crown", prompt: "delicate crown" },
  { id: "earrings", label: "Earrings", prompt: "star earrings" },
];

export const SKIN_TONES = [
  "#FFDFC4",
  "#F5D0C5",
  "#E8B89D",
  "#D4A574",
  "#B87B4A",
  "#8D5524",
];

export const HAIR_COLORS = [
  "#1A1A1A",
  "#2C1810",
  "#3D2314",
  "#6B4423",
  "#D4A574",
  "#FFE033",
  "#FF6847",
  "#5340FF",
  "#22D3EE",
  "#FF4FA3",
];

export function findOption(options: StyleOption[], id: string): StyleOption | undefined {
  return options.find((o) => o.id === id);
}

export function appearanceToPrompt(
  appearance: CharacterAppearance,
  aiConcept?: string
): string {
  const face = findOption(FACE_OPTIONS, appearance.faceId)?.prompt ?? "";
  const hair = findOption(HAIR_OPTIONS, appearance.hairId)?.prompt ?? "";
  const eyes = findOption(EYE_OPTIONS, appearance.eyeId)?.prompt ?? "";
  const top = findOption(TOP_OPTIONS, appearance.topId)?.prompt ?? "";
  const bottom = findOption(BOTTOM_OPTIONS, appearance.bottomId)?.prompt ?? "";
  const shoes = findOption(SHOES_OPTIONS, appearance.shoesId)?.prompt ?? "";
  const acc = findOption(ACCESSORY_OPTIONS, appearance.accessoryId)?.prompt ?? "";

  const gender =
    appearance.gender === "woman"
      ? "young woman, feminine proportions"
      : "young man, masculine proportions";

  return [
    aiConcept,
    gender,
    `${appearance.bodyType} build`,
    face,
    `${hair}, ${appearance.hairColor} hair color`,
    eyes,
    `${top} in ${appearance.topColor}`,
    `${bottom} in ${appearance.bottomColor}`,
    shoes,
    acc,
    `skin tone ${appearance.skinTone}`,
  ]
    .filter(Boolean)
    .join(", ");
}

export function appearanceToOutfitSummary(appearance: CharacterAppearance): string {
  const top = findOption(TOP_OPTIONS, appearance.topId)?.label ?? "Top";
  const bottom = findOption(BOTTOM_OPTIONS, appearance.bottomId)?.label ?? "Bottom";
  const shoes = findOption(SHOES_OPTIONS, appearance.shoesId)?.label ?? "Shoes";
  const acc = findOption(ACCESSORY_OPTIONS, appearance.accessoryId);
  return [top, bottom, shoes, acc?.label].filter(Boolean).join(" · ");
}

/** Mock AI: nudge appearance based on a text prompt keyword. */
export function mockAiApplyPrompt(
  appearance: CharacterAppearance,
  prompt: string
): CharacterAppearance {
  const lower = prompt.toLowerCase();
  const next = { ...appearance };

  if (lower.includes("fantasy") || lower.includes("magic")) {
    next.topId = "armor";
    next.bottomId = "fantasy";
    next.accessoryId = "crown";
    next.accentColor = "#5340FF";
  }
  if (lower.includes("street") || lower.includes("urban")) {
    next.topId = "jacket";
    next.bottomId = "cargo";
    next.shoesId = "sneakers";
  }
  if (lower.includes("cute") || lower.includes("soft")) {
    next.faceId = "cute";
    next.hairId = appearance.gender === "woman" ? "bob" : "messy";
  }
  if (lower.includes("formal") || lower.includes("elegant")) {
    next.topId = "blazer";
    next.faceId = "mature";
  }
  if (lower.includes("anime")) {
    next.faceId = "anime";
    next.eyeId = "expressive";
    next.hairId = "spiky";
  }
  if (lower.includes("red") || lower.includes("coral")) {
    next.topColor = "#FF6847";
  }
  if (lower.includes("purple")) {
    next.topColor = "#5340FF";
  }
  if (lower.includes("dress")) {
    next.topId = "dress";
    next.bottomId = "skirt";
  }

  return next;
}

export function mockAiRandomizePart(
  appearance: CharacterAppearance,
  part: "face" | "hair" | "outfit" | "full"
): CharacterAppearance {
  const pick = <T extends { id: string }>(arr: T[]) =>
    arr[Math.floor(Math.random() * arr.length)]!.id;
  const pickColor = (arr: string[]) =>
    arr[Math.floor(Math.random() * arr.length)]!;

  const next = { ...appearance };
  if (part === "face" || part === "full") {
    next.faceId = pick(FACE_OPTIONS);
    next.eyeId = pick(EYE_OPTIONS);
  }
  if (part === "hair" || part === "full") {
    next.hairId = pick(HAIR_OPTIONS);
    next.hairColor = pickColor(HAIR_COLORS);
  }
  if (part === "outfit" || part === "full") {
    next.topId = pick(TOP_OPTIONS);
    next.bottomId = pick(BOTTOM_OPTIONS);
    next.shoesId = pick(SHOES_OPTIONS);
    next.accessoryId = pick(ACCESSORY_OPTIONS.filter((a) => a.id !== "none"));
    next.topColor = pickColor(HAIR_COLORS);
    next.bottomColor = pickColor(HAIR_COLORS);
  }
  return next;
}
