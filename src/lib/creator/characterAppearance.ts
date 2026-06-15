export type CharacterGender = "woman" | "man";

export type BodyType = "slim" | "athletic" | "curvy" | "broad";

export interface CharacterAppearance {
  gender: CharacterGender;
  bodyType: BodyType;
  skinTone: string;
  faceId: string;
  hairId: string;
  hairColor: string;
  eyeId: string;
  topId: string;
  bottomId: string;
  shoesId: string;
  accessoryId: string;
  topColor: string;
  bottomColor: string;
  shoesColor: string;
  accentColor: string;
}

export const DEFAULT_APPEARANCE_WOMAN: CharacterAppearance = {
  gender: "woman",
  bodyType: "slim",
  skinTone: "#F5D0C5",
  faceId: "soft",
  hairId: "long-wavy",
  hairColor: "#3D2314",
  eyeId: "expressive",
  topId: "crop-hoodie",
  bottomId: "jeans",
  shoesId: "sneakers",
  accessoryId: "none",
  topColor: "#5340FF",
  bottomColor: "#2A114B",
  shoesColor: "#FFFFFF",
  accentColor: "#FF4FA3",
};

export const DEFAULT_APPEARANCE_MAN: CharacterAppearance = {
  gender: "man",
  bodyType: "athletic",
  skinTone: "#E8B89D",
  faceId: "sharp",
  hairId: "messy",
  hairColor: "#2C1810",
  eyeId: "focused",
  topId: "hoodie",
  bottomId: "jeans",
  shoesId: "sneakers",
  accessoryId: "backpack",
  topColor: "#667085",
  bottomColor: "#1E3A5F",
  shoesColor: "#101828",
  accentColor: "#22D3EE",
};

export function defaultAppearance(gender: CharacterGender): CharacterAppearance {
  return gender === "woman"
    ? { ...DEFAULT_APPEARANCE_WOMAN }
    : { ...DEFAULT_APPEARANCE_MAN };
}
