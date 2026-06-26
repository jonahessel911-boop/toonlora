/** Homepage browse tabs — shared by Navbar and section anchors. */
export const HOME_BROWSE_NAV = [
  { id: "home", href: "/", label: "Home" },
  { id: "this-week", href: "/#this-week", label: "This Week" },
  { id: "founder-stories", href: "/#founder-stories", label: "Founder Stories" },
  { id: "rise-and-fall", href: "/#rise-and-fall", label: "Rise & Fall" },
  { id: "empires", href: "/#empires", label: "Empires" },
  { id: "heists-and-frauds", href: "/#heists-and-frauds", label: "Heists & Frauds" },
  {
    id: "company-breakdowns",
    href: "/#company-breakdowns",
    label: "Company Breakdowns",
  },
  { id: "history-drop", href: "/#history-drop", label: "History Drop" },
] as const;

export type HomeBrowseSectionId = (typeof HOME_BROWSE_NAV)[number]["id"];

/** Section blurbs for browse rails (no mock story cards). */
export const HOME_SECTION_SUBTITLES: Partial<Record<HomeBrowseSectionId, string>> = {
  "founder-stories":
    "The ambition, obsession, failures, and decisions behind the world's most famous entrepreneurs.",
  "rise-and-fall": "The climb to the top — and the crash that followed.",
  empires: "How the biggest brands on Earth were built — and kept.",
  "heists-and-frauds":
    "Billion-dollar bets, scams, and the people who got away with it.",
  "company-breakdowns":
    "How legendary companies were built, scaled, and sometimes destroyed.",
  "history-drop":
    "Pivotal moments in business history — illustrated chapter by chapter.",
};
