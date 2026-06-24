/** Homepage browse tabs — shared by Navbar and section anchors. */
export const HOME_BROWSE_NAV = [
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
