/** Reader-facing story topics (homepage browse + footer). */
export const PLATFORM_TOPICS = [
  {
    id: "business",
    label: "Business",
    genre: "Business",
    description: "Ambition, deals, and bold characters.",
  },
] as const;

export type PlatformTopicId = (typeof PLATFORM_TOPICS)[number]["id"];
