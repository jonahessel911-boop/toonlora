export const TIER_BENEFITS = {
  free: [
    "1 chapter per week — completely free",
    "Public release schedule only",
    "Browse all business story categories",
  ],
  achiever: [
    "Unlimited chapters on the public schedule",
    "Every active story in the normal chapter line",
    "Ad-free reading on phone, tablet & desktop",
    "Save your library and reading progress",
  ],
  entrepreneur: [
    "Everything in Achiever",
    "New chapters 7 days before public release",
    "First access to flagship founder stories",
    "Book Drop & History series early",
  ],
} as const;

/** Legacy list — Achiever benefits for generic marketing copy */
export const TOONLORA_READING_BENEFITS = TIER_BENEFITS.achiever;
